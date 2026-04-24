export default function FraudGauge({ score }) {
  const clampedScore = Math.max(1, Math.min(10, score));

  // Map score 1–10 to angle 180°→0° on a semicircle centered at (100,100)
  const angleDeg = 180 - (clampedScore - 1) * 20;
  const angleRad = (angleDeg * Math.PI) / 180;
  const cx = 100, cy = 100, r = 72;
  const needleLen = 60;
  const nx = cx + needleLen * Math.cos(angleRad);
  const ny = cy - needleLen * Math.sin(angleRad);

  const getColor = (s) => {
    if (s <= 2) return '#10b981';
    if (s <= 4) return '#84cc16';
    if (s <= 6) return '#f59e0b';
    if (s <= 8) return '#f97316';
    return '#ef4444';
  };

  const color = getColor(clampedScore);

  // Build the colored arc segment up to the current score
  // Full arc: from (28,100) to (172,100) = radius 72, sweep left to right
  const arcStart = { x: cx - r, y: cy }; // leftmost (score=1)
  const pctAngleDeg = 180 - angleDeg; // degrees swept from left
  const pctAngleRad = (pctAngleDeg * Math.PI) / 180;
  const arcEndX = cx - r * Math.cos(pctAngleRad);
  const arcEndY = cy - r * Math.sin(pctAngleRad);
  const largeArc = pctAngleDeg > 180 ? 1 : 0;

  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 200 115" style={{ width: 200, height: 115, overflow: 'visible' }}>
        <defs>
          <linearGradient id="gaugeTrack" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="75%" stopColor="#f97316" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="gaugeActive" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="75%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          stroke="url(#gaugeTrack)"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
        />

        {/* Active arc */}
        {clampedScore > 1 && (
          <path
            d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 ${largeArc} 1 ${arcEndX} ${arcEndY}`}
            stroke="url(#gaugeActive)"
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
            filter="url(#glow)"
            opacity="0.9"
          />
        )}

        {/* Tick marks */}
        {[1,2,3,4,5,6,7,8,9,10].map((tick) => {
          const tDeg = 180 - (tick - 1) * 20;
          const tRad = (tDeg * Math.PI) / 180;
          const innerR = 76, outerR = 82;
          const x1 = cx + innerR * Math.cos(tRad);
          const y1 = cy - innerR * Math.sin(tRad);
          const x2 = cx + outerR * Math.cos(tRad);
          const y2 = cy - outerR * Math.sin(tRad);
          return (
            <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={tick <= clampedScore ? color : '#253554'}
              strokeWidth={tick % 5 === 0 ? 2.5 : 1.5}
              strokeLinecap="round"
            />
          );
        })}

        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={nx} y2={ny}
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Needle base circle */}
        <circle cx={cx} cy={cy} r="7" fill={color} filter="url(#glow)" />
        <circle cx={cx} cy={cy} r="3.5" fill="#070d1a" />

        {/* Score label */}
        <text x={cx} y={cy - 14} textAnchor="middle"
          fill={color} fontSize="30" fontWeight="800"
          fontFamily="'JetBrains Mono', monospace">
          {clampedScore}
        </text>

        {/* Axis labels */}
        <text x={cx - r - 4} y={cy + 16} textAnchor="middle" fill="#475569" fontSize="9" fontFamily="Inter, sans-serif">1</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill="#475569" fontSize="9" fontFamily="Inter, sans-serif">5</text>
        <text x={cx + r + 4} y={cy + 16} textAnchor="middle" fill="#475569" fontSize="9" fontFamily="Inter, sans-serif">10</text>
      </svg>
      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', marginTop: -8 }}>
        Fraud Risk Score
      </div>
    </div>
  );
}
