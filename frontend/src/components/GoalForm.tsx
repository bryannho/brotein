import { useState } from 'react';
import type { Goals } from '../types';

interface Props {
  goals: Goals;
  onSave: (goals: Goals) => void;
}

const inputStyle: React.CSSProperties = {
  padding: '0.4em 0.6em',
  fontSize: '1em',
  borderRadius: '6px',
  border: '1px solid #555',
  background: '#2a2a2a',
  color: 'inherit',
  width: '120px',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.75rem',
};

export default function GoalForm({ goals, onSave }: Props) {
  const [caloriesGoal, setCaloriesGoal] = useState(goals.calories_goal);
  const [proteinGoal, setProteinGoal] = useState(goals.protein_goal);
  const [carbsGoal, setCarbsGoal] = useState(goals.carbs_goal);
  const [sugarGoal, setSugarGoal] = useState(goals.sugar_goal);

  const handleSave = () => {
    onSave({
      user_id: goals.user_id,
      calories_goal: caloriesGoal,
      protein_goal: proteinGoal,
      carbs_goal: carbsGoal,
      sugar_goal: sugarGoal,
    });
  };

  return (
    <div>
      <div style={rowStyle}>
        <label>Calories Goal</label>
        <input
          type="number"
          style={inputStyle}
          value={caloriesGoal}
          onChange={(e) => setCaloriesGoal(Number(e.target.value))}
        />
      </div>
      <div style={rowStyle}>
        <label>Protein Goal (g)</label>
        <input
          type="number"
          style={inputStyle}
          value={proteinGoal}
          onChange={(e) => setProteinGoal(Number(e.target.value))}
        />
      </div>
      <div style={rowStyle}>
        <label>Carbs Goal (g)</label>
        <input
          type="number"
          style={inputStyle}
          value={carbsGoal}
          onChange={(e) => setCarbsGoal(Number(e.target.value))}
        />
      </div>
      <div style={rowStyle}>
        <label>Sugar Goal (g)</label>
        <input
          type="number"
          style={inputStyle}
          value={sugarGoal}
          onChange={(e) => setSugarGoal(Number(e.target.value))}
        />
      </div>
      <button onClick={handleSave} style={{ marginTop: '0.5rem' }}>
        Save Goals
      </button>
    </div>
  );
}
