import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DayEntry } from '../types';

interface Props {
  days: DayEntry[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#2c2c2c',
        border: '1px solid #444',
        borderRadius: '8px',
        padding: '0.6rem 0.8rem',
        fontSize: '0.85em',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} style={{ color: entry.color, marginBottom: '0.1rem' }}>
          {entry.name}: {entry.value}
        </div>
      ))}
    </div>
  );
}

export default function WeeklyCharts({ days }: Props) {
  const caloriesData = days.map((d) => ({
    date: d.date.slice(5),
    Actual: d.actual.calories,
    Goal: d.goal.calories,
  }));

  const macrosData = days.map((d) => ({
    date: d.date.slice(5),
    'Protein Actual': d.actual.protein,
    'Protein Goal': d.goal.protein,
    'Carbs Actual': d.actual.carbs,
    'Carbs Goal': d.goal.carbs,
    'Sugar Actual': d.actual.sugar,
    'Sugar Goal': d.goal.sugar,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBottom: '0.5rem' }}>Calories</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={caloriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#888" tick={{ fontSize: 12 }} />
            <YAxis stroke="#888" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Actual" fill="#7c83ff" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Goal" fill="#3d4080" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 style={{ marginBottom: '0.5rem' }}>Macros (g)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={macrosData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#888" tick={{ fontSize: 12 }} />
            <YAxis stroke="#888" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Protein Actual" fill="#4ecdc4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Protein Goal" fill="#2a7a74" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Carbs Actual" fill="#ffd43b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Carbs Goal" fill="#8a7d3a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Sugar Actual" fill="#ff6b6b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Sugar Goal" fill="#8a3a3a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
