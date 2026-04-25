import Anthropic from '@anthropic-ai/sdk';

const INTAKE_SYSTEM_PROMPT = `You are a claims intake validation specialist. You receive structured FNOL (First Notice of Loss) data already collected from the claimant during an intake call. Your job is NOT to extract information — it has already been captured. Your job is to validate it: check for completeness, consistency, and plausibility, and flag anything that needs attention before the claim moves to investigation.

Always respond in valid JSON with these exact fields:
validation_status (Pass/Needs Review/Fail),
data_completeness (High/Medium/Low),
claim_type (auto/property/liability/medical/other — confirm or correct based on the data),
incident_date_mentioned (true/false),
police_report_mentioned (true/false),
injuries_reported (true/false),
third_party_involved (true/false),
claim_summary (plain English 2-sentence summary of what happened based on the structured data),
inconsistencies (array of specific data conflicts or implausible details found, empty array if none),
missing_critical_fields (array of important fields that are blank or insufficient, empty array if none),
recommended_verifications (array of specific items that should be independently verified before proceeding, empty array if none),
intake_confidence (High/Medium/Low).
Nothing else — only valid JSON.`;

const FRAUD_SYSTEM_PROMPT = `You are a senior insurance fraud investigator with 20 years of experience. You receive structured FNOL data and a validation report from the intake agent. Your job is to identify fraud signals. Always respond in valid JSON with these exact fields: fraud_risk_score (1-10 where 10 is highest risk), fraud_risk_level (Low/Moderate/High/Critical), fraud_signals (array of specific signals found, empty array if none), red_flags (array of specific red flags requiring investigation, empty array if none), fraud_patterns_matched (array of known fraud patterns this claim resembles, empty array if none), investigator_recommendation (Monitor/Standard Processing/Enhanced Review/Refer to SIU), confidence_level (High/Medium/Low). Nothing else — only valid JSON.`;

const SETTLEMENT_SYSTEM_PROMPT = `You are a senior claims settlement specialist. You receive structured FNOL data, an intake validation report, and fraud investigation results. Your job is to recommend a settlement approach. Always respond in valid JSON with these exact fields: recommended_action (one of: Approve for Fast Track/Assign to Handler/Request Additional Information/Enhanced Investigation/Refer to Legal/Decline), priority_level (Critical/High/Standard/Low), estimated_complexity (Simple/Moderate/Complex/Highly Complex), required_documents (array of documents needed), recommended_next_steps (array of specific next steps in order), special_considerations (array of anything unusual requiring attention, empty array if none), settlement_timeline_estimate (string like '5-7 business days'), handler_notes (plain English paragraph summarising everything for the claims handler). Nothing else — only valid JSON.`;

function formatFNOL(d) {
  const lines = [
    'FIRST NOTICE OF LOSS — STRUCTURED INTAKE DATA',
    '',
    'CLAIMANT',
    `Name: ${d.firstName} ${d.lastName}`,
    `Date of Birth: ${d.dateOfBirth}`,
    `Address: ${d.address}, ${d.city}, ${d.province} ${d.postalCode}`,
    `Phone: ${d.phone}`,
    `Email: ${d.email || 'Not provided'}`,
    '',
    'POLICY',
    `Policy Number: ${d.policyNumber}`,
    `Claim Type: ${d.claimType}`,
    '',
    'INCIDENT',
    `Date of Loss: ${d.dateOfLoss}`,
    `Time of Loss: ${d.timeOfLoss || 'Not provided'}`,
    `Location: ${d.locationOfLoss}`,
  ];

  if (d.claimType === 'auto') {
    lines.push('', 'VEHICLE');
    lines.push(`Year / Make / Model: ${d.vehicleYear} ${d.vehicleMake} ${d.vehicleModel}`);
    lines.push(`Plate: ${d.vehiclePlate || 'Not provided'}`);
    lines.push(`VIN: ${d.vehicleVIN || 'Not provided'}`);
  }

  lines.push('', 'PEOPLE INVOLVED');
  lines.push(`Injuries Reported: ${d.injuriesReported ? 'Yes' : 'No'}`);
  if (d.injuriesReported && d.injuryDetails) lines.push(`Injury Details: ${d.injuryDetails}`);
  lines.push(`Third Party Involved: ${d.thirdPartyInvolved ? 'Yes' : 'No'}`);
  if (d.thirdPartyInvolved && d.thirdPartyDetails) lines.push(`Third Party Details: ${d.thirdPartyDetails}`);

  lines.push('', 'ATTENDING SERVICES');
  lines.push(`Police Attended: ${d.policeAttended ? 'Yes' : 'No'}`);
  if (d.policeAttended && d.policeReportNumber) lines.push(`Police Report Number: ${d.policeReportNumber}`);
  lines.push(`Fire / EMS Attended: ${d.fireEmsAttended ? 'Yes' : 'No'}`);

  lines.push('', 'INCIDENT DESCRIPTION');
  lines.push(d.incidentDescription);

  return lines.join('\n');
}

