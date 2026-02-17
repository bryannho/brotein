import type { MacroTotals, Goals } from '../types';
import CalorieRingChart from './CalorieRingChart';

interface Props {
  totals: MacroTotals;
  goals?: Goals;
}

export default function DailySummaryCard({ totals, goals }: Props) {
  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <CalorieRingChart
        calories={totals.calories}
        caloriesGoal={goals?.calories_goal ?? 0}
        protein={totals.protein}
        proteinGoal={goals?.protein_goal ?? 0}
        carbs={totals.carbs}
        carbsGoal={goals?.carbs_goal ?? 0}
        fat={totals.fat}
        fatGoal={goals?.fat_goal ?? 0}
        sugar={totals.sugar}
        sugarGoal={goals?.sugar_goal ?? 0}
      />
    </div>
  );
}
