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

interface MacroChartProps {
  title: string;
  data: Array<Record<string, string | number>>;
  actualKey: string;
  goalKey: string;
  actualColor: string;
  goalColor: string;
  height?: number;
}

function MacroChart({ title, data, actualKey, goalKey, actualColor, goalColor, height = 200 }: MacroChartProps) {
  return (
    <div>
      <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" stroke="#888" tick={{ fontSize: 12 }} />
          <YAxis stroke="#888" tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey={actualKey} fill={actualColor} radius={[4, 4, 0, 0]} />
          <Bar dataKey={goalKey} fill={goalColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function WeeklyCharts({ days }: Props) {
  const caloriesData = days.map((d) => ({
    date: d.date.slice(5),
    Actual: d.actual.calories,
    Goal: d.goal.calories,
  }));

  const proteinData = days.map((d) => ({
    date: d.date.slice(5),
    Actual: d.actual.protein,
    Goal: d.goal.protein,
  }));

  const carbsData = days.map((d) => ({
    date: d.date.slice(5),
    Actual: d.actual.carbs,
    Goal: d.goal.carbs,
  }));

  const fatData = days.map((d) => ({
    date: d.date.slice(5),
    Actual: d.actual.fat,
    Goal: d.goal.fat,
  }));

  const sugarData = days.map((d) => ({
    date: d.date.slice(5),
    Actual: d.actual.sugar,
    Goal: d.goal.sugar,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <MacroChart
        title="Calories"
        data={caloriesData}
        actualKey="Actual"
        goalKey="Goal"
        actualColor="#7c83ff"
        goalColor="#3d4080"
      />
      <MacroChart
        title="Protein (g)"
        data={proteinData}
        actualKey="Actual"
        goalKey="Goal"
        actualColor="#4ecdc4"
        goalColor="#2a7a74"
      />
      <MacroChart
        title="Carbs (g)"
        data={carbsData}
        actualKey="Actual"
        goalKey="Goal"
        actualColor="#ffd43b"
        goalColor="#8a7d3a"
      />
      <MacroChart
        title="Fat (g)"
        data={fatData}
        actualKey="Actual"
        goalKey="Goal"
        actualColor="#f4a261"
        goalColor="#8a5e38"
      />
      <MacroChart
        title="Sugar (g)"
        data={sugarData}
        actualKey="Actual"
        goalKey="Goal"
        actualColor="#ff6b6b"
        goalColor="#8a3a3a"
      />
    </div>
  );
}
