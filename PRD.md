# AI Claim Investigation System
## Product Requirements Document v1.0

---

## Problem statement
Insurance claims investigation is a multi-step process 
that requires different types of expertise applied 
sequentially — intake, fraud detection, and settlement 
recommendation. Today this process involves multiple 
handoffs between human specialists, takes days, and 
is inconsistent depending on who handles the claim.

The cost of getting it wrong is high. Missed fraud 
signals cost insurers billions annually. Slow 
investigation frustrates claimants. Inconsistent 
recommendations create legal and regulatory exposure.

---

## Target users

Primary — Claims handlers at P&C insurers
They receive high volumes of claims daily and need 
faster, more consistent first-pass investigation 
before assigning to a specialist.

Secondary — Claims operations managers
They need visibility into claim complexity and fraud 
risk across their portfolio to allocate resources 
effectively.

Tertiary — SIU (Special Investigations Unit) teams
They need claims pre-screened and escalated with 
evidence before they invest investigation time.

---

## User needs
1. Read a claim description and instantly understand 
   what happened and what is missing
2. Know the fraud risk level before assigning a handler
3. Get a recommended next action without having to 
   read the full claim themselves
4. See all required documents in one place
5. Have a clear timeline estimate for the claim
6. Watch the investigation happen in real time so 
   they trust the output

---

## Solution
A multi-agent AI pipeline where three specialised 
Claude agents investigate a claim sequentially:

Agent 1 — Intake Agent
Extracts structured data from the claim description.
Identifies claim type, key facts, and missing 
information.

Agent 2 — Fraud Detection Agent
Receives Agent 1 output and original claim text.
Analyses for fraud signals and patterns.
Assigns a fraud risk score from 1 to 10.
Recommends investigation approach.

Agent 3 — Settlement Recommendation Agent
Receives Agent 1 and Agent 2 outputs.
Produces recommended action, priority level,
required documents, next steps, and handler notes.

Each agent has a specialised system prompt, defined 
input schema, and structured JSON output. Agent 
outputs are chained — each agent is smarter because 
of what the previous one found.

---

## ML capabilities used
| Capability | Agent | Purpose |
|---|---|---|
| Named entity recognition | Agent 1 | Extract claim facts |
| Classification | Agent 1 | Claim type assignment |
| Anomaly detection | Agent 2 | Fraud signal identification |
| Pattern matching | Agent 2 | Known fraud pattern recognition |
| Decision support | Agent 3 | Settlement recommendation |
| Multi-agent orchestration | Pipeline | Sequential agent chaining |

---

## Key product decisions

**Why three agents instead of one**
A single agent asked to do intake, fraud detection, 
and settlement recommendation produces lower quality 
output on all three. Specialisation improves accuracy. 
Each agent does one job and does it well. This mirrors 
how real claims teams work — different specialists, 
different expertise.

**Why structured JSON output from each agent**
JSON output allows clean, reliable data passing 
between agents. It also makes the output auditable — 
every decision is traceable and explainable. This is 
critical for regulatory compliance.

**Why real time pipeline visualisation**
Claims handlers need to trust the output. Watching 
three agents investigate a claim live — seeing each 
one activate, process, and complete — builds trust 
in a way that a static result never could. The process 
is the proof.

**Why sequential not parallel**
Agent 2 needs Agent 1's structured output to do its 
job properly. Agent 3 needs both. Parallel processing 
would require each agent to re-interpret the raw claim 
text independently which reduces accuracy and 
consistency.

---

## Product versions

### v1 — Current build
- Three agent sequential pipeline
- Live pipeline visualisation
- Consolidated final report
- Pre-populated test claim
- Deployed on Vercel

### v2 — Roadmap
- Claims history input — allow handler to paste 
  prior claims from same claimant for pattern analysis
- Confidence calibration — flag when agents disagree 
  and explain why
- Audit trail — exportable JSON log of every agent 
  decision for regulatory review
- Batch processing — investigate multiple claims 
  simultaneously
- Feedback loop — handler marks outcome, system 
  learns over time

### v3 — Future vision
- Integration with Guidewire ClaimCenter or Duck Creek
- Automatic document request generation and tracking
- SIU referral workflow with case file creation
- Real time fraud pattern updates from industry data

---

## Success metrics for v1
- All three agents complete investigation in under 
  60 seconds
- Fraud risk score matches domain expert assessment 
  in stress testing
- Settlement recommendation aligns with standard 
  claims handling guidelines
- Zero hallucinated facts not present in the original 
  claim description
- Pipeline visualisation renders correctly on mobile

---

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Agent 1 misclassifies claim type | Agent 3 includes confidence level — handler reviews low confidence outputs |
| Agent 2 generates false positive fraud flags | Fraud signals listed explicitly — handler can review evidence before acting |
| Agent 3 recommends wrong settlement approach | Recommendation framed as input to human decision not a final decision |
| API latency makes pipeline feel slow | Streaming responses shown as they arrive — user sees progress immediately |
| Hallucinated facts in agent outputs | Each agent instructed to base output only on information provided |

---

## Regulatory and compliance considerations
- All outputs framed as decision support not final 
  decisions — human handler retains authority
- Fraud referral to SIU requires human review before 
  action — never automated
- Explainability maintained through structured JSON 
  audit trail
- No personal identifiers stored — claim descriptions 
  processed and discarded
- PIPEDA compliance required for Canadian deployment

---

## Important limitation
This tool is a decision support system. It is not 
a replacement for a trained claims handler or fraud 
investigator. Every recommendation must be reviewed 
by a qualified human before action is taken. The 
system is designed to make human investigators faster 
and more consistent — not to replace their judgment.

---

## Discovery and validation
Built from 16 years of P&C insurance domain knowledge 
spanning claims handling, fraud detection, and 
underwriting. Stress tested against real world claim 
scenarios including multi-vehicle incidents, 
liability disputes, and complex loss events.

---

## Tech stack
- React frontend
- Node.js backend orchestrating sequential API calls
- Anthropic Claude API — three separate model calls
- Real time streaming to frontend
- Deployed on Vercel
- No persistent data storage — stateless by design

---

## Status
PRD: Done
v1 Build: In progress
Stress testing: Pending
Deployment: Pending
