'use client';

export default function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  icon = '⚡',
  accent = 'cyan', // 'cyan' | 'red' | 'green' | 'orange' | 'purple'
}) {
  const ACCENTS = {
    cyan: {
      color: 'var(--accent-cyan)',
      bg: 'var(--accent-cyan-soft)',
      border: 'rgba(56, 189, 248, 0.3)',
    },
    red: {
      color: 'var(--accent-rose)',
      bg: 'var(--accent-rose-soft)',
      border: 'rgba(244, 63, 94, 0.3)',
    },
    green: {
      color: 'var(--accent-emerald)',
      bg: 'var(--accent-emerald-soft)',
      border: 'rgba(16, 185, 129, 0.3)',
    },
    orange: {
      color: 'var(--accent-amber)',
      bg: 'var(--accent-amber-soft)',
      border: 'rgba(245, 158, 11, 0.3)',
    },
    purple: {
      color: 'var(--accent-purple)',
      bg: 'var(--accent-purple-soft)',
      border: 'rgba(168, 85, 247, 0.3)',
    },
  };

  const selected = ACCENTS[accent] || ACCENTS.cyan;

  return (
    <div className="kpi-card">
      <div className="card-top-accent" style={{ background: selected.color }} />
      
      <div className="kpi-header">
        <span className="kpi-kicker">{title}</span>
        <span className="kpi-icon-wrap" style={{ background: selected.bg, color: selected.color }}>
          {icon}
        </span>
      </div>

      <div className="kpi-body">
        <div className="kpi-val font-mono">{value}</div>
      </div>

      <div className="kpi-footer">
        {trend && (
          <span className={`trend-chip trend-${trendType} font-mono`}>
            {trendType === 'positive' && '↑ '}
            {trendType === 'negative' && '↓ '}
            {trend}
          </span>
        )}
        <span className="kpi-sub">{subtitle}</span>
      </div>

      <style jsx>{`
        .kpi-card {
          position: relative;
          background: linear-gradient(180deg, rgba(17, 24, 39, 0.9) 0%, rgba(13, 19, 33, 0.95) 100%);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: var(--shadow-card);
          backdrop-filter: blur(14px);
          transition: all var(--transition-normal);
          overflow: hidden;
        }

        .card-top-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          opacity: 0.7;
          transition: opacity var(--transition-fast);
        }

        .kpi-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-strong);
          box-shadow: var(--shadow-elevated);
        }

        .kpi-card:hover .card-top-accent {
          opacity: 1;
          box-shadow: 0 0 10px ${selected.color};
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .kpi-kicker {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--text-secondary);
        }

        .kpi-icon-wrap {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .kpi-body {
          margin-top: -2px;
        }

        .kpi-val {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .kpi-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .trend-chip {
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: var(--radius-xs);
          letter-spacing: 0.02em;
        }

        .trend-positive {
          background: var(--accent-emerald-soft);
          color: var(--accent-emerald);
          border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .trend-negative {
          background: var(--accent-rose-soft);
          color: var(--accent-rose);
          border: 1px solid rgba(244, 63, 94, 0.25);
        }

        .trend-neutral {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          border: 1px solid var(--border-subtle);
        }

        .kpi-sub {
          font-size: 11.5px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
