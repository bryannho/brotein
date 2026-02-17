import type { MacroTotals } from '../types';

interface Props {
  totals: MacroTotals;
}

const cardStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '1rem',
  padding: '1.25rem',
  border: '1px solid #444',
  borderRadius: '10px',
  background: '#1e1e1e',
  marginBottom: '1.5rem',
};

const cellStyle: React.CSSProperties = {
  textAlign: 'center',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.8em',
  opacity: 0.7,
  marginBottom: '0.25rem',
};

const valueStyle: React.CSSProperties = {
  fontSize: '1.6em',
  fontWeight: 700,
};

export default function DailySummaryCard({ totals }: Props) {
  return (
    <div style={cardStyle}>
      <div style={cellStyle}>
        <div style={labelStyle}>Calories</div>
        <div style={valueStyle}>{totals.calories}</div>
      </div>
      <div style={cellStyle}>
        <div style={labelStyle}>Protein (g)</div>
        <div style={valueStyle}>{totals.protein}</div>
      </div>
      <div style={cellStyle}>
        <div style={labelStyle}>Carbs (g)</div>
        <div style={valueStyle}>{totals.carbs}</div>
      </div>
      <div style={cellStyle}>
        <div style={labelStyle}>Sugar (g)</div>
        <div style={valueStyle}>{totals.sugar}</div>
      </div>
    </div>
  );
}
