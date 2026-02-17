import type { DayEntry } from '../types';
import WeeklyCharts from '../components/WeeklyCharts';

const sampleDays: DayEntry[] = [
  {
    date: '2026-02-10',
    goal: { calories: 2200, protein: 160, carbs: 200, sugar: 40 },
    actual: { calories: 2050, protein: 150, carbs: 180, sugar: 35 },
  },
  {
    date: '2026-02-11',
    goal: { calories: 2200, protein: 160, carbs: 200, sugar: 40 },
    actual: { calories: 2300, protein: 170, carbs: 210, sugar: 45 },
  },
  {
    date: '2026-02-12',
    goal: { calories: 2200, protein: 160, carbs: 200, sugar: 40 },
    actual: { calories: 1800, protein: 130, carbs: 160, sugar: 30 },
  },
  {
    date: '2026-02-13',
    goal: { calories: 2200, protein: 160, carbs: 200, sugar: 40 },
    actual: { calories: 2100, protein: 155, carbs: 195, sugar: 38 },
  },
  {
    date: '2026-02-14',
    goal: { calories: 2200, protein: 160, carbs: 200, sugar: 40 },
    actual: { calories: 2400, protein: 175, carbs: 220, sugar: 50 },
  },
  {
    date: '2026-02-15',
    goal: { calories: 2200, protein: 160, carbs: 200, sugar: 40 },
    actual: { calories: 1950, protein: 140, carbs: 185, sugar: 32 },
  },
  {
    date: '2026-02-16',
    goal: { calories: 2200, protein: 160, carbs: 200, sugar: 40 },
    actual: { calories: 1550, protein: 122, carbs: 112, sugar: 27 },
  },
];

export default function WeeklyPage() {
  return (
    <div>
      <h2 style={{ marginBottom: '1rem', fontWeight: 700 }}>Weekly Overview</h2>
      <WeeklyCharts days={sampleDays} />
    </div>
  );
}
