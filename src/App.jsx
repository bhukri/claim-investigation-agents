import { useState, useCallback, useRef } from 'react';
import AgentCard from './components/AgentCard.jsx';
import ConsolidatedReport from './components/ConsolidatedReport.jsx';
import FNOLForm, { TEST_FNOL } from './components/FNOLForm.jsx';

const INITIAL_AGENTS = [
  { id: 1, status: 'waiting', streamText: '', result: null, message: '', error: null },
  { id: 2, status: 'waiting', streamText: '', result: null, message: '', error: null },
  { id: 3, status: 'waiting', streamText: '', result: null, message: '', error: null },
];

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-5.02" />
  </svg>
);

const IconError = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
  </svg>
);

function PipelineArrow({ fromStatus, toStatus }) {
  const isActive = fromStatus === 'processing' || (fromStatus === 'complete' && toStatus === 'processing');
  const isDone = fromStatus === 'complete' && toStatus === 'complete';
  return (
    <div className="pipeline-arrow">
      <div className={`arrow-line ${isDone ? 'done' : isActive ? 'active' : ''}`} />
      <span className="arrow-label">{isDone ? 'passed' : isActive ? 'sending' : 'pending'}</span>
    </div>
  );
}

export default function App() {
  const [fnolData, setFnolData] = useState(TEST_FNOL);
  const [appStatus, setAppStatus] = useState('idle');
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [globalError, setGlobalError] = useState(null);
  const abortRef = useRef(null);

  const updateAgent = useCallback((id, updater) => {
    setAgents(prev => prev.map(a => a.id === id ? (typeof updater === 'function' ? updater(a) : { ...a, ...updater }) : a));
  }, []);

  const handleEvent = useCallback((data) => {
    switch (data.type) {
      case 'agent_start':
        updateAgent(data.agent, { status: 'processing', message: data.message, streamText: '' });
        break;
      case 'agent_chunk':
        updateAgent(data.agent, prev => ({ ...prev, streamText: prev.streamText + data.content }));
        break;
      case 'agent_complete':
        updateAgent(data.agent, { status: 'complete', result: data.result });
        break;
      case 'complete':
        setAppStatus('complete');
        break;
      case 'error':
        setGlobalError(data.message);
        setAppStatus('error');
        setAgents(prev => prev.map(a => a.status === 'processing' ? { ...a, status: 'error', error: data.message } : a));
        break;
    }
  }, [updateAgent]);

  const handleInvestigate = async () => {
    if (!fnolData.incidentDescription?.trim()) return;

    setAppStatus('processing');
    setGlobalError(null);
    setAgents(INITIAL_AGENTS);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fnolData }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try { handleEvent(JSON.parse(raw)); } catch {}
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      setGlobalError(err.message || 'Connection failed. Please try again.');
      setAppStatus('error');
      setAgents(prev => prev.map(a => a.status === 'processing' ? { ...a, status: 'error', error: err.message } : a));
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setAppStatus('idle');
    setGlobalError(null);
    setAgents(INITIAL_AGENTS);
  };

  const isProcessing = appStatus === 'processing';
  const isComplete = appStatus === 'complete';

  return (
    <div className="app">
      <header className="header">
        <div className="header-logo"><IconLogo /></div>
        <div className="header-text">
          <h1>AI Claim Investigation System</h1>
          <p>Multi-Agent Insurance Analysis Pipeline</p>
        </div>
        <div className="header-badge">
          <div className="header-badge-dot" />
          3-Agent Pipeline Active
        </div>
      </header>

      {/* FNOL Form */}
      <section className="claim-section">
        <div className="section-label">First Notice of Loss</div>
        <FNOLForm data={fnolData} onChange={setFnolData} disabled={isProcessing} />
        <div className="claim-actions" style={{ marginTop: 20 }}>
          <button
            className="btn-investigate"
            onClick={handleInvestigate}
            disabled={isProcessing || !fnolData.incidentDescription?.trim()}
          >
            {isProcessing ? (
              <><div className="spinner" style={{ borderTopColor: '#fff', width: 14, height: 14 }} /> Investigating...</>
            ) : (
              <><IconSearch /> Investigate Claim</>
            )}
          </button>
          {(isProcessing || isComplete || appStatus === 'error') && (
            <button className="btn-reset" onClick={handleReset}>
              <IconRefresh /> Reset
            </button>
          )}
        </div>
      </section>

      {globalError && (
        <div className="error-banner">
          <IconError />
          <strong>Investigation Failed:</strong> {globalError}
        </div>
      )}

      {appStatus !== 'idle' && (
        <section className="pipeline-section">
          <div className="section-label">Live Investigation Pipeline</div>
          <div className="pipeline-grid">
            <AgentCard agentId={1} status={agents[0].status} streamText={agents[0].streamText} result={agents[0].result} message={agents[0].message} error={agents[0].error} />
            <PipelineArrow fromStatus={agents[0].status} toStatus={agents[1].status} />
            <AgentCard agentId={2} status={agents[1].status} streamText={agents[1].streamText} result={agents[1].result} message={agents[1].message} error={agents[1].error} />
            <PipelineArrow fromStatus={agents[1].status} toStatus={agents[2].status} />
            <AgentCard agentId={3} status={agents[2].status} streamText={agents[2].streamText} result={agents[2].result} message={agents[2].message} error={agents[2].error} />
          </div>
        </section>
      )}

      {isComplete && agents[0].result && agents[1].result && agents[2].result && (
        <ConsolidatedReport intake={agents[0].result} fraud={agents[1].result} settlement={agents[2].result} />
      )}
    </div>
  );
}
