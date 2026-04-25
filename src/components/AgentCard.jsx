import { useEffect, useRef } from 'react';
import FraudGauge from './FraudGauge.jsx';

// ── Icons ──────────────────────────────────────────────────────
const IconIntake = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconFraud = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconSettlement = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AGENT_CONFIG = {
  1: {
    label: 'Intake Agent',
    sublabel: 'Agent 01 · Claim Intake',
    Icon: IconIntake,
    color: 'var(--blue)',
    glow: 'var(--blue-glow)',
    dim: 'var(--blue-dim)',
  },
  2: {
    label: 'Fraud Detection Agent',
    sublabel: 'Agent 02 · Fraud Analysis',
    Icon: IconFraud,
    color: 'var(--amber)',
    glow: 'var(--amber-glow)',
    dim: 'var(--amber-dim)',
  },
  3: {
    label: 'Settlement Agent',
    sublabel: 'Agent 03 · Settlement',
    Icon: IconSettlement,
    color: 'var(--green)',
    glow: 'var(--green-glow)',
    dim: 'var(--green-dim)',
  },
};

// ── Status Badge ───────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === 'waiting') return <span className="card-status-badge badge-waiting">Waiting</span>;
  if (status === 'processing') return (
    <span className="card-status-badge badge-processing">
      <div className="spinner" />
      Processing
    </span>
  );
  if (status === 'complete') return (
    <span className="card-status-badge badge-complete">
      <IconCheck /> Complete
    </span>
  );
  if (status === 'error') return <span className="card-status-badge badge-error">Error</span>;
  return null;
}

// ── Bool chip ──────────────────────────────────────────────────
function BoolChip({ value }) {
  return (
    <span className={`bool-chip ${value ? 'true' : 'false'}`}>
      {value ? '✓ Yes' : '✗ No'}
    </span>
  );
}

// ── Risk level color ───────────────────────────────────────────
function riskClass(level) {
  if (!level) return 'gray';
  const l = level.toLowerCase();
  if (l === 'low') return 'green';
  if (l === 'moderate') return 'blue';
  if (l === 'high') return 'amber';
  if (l === 'critical') return 'red';
  return 'gray';
}

function riskScoreClass(score) {
  if (score <= 3) return 'low';
  if (score <= 5) return 'moderate';
  if (score <= 7) return 'high';
  return 'critical';
}

function actionColor(action) {
  if (!action) return 'blue';
  const a = action.toLowerCase();
  if (a.includes('fast track') || a.includes('approve')) return 'green';
  if (a.includes('decline') || a.includes('legal') || a.includes('siu')) return 'red';
  if (a.includes('enhanced') || a.includes('refer')) return 'amber';
  return 'blue';
}

function validationColor(status) {
  if (!status) return 'gray';
  const s = status.toLowerCase();
  if (s === 'pass') return 'green';
  if (s === 'needs review') return 'amber';
  return 'red';
}

