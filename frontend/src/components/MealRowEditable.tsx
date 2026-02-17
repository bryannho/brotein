import type { Meal } from '../types';

interface Props {
  meal: Meal;
  onUpdate: (mealId: string, field: string, value: number) => void;
  onDelete: (mealId: string) => void;
}

const inputStyle: React.CSSProperties = {
  width: '60px',
  padding: '0.3em',
  fontSize: '0.9em',
  textAlign: 'center',
  borderRadius: '4px',
  border: '1px solid #555',
  background: '#2a2a2a',
  color: 'inherit',
};

export default function MealRowEditable({ meal, onUpdate, onDelete }: Props) {
  return (
    <tr>
      <td style={{ padding: '0.5rem' }}>
        {meal.text_input || '(no description)'}
      </td>
      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
        <input
          type="number"
          style={inputStyle}
          defaultValue={meal.calories}
          onBlur={(e) =>
            onUpdate(meal.meal_id, 'calories', Number(e.target.value))
          }
        />
      </td>
      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
        <input
          type="number"
          style={inputStyle}
          defaultValue={meal.protein}
          onBlur={(e) =>
            onUpdate(meal.meal_id, 'protein', Number(e.target.value))
          }
        />
      </td>
      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
        <input
          type="number"
          style={inputStyle}
          defaultValue={meal.carbs}
          onBlur={(e) =>
            onUpdate(meal.meal_id, 'carbs', Number(e.target.value))
          }
        />
      </td>
      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
        <input
          type="number"
          style={inputStyle}
          defaultValue={meal.sugar}
          onBlur={(e) =>
            onUpdate(meal.meal_id, 'sugar', Number(e.target.value))
          }
        />
      </td>
      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
        <button
          onClick={() => onDelete(meal.meal_id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ff6b6b',
            cursor: 'pointer',
            fontSize: '1.1em',
          }}
          title="Delete meal"
        >
          X
        </button>
      </td>
    </tr>
  );
}
