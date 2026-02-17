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
  { key: 'sugar_goal' as const, label: 'Sugar Goal (g)' },
];

export default function GoalForm({ goals, onSave }: Props) {
  const [values, setValues] = useState({
    calories_goal: goals.calories_goal,
    protein_goal: goals.protein_goal,
    carbs_goal: goals.carbs_goal,
    sugar_goal: goals.sugar_goal,
  });

  const handleSave = () => {
    onSave({ user_id: goals.user_id, ...values });
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
            type="number"
            className="goal-input"
            value={values[key]}
            onChange={(e) => setValues({ ...values, [key]: Number(e.target.value) })}
          />
        </div>
      ))}
      <button onClick={handleSave} className="primary" style={{ marginTop: '0.5rem', width: '100%' }}>
        Save Goals
      </button>
    </div>
  );
}
