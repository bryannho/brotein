import type { Meal } from '../types';

interface Props {
  meals: Meal[];
}

function MealCard({
  meal,
  onUpdate,
  onDelete,
}: {
  meal: Meal;
  onUpdate: (mealId: string, field: string, value: number) => void;
  onDelete: (mealId: string) => void;
}) {
  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}
      >
        <span style={{ fontWeight: 600 }}>
          {meal.text_input || '(no description)'}
        </span>
        <button
          onClick={() => onDelete(meal.meal_id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-danger)',
            cursor: 'pointer',
            fontSize: '1.1em',
            padding: '0.2em 0.4em',
          }}
          title="Delete meal"
        >
          &times;
        </button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
        }}
      >
        {(['calories', 'protein', 'carbs', 'sugar'] as const).map((field) => (
          <div key={field}>
            <div style={{ fontSize: '0.75em', color: 'var(--color-text-secondary)', marginBottom: '0.15rem' }}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </div>
            <input
              type="number"
              style={{ width: '100%', padding: '0.3em', fontSize: '0.9em', textAlign: 'center' }}
              defaultValue={meal[field]}
              onBlur={(e) =>
                onUpdate(meal.meal_id, field, Number(e.target.value))
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MealList({ meals }: Props) {
  const handleUpdate = (mealId: string, field: string, value: number) => {
    console.log('Update meal', mealId, field, value);
  };

  const handleDelete = (mealId: string) => {
    console.log('Delete meal', mealId);
  };

  if (meals.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        No meals logged yet.
      </p>
    );
  }

  return (
    <div className="meal-cards">
      {meals.map((meal) => (
        <MealCard
          key={meal.meal_id}
          meal={meal}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
