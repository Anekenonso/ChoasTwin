'use client';

export default function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  icon = '📊',
  accent = 'cyan', // 'cyan' | 'red' | 'green' | 'orange' | 'purple'
}) {
  const ACCENT_COLORS = {
    cyan: '#00d4ff',
    red: '#ff4757',
    green: '#2ed573',
    orange: '#ffa502',
    purple: '#a855f7',
  };

  const selectedColor = ACCENT_COLORS[accent] || ACCENT_COLORS.cyan;

  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        <span className="kpi-icon">{icon}</span>
      </div>

      <div className="kpi-body">
        <div className="kpi-value font-mono">{value}</div>
      </div>

      <div className="kpi-footer">
        {trend && (
          <span className={`kpi-trend trend-${trendType}`}>
            {trendType === 'positive' && '↑ '}
            {trendType === 'negative' && '↓ '}
            {trend}
          </span>
        )}
        <span className="kpi-sub">{subtitle}</span>
      </div>

      <style jsx>{`
        .kpi-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          backdrop-filter: blur(12px);
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .kpi-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: ${selectedColor};
          opacity: 0.6;
          transition: opacity 0.2s ease;
        }

        .kpi-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .kpi-card:hover::before {
          opacity: 1;
          box-shadow: 0 0 12px ${selectedColor};
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .kpi-title {
          font-size: 11px;
          font-weight: 600;
          color: #8b949e;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .kpi-icon {
          font-size: 16px;
          opacity: 0.8;
        }

        .kpi-value {
          font-size: 26px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.5px;
        }

        .kpi-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
        }

        .kpi-trend {
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .trend-positive {
          color: #2ed573;
          background: rgba(46, 213, 115, 0.1);
        }

        .trend-negative {
          color: #ff4757;
          background: rgba(255, 71, 87, 0.1);
        }

        .trend-neutral {
          color: #8b949e;
          background: rgba(255, 255, 255, 0.05);
        }

        .kpi-sub {
          color: #6e7681;
        }
      `}</style>
    </div>
  );
}
