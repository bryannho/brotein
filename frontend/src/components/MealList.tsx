import type { Meal } from '../types';
import MealRowEditable from './MealRowEditable';

interface Props {
  meals: Meal[];
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '1.5rem',
};

const thStyle: React.CSSProperties = {
  padding: '0.5rem',
  borderBottom: '1px solid #444',
  textAlign: 'center',
  fontSize: '0.85em',
  opacity: 0.7,
};

export default function MealList({ meals }: Props) {
  const handleUpdate = (mealId: string, field: string, value: number) => {
    console.log('Update meal', mealId, field, value);
  };

  const handleDelete = (mealId: string) => {
    console.log('Delete meal', mealId);
  };

  if (meals.length === 0) {
    return (
      <p style={{ textAlign: 'center', opacity: 0.6 }}>
        No meals logged yet.
      </p>
    );
  }

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={{ ...thStyle, textAlign: 'left' }}>Meal</th>
          <th style={thStyle}>Calories</th>
          <th style={thStyle}>Protein</th>
          <th style={thStyle}>Carbs</th>
          <th style={thStyle}>Sugar</th>
          <th style={thStyle}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {meals.map((meal) => (
          <MealRowEditable
            key={meal.meal_id}
            meal={meal}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </tbody>
    </table>
  );
}
