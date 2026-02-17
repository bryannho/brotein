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
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Legend />
            <Bar dataKey="Actual" fill="#646cff" />
            <Bar dataKey="Goal" fill="#555" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 style={{ marginBottom: '0.5rem' }}>Macros (g)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={macrosData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Legend />
            <Bar dataKey="Protein Actual" fill="#4ecdc4" />
            <Bar dataKey="Protein Goal" fill="#2a7a74" />
            <Bar dataKey="Carbs Actual" fill="#ffe66d" />
            <Bar dataKey="Carbs Goal" fill="#8a7d3a" />
            <Bar dataKey="Sugar Actual" fill="#ff6b6b" />
            <Bar dataKey="Sugar Goal" fill="#8a3a3a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
