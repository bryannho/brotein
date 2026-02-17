import { useState } from 'react';
import type { Goals } from '../types';

interface Props {
  goals: Goals;
  onSave: (goals: Goals) => void;
}

const fields = [
  { key: 'calories_goal' as const, label: 'Calories Goal' },
  { key: 'protein_goal' as const, label: 'Protein Goal (g)' },
  { key: 'carbs_goal' as const, label: 'Carbs Goal (g)' },
  { key: 'fat_goal' as const, label: 'Fat Goal (g)' },
  { key: 'sugar_goal' as const, label: 'Sugar Goal (g)' },
];

export default function GoalForm({ goals, onSave }: Props) {
  const [values, setValues] = useState({
    calories_goal: String(goals.calories_goal),
    protein_goal: String(goals.protein_goal),
    carbs_goal: String(goals.carbs_goal),
    fat_goal: String(goals.fat_goal),
    sugar_goal: String(goals.sugar_goal),
  });

  const handleChange = (key: keyof typeof values, raw: string) => {
    if (/^\d*\.?\d*$/.test(raw)) {
      setValues({ ...values, [key]: raw });
    }
  };

  const handleSave = () => {
    onSave({
      user_id: goals.user_id,
      calories_goal: Number(values.calories_goal) || 0,
      protein_goal: Number(values.protein_goal) || 0,
      carbs_goal: Number(values.carbs_goal) || 0,
      fat_goal: Number(values.fat_goal) || 0,
      sugar_goal: Number(values.sugar_goal) || 0,
    });
  };

  return (
    <div>
      {fields.map(({ key, label }) => (
        <div
          key={key}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
          }}
        >
          <label>{label}</label>
          <input
            type="text"
            inputMode="decimal"
            className="goal-input"
            value={values[key]}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        </div>
      ))}
      <button onClick={handleSave} className="primary" style={{ marginTop: '0.5rem', width: '100%' }}>
        Save Goals
      </button>
    </div>
  );
}