function parseAgentJSON(raw, agentName) {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`${agentName} response was truncated before the JSON could be completed. Try again.`);
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fnolData } = req.body;

  if (!fnolData || !fnolData.incidentDescription?.trim()) {
    return res.status(400).json({ error: 'FNOL data is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders?.();

  const sendEvent = (data) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const fnolText = formatFNOL(fnolData);

  try {
    // Agent 1 — Intake Validation
    sendEvent({ type: 'agent_start', agent: 1, message: 'Intake Agent validating FNOL data...' });

    let agent1Text = '';
    const agent1Stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: INTAKE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: fnolText }],
      stream: true,
    });
    for await (const event of agent1Stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        agent1Text += event.delta.text;
        sendEvent({ type: 'agent_chunk', agent: 1, content: event.delta.text });
      }
    }
    const agent1Result = parseAgentJSON(agent1Text, 'Intake Agent');
    const agent1Raw = agent1Text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    sendEvent({ type: 'agent_complete', agent: 1, result: agent1Result });

    // Agent 2 — Fraud Detection
    sendEvent({ type: 'agent_start', agent: 2, message: 'Fraud Detection Agent scanning for anomalies...' });

    let agent2Text = '';
    const agent2Prompt = `FNOL structured data:\n${fnolText}\n\nIntake validation result:\n${agent1Raw}`;
    const agent2Stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: FRAUD_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: agent2Prompt }],
      stream: true,
    });
    for await (const event of agent2Stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        agent2Text += event.delta.text;
        sendEvent({ type: 'agent_chunk', agent: 2, content: event.delta.text });
      }
    }
    const agent2Result = parseAgentJSON(agent2Text, 'Fraud Detection Agent');
    const agent2Raw = agent2Text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    sendEvent({ type: 'agent_complete', agent: 2, result: agent2Result });

    // Agent 3 — Settlement
    sendEvent({ type: 'agent_start', agent: 3, message: 'Settlement Agent formulating recommendation...' });

    let agent3Text = '';
    const agent3Prompt = `FNOL structured data:\n${fnolText}\n\nIntake validation:\n${agent1Raw}\n\nFraud investigation:\n${agent2Raw}`;
    const agent3Stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SETTLEMENT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: agent3Prompt }],
      stream: true,
    });
    for await (const event of agent3Stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        agent3Text += event.delta.text;
        sendEvent({ type: 'agent_chunk', agent: 3, content: event.delta.text });
      }
    }
    const agent3Result = parseAgentJSON(agent3Text, 'Settlement Agent');
    sendEvent({ type: 'agent_complete', agent: 3, result: agent3Result });

    sendEvent({ type: 'complete' });
  } catch (error) {
    console.error('Investigation error:', error);
    sendEvent({ type: 'error', message: error.message || 'An unexpected error occurred' });
  } finally {
    if (!res.writableEnded) res.end();
  }
}
