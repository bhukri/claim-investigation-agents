import FraudGauge from './FraudGauge.jsx';

// ── SVG Icons ──────────────────────────────────────────────────
const IconDoc = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const IconShield = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconCheck = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconClock = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconUser = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconWarning = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────
function actionColor(action) {
  if (!action) return 'blue';
  const a = action.toLowerCase();
  if (a.includes('fast track') || a.includes('approve')) return 'green';
  if (a.includes('decline') || a.includes('legal') || a.includes('siu')) return 'red';
  if (a.includes('enhanced') || a.includes('refer')) return 'amber';
  return 'blue';
}

function priorityColor(level) {
  if (!level) return 'gray';
  const l = level.toLowerCase();
  if (l === 'critical') return 'red';
  if (l === 'high') return 'amber';
  if (l === 'standard') return 'blue';
  return 'gray';
}

function riskBadgeClass(level) {
  if (!level) return 'gray';
  const l = level.toLowerCase();
  if (l === 'low') return 'green';
  if (l === 'moderate') return 'blue';
  if (l === 'high') return 'amber';
  if (l === 'critical') return 'red';
  return 'gray';
}

// ── Main Component ─────────────────────────────────────────────
export default function ConsolidatedReport({ intake, fraud, settlement }) {
  const settlementColor = actionColor(settlement.recommended_action);
  const allSignals = [
    ...(fraud.fraud_signals || []),
    ...(fraud.red_flags || []),
  ];

  return (
    <div className="report-section">
      <div className="report-header">
        <h2>Consolidated Investigation Report</h2>
        <div className="report-header-line" />
        <div className="report-complete-badge">
          <IconCheck size={11} /> All Agents Complete
        </div>
      </div>

      {/* Row 1: Settlement action + Fraud risk */}
      <div className="report-grid">
        {/* Settlement Recommendation */}
        <div className={`report-card highlight-${settlementColor}`}>
          <div className="report-card-title">
            <IconCheck size={12} /> Settlement Recommendation
          </div>
          <div className={`action-badge-large ${settlementColor}`}>
            {settlement.recommended_action}
          </div>
          <div className="meta-chips">
            <span className={`result-badge ${priorityColor(settlement.priority_level)}`}>
              {settlement.priority_level} Priority
            </span>
            <span className="meta-chip">{settlement.estimated_complexity}</span>
            <span className="meta-chip">{settlement.settlement_timeline_estimate}</span>
          </div>
        </div>

        {/* Fraud Risk */}
        <div className={`report-card ${fraud.fraud_risk_score >= 7 ? 'highlight-red' : fraud.fraud_risk_score >= 4 ? 'highlight-amber' : ''}`}>
          <div className="report-card-title">
            <IconShield size={12} /> Fraud Risk Assessment
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <FraudGauge score={fraud.fraud_risk_score} />
            <div>
              <span className={`result-badge ${riskBadgeClass(fraud.fraud_risk_level)}`} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                {fraud.fraud_risk_level}
              </span>
              <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {fraud.investigator_recommendation}
              </div>
              <div style={{ marginTop: 4, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Confidence: <span style={{ color: 'var(--text-dim)' }}>{fraud.confidence_level}</span>
              </div>
            </div>
          </div>
          {allSignals.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="report-card-title" style={{ marginBottom: 8 }}>
                Signals Detected
              </div>
              {allSignals.slice(0, 3).map((s, i) => (
                <div key={i} className="special-item" style={{ marginBottom: 4 }}>
                  <IconWarning size={12} /> {s}
                </div>
              ))}
              {allSignals.length > 3 && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, paddingLeft: 4 }}>
                  +{allSignals.length - 3} additional signals detected
                </div>
              )}
            </div>
          )}
        </div>

        {/* Claim Summary */}
        <div className="report-card">
          <div className="report-card-title">
            <IconDoc size={12} /> Intake Validation Summary
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: 12, fontStyle: 'italic' }}>
            {intake.claim_summary}
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            <span className="result-badge blue" style={{ textTransform: 'capitalize' }}>{intake.claim_type}</span>
            {intake.injuries_reported && <span className="result-badge red">Injuries Reported</span>}
            {intake.police_report_mentioned && <span className="result-badge green">Police Report</span>}
            {intake.third_party_involved && <span className="result-badge amber">Third Party</span>}
            <span className={`result-badge ${intake.validation_status === 'Pass' ? 'green' : intake.validation_status === 'Needs Review' ? 'amber' : 'red'}`}>
              {intake.validation_status}
            </span>
          </div>
          {intake.inconsistencies?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--red)', marginBottom: 6 }}>
                Inconsistencies
              </div>
              {intake.inconsistencies.map((item, i) => (
                <div key={i} className="special-item" style={{ background: 'var(--red-dim)', borderColor: 'rgba(239,68,68,0.3)', color: 'var(--red)', marginBottom: 4 }}>
                  <IconWarning size={12} /> {item}
                </div>
              ))}
            </div>
          )}
          {intake.missing_critical_fields?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--amber)', marginBottom: 6 }}>
                Missing Critical Fields
              </div>
              {intake.missing_critical_fields.map((item, i) => (
                <div key={i} className="special-item" style={{ background: 'var(--amber-dim)', borderColor: 'rgba(245,158,11,0.3)', color: 'var(--amber)', marginBottom: 4 }}>
                  <IconWarning size={12} /> {item}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timeline + Next Steps */}
        <div className="report-card">
          <div className="report-card-title">
            <IconClock size={12} /> Next Steps & Timeline
          </div>
          <div style={{ marginBottom: 16 }}>
            <div className="timeline-display">{settlement.settlement_timeline_estimate}</div>
            <div className="timeline-label">Estimated Resolution</div>
          </div>
          {settlement.recommended_next_steps?.length > 0 && (
            <ol className="numbered-list">
              {settlement.recommended_next_steps.map((step, i) => (
                <li key={i}>
                  <span className="step-num">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Required Documents */}
        <div className="report-card">
          <div className="report-card-title">
            <IconDoc size={12} /> Required Documents
          </div>
          {settlement.required_documents?.length > 0 ? (
            <div className="doc-list">
              {settlement.required_documents.map((doc, i) => (
                <div key={i} className="doc-item">
                  <span className="doc-icon"><IconDoc size={13} /></span>
                  {doc}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No additional documents required at this stage.</p>
          )}
        </div>

        {/* Special Considerations */}
        {settlement.special_considerations?.length > 0 && (
          <div className="report-card">
            <div className="report-card-title">
              <IconWarning size={12} /> Special Considerations
            </div>
            {settlement.special_considerations.map((item, i) => (
              <div key={i} className="special-item">
                <IconWarning size={12} /> {item}
              </div>
            ))}
          </div>
        )}

        {/* Handler Notes */}
        <div className={`report-card full`}>
          <div className="report-card-title">
            <IconUser size={12} /> Handler Notes
          </div>
          <p className="handler-notes">{settlement.handler_notes}</p>
        </div>
      </div>
    </div>
  );
}
