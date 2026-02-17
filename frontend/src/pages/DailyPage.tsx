import { useState } from 'react';
import type { Meal } from '../types';
import DailySummaryCard from '../components/DailySummaryCard';
import MealList from '../components/MealList';
import MealEntryForm from '../components/MealEntryForm';

const sampleMeals: Meal[] = [
  {
    meal_id: 'meal-1',
    user_id: '1',
    date: '2026-02-16',
    text_input: 'Chipotle chicken bowl with rice and guac',
    calories: 750,
    protein: 45,
    carbs: 72,
    sugar: 6,
    created_at: '2026-02-16T12:30:00Z',
  },
  {
    meal_id: 'meal-2',
    user_id: '1',
    date: '2026-02-16',
    text_input: 'Protein shake with banana',
    calories: 320,
    protein: 35,
    carbs: 28,
    sugar: 18,
    created_at: '2026-02-16T08:00:00Z',
  },
  {
    meal_id: 'meal-3',
    user_id: '1',
    date: '2026-02-16',
    text_input: 'Grilled salmon with steamed broccoli',
    calories: 480,
    protein: 42,
    carbs: 12,
    sugar: 3,
    created_at: '2026-02-16T18:45:00Z',
  },
];

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function displayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DailyPage() {
  const today = formatDate(new Date());
  const [currentDate, setCurrentDate] = useState(today);

  const meals = sampleMeals;

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      sugar: acc.sugar + m.sugar,
    }),
    { calories: 0, protein: 0, carbs: 0, sugar: 0 },
  );

  const goBack = () => {
    const d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setCurrentDate(formatDate(d));
  };

  const goForward = () => {
    const d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const next = formatDate(d);
    if (next <= today) {
      setCurrentDate(next);
    }
  };

  const isToday = currentDate === today;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <button onClick={goBack} style={{ fontSize: '1.2em' }}>
          &larr;
        </button>
        <span style={{ fontSize: '1.1em', fontWeight: 600 }}>
          {displayDate(currentDate)}
        </span>
        <button
          onClick={goForward}
          disabled={isToday}
          style={{
            fontSize: '1.2em',
            opacity: isToday ? 0.3 : 1,
            cursor: isToday ? 'default' : 'pointer',
          }}
        >
          &rarr;
        </button>
      </div>

      <DailySummaryCard totals={totals} />
      <MealList meals={meals} />
      <MealEntryForm />
    </div>
  );
}
