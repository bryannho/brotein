import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import type { DayEntry } from '../types';

function useMobile(breakpoint = 520) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}

interface Props {
  days: DayEntry[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'var(--color-surface-alt)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '0.6rem 0.8rem',
        fontSize: '0.85em',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} style={{ color: entry.color, marginBottom: '0.1rem' }}>
          {entry.name}: {Math.round(entry.value)}
        </div>
      ))}
    </div>
  );
}

export default function WeeklyCharts({ days }: Props) {
  const isMobile = useMobile();

  const calorieGoal = days.length > 0 ? days[0].goal.calories : 0;

  const averages = days.length > 0
    ? {
        calories: Math.round(days.reduce((s, d) => s + d.actual.calories, 0) / days.length),
        protein: Math.round(days.reduce((s, d) => s + d.actual.protein, 0) / days.length),
        carbs: Math.round(days.reduce((s, d) => s + d.actual.carbs, 0) / days.length),
        fat: Math.round(days.reduce((s, d) => s + d.actual.fat, 0) / days.length),
        sugar: Math.round(days.reduce((s, d) => s + d.actual.sugar, 0) / days.length),
      }
    : { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 };

  const caloriesData = days.map((d) => ({
    date: d.date.slice(5),
    Calories: d.actual.calories,
  }));

  const macrosData = days.map((d) => ({
    date: d.date.slice(5),
    Protein: Math.round(d.actual.protein),
    Carbs: Math.round(d.actual.carbs),
    Fat: Math.round(d.actual.fat),
    Sugar: Math.round(d.actual.sugar),
  }));

  const margin = isMobile
    ? { top: 5, right: 5, left: 0, bottom: 5 }
    : { top: 5, right: 20, left: 10, bottom: 5 };

  const macroItems = [
    { label: 'Cal', value: averages.calories, color: 'var(--color-calories)' },
    { label: 'Pro', value: `${averages.protein}g`, color: 'var(--color-protein)' },
    { label: 'Carb', value: `${averages.carbs}g`, color: 'var(--color-carbs)' },
    { label: 'Fat', value: `${averages.fat}g`, color: 'var(--color-fat)' },
    { label: 'Sugar', value: `${averages.sugar}g`, color: 'var(--color-sugar)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 7-Day Averages */}
      <div className="card" style={{ padding: '1rem 1.2rem' }}>
        <div style={{ fontSize: '0.8em', color: 'var(--color-text-secondary)', marginBottom: '0.6rem', fontWeight: 600 }}>
          {days.length}-Day Averages
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {macroItems.map((item) => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75em', color: item.color, fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: '1.1em', fontWeight: 700 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Calories Line Chart */}
      <div>
        <h3 style={{ marginBottom: '0.5rem' }}>Calories</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={caloriesData} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="#888" tick={{ fontSize: isMobile ? 10 : 12 }} />
            {!isMobile && <YAxis stroke="#888" tick={{ fontSize: 12 }} />}
            <Tooltip content={<CustomTooltip />} />
            {calorieGoal > 0 && (
              <ReferenceArea y1={0} y2={calorieGoal} fill="rgba(77,107,255,0.12)" />
            )}
            {calorieGoal > 0 && (
              <ReferenceLine y={calorieGoal} stroke="rgba(77,107,255,0.5)" strokeDasharray="6 4" label={{ value: 'Goal', position: 'right', fill: '#888', fontSize: 11 }} />
            )}
            <Line
              type="monotone"
              dataKey="Calories"
              stroke="#4d6bff"
              strokeWidth={2}
              dot={{ r: 4, fill: '#4d6bff' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Macros Line Chart */}
      <div>
        <h3 style={{ marginBottom: '0.5rem' }}>Macros (g)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={macrosData} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="#888" tick={{ fontSize: isMobile ? 10 : 12 }} />
            {!isMobile && <YAxis stroke="#888" tick={{ fontSize: 12 }} />}
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={isMobile ? { fontSize: '0.75em' } : undefined} />
            <Line type="monotone" dataKey="Protein" stroke="#4ecdc4" strokeWidth={2} dot={{ r: 4, fill: '#4ecdc4' }} />
            <Line type="monotone" dataKey="Carbs" stroke="#ffd43b" strokeWidth={2} dot={{ r: 4, fill: '#ffd43b' }} />
            <Line type="monotone" dataKey="Fat" stroke="#f4a261" strokeWidth={2} dot={{ r: 4, fill: '#f4a261' }} />
            <Line type="monotone" dataKey="Sugar" stroke="#ff6b6b" strokeWidth={2} dot={{ r: 4, fill: '#ff6b6b' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