// ── Intake Result ──────────────────────────────────────────────
function IntakeResult({ result }) {
  return (
    <div>
      <div className="result-grid">
        <div className="result-item">
          <div className="result-item-label">Validation Status</div>
          <div className="result-item-value">
            <span className={`result-badge ${validationColor(result.validation_status)}`}>
              {result.validation_status}
            </span>
          </div>
        </div>
        <div className="result-item">
          <div className="result-item-label">Data Completeness</div>
          <div className="result-item-value">
            <span className={`result-badge ${result.data_completeness === 'High' ? 'green' : result.data_completeness === 'Medium' ? 'amber' : 'red'}`}>
              {result.data_completeness}
            </span>
          </div>
        </div>
        <div className="result-item">
          <div className="result-item-label">Claim Type</div>
          <div className="result-item-value">
            <span className="result-badge blue" style={{ textTransform: 'capitalize' }}>{result.claim_type}</span>
          </div>
        </div>
        <div className="result-item">
          <div className="result-item-label">Confidence</div>
          <div className="result-item-value">
            <span className={`result-badge ${result.intake_confidence === 'High' ? 'green' : result.intake_confidence === 'Medium' ? 'amber' : 'red'}`}>
              {result.intake_confidence}
            </span>
          </div>
        </div>
        <div className="result-item">
          <div className="result-item-label">Police Report</div>
          <div className="result-item-value"><BoolChip value={result.police_report_mentioned} /></div>
        </div>
        <div className="result-item">
          <div className="result-item-label">Injuries</div>
          <div className="result-item-value"><BoolChip value={result.injuries_reported} /></div>
        </div>
        <div className="result-item result-full">
          <div className="result-item-label">Summary</div>
          <div className="result-summary-text">{result.claim_summary}</div>
        </div>
      </div>
      {result.inconsistencies?.length > 0 && (
        <>
          <div className="result-section-title" style={{ color: 'var(--red)' }}>Inconsistencies</div>
          <ul className="result-list">
            {result.inconsistencies.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </>
      )}
      {result.missing_critical_fields?.length > 0 && (
        <>
          <div className="result-section-title" style={{ color: 'var(--amber)' }}>Missing Critical Fields</div>
          <ul className="result-list">
            {result.missing_critical_fields.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </>
      )}
      {result.recommended_verifications?.length > 0 && (
        <>
          <div className="result-section-title">Recommended Verifications</div>
          <ul className="result-list">
            {result.recommended_verifications.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}

// ── Fraud Result ───────────────────────────────────────────────
function FraudResult({ result }) {
  const score = result.fraud_risk_score ?? 0;
  return (
    <div>
      <div className="fraud-summary">
        <FraudGauge score={score} />
        <div style={{ flex: 1 }}>
          <div className="result-item" style={{ marginBottom: 8 }}>
            <div className="result-item-label">Risk Level</div>
            <div className="result-item-value">
              <span className={`result-badge ${riskClass(result.fraud_risk_level)}`}>
                {result.fraud_risk_level}
              </span>
            </div>
          </div>
          <div className="result-item" style={{ marginBottom: 8 }}>
            <div className="result-item-label">Recommendation</div>
            <div className="result-item-value" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {result.investigator_recommendation}
            </div>
          </div>
          <div className="result-item">
            <div className="result-item-label">Confidence</div>
            <div className="result-item-value">
              <span className={`result-badge ${result.confidence_level === 'High' ? 'green' : result.confidence_level === 'Medium' ? 'amber' : 'red'}`}>
                {result.confidence_level}
              </span>
            </div>
          </div>
        </div>
      </div>

      {result.fraud_signals?.length > 0 && (
        <>
          <div className="result-section-title" style={{ color: 'var(--amber)', marginTop: 12 }}>Fraud Signals</div>
          <ul className="result-list">
            {result.fraud_signals.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </>
      )}
      {result.red_flags?.length > 0 && (
        <>
          <div className="result-section-title" style={{ color: 'var(--red)' }}>Red Flags</div>
          <ul className="result-list">
            {result.red_flags.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </>
      )}
      {result.fraud_patterns_matched?.length > 0 && (
        <>
          <div className="result-section-title">Patterns Matched</div>
          <ul className="result-list">
            {result.fraud_patterns_matched.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}

// ── Settlement Result ──────────────────────────────────────────
function SettlementResult({ result }) {
  const color = actionColor(result.recommended_action);
  return (
    <div>
      <div className={`action-badge-large ${color}`} style={{ marginBottom: 10 }}>
        {result.recommended_action}
      </div>
      <div className="result-grid">
        <div className="result-item">
          <div className="result-item-label">Priority</div>
          <div className="result-item-value">
            <span className={`result-badge ${result.priority_level === 'Critical' || result.priority_level === 'High' ? 'red' : result.priority_level === 'Standard' ? 'blue' : 'gray'}`}>
              {result.priority_level}
            </span>
          </div>
        </div>
        <div className="result-item">
          <div className="result-item-label">Complexity</div>
          <div className="result-item-value" style={{ fontSize: '0.75rem' }}>{result.estimated_complexity}</div>
        </div>
        <div className="result-item result-full">
          <div className="result-item-label">Timeline</div>
          <div className="result-item-value">{result.settlement_timeline_estimate}</div>
        </div>
      </div>

      {result.recommended_next_steps?.length > 0 && (
        <>
          <div className="result-section-title">Next Steps</div>
          <ol className="result-list">
            {result.recommended_next_steps.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
            {result.recommended_next_steps.length > 3 && (
              <li style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                +{result.recommended_next_steps.length - 3} more in full report
              </li>
            )}
          </ol>
        </>
      )}
    </div>
  );
}

// ── Main AgentCard ─────────────────────────────────────────────
export default function AgentCard({ agentId, status, streamText, result, message, error }) {
  const cfg = AGENT_CONFIG[agentId];
  const streamRef = useRef(null);

  // Auto-scroll streaming text to bottom
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [streamText]);

  const cardStyle = {
    '--agent-color': cfg.color,
    '--agent-glow': cfg.glow,
    '--agent-dim': cfg.dim,
  };

  return (
    <div className="agent-card" data-status={status} style={cardStyle}>
      {/* Header */}
      <div className="card-header">
        <div className="card-icon" style={{ color: cfg.color }}>
          <cfg.Icon />
        </div>
        <div className="card-title">
          <h3>{cfg.label}</h3>
          <p>{cfg.sublabel}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Body */}
      <div className="card-body">
        {status === 'waiting' && (
          <div className="card-waiting-state">
            <div className="waiting-dots">
              <span /><span /><span />
            </div>
            <span>Waiting for previous agent...</span>
          </div>
        )}

        {status === 'processing' && (
          <div className="stream-container">
            {message && (
              <div className="processing-message" style={{ color: cfg.color }}>
                <div className="spinner" style={{ borderTopColor: cfg.color, width: 12, height: 12 }} />
                {message}
              </div>
            )}
            <div className="stream-label">
              <div className="stream-label-dot" style={{ background: cfg.color }} />
              Live agent output
            </div>
            <div className="stream-text stream-cursor" ref={streamRef}>
              {streamText || ''}
            </div>
          </div>
        )}

        {status === 'complete' && result && (
          <>
            {agentId === 1 && <IntakeResult result={result} />}
            {agentId === 2 && <FraudResult result={result} />}
            {agentId === 3 && <SettlementResult result={result} />}
          </>
        )}

        {status === 'error' && (
          <div style={{ color: 'var(--red)', fontSize: '0.82rem', padding: '12px 0' }}>
            {error || 'Agent encountered an error. Please try again.'}
          </div>
        )}
      </div>
    </div>
  );
}
