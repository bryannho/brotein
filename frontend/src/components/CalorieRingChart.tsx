interface Props {
  calories: number;
  caloriesGoal: number;
  protein: number;
  proteinGoal: number;
  carbs: number;
  carbsGoal: number;
  fat: number;
  fatGoal: number;
  sugar: number;
  sugarGoal: number;
}

function Ring({
  size,
  strokeWidth,
  progress,
  color,
  trackColor = '#333',
}: {
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  trackColor?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const offset = circumference * (1 - clamped);
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
    </svg>
  );
}

function SmallRing({
  label,
  value,
  goal,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
}) {
  const ringSize = 70;
  const progress = goal > 0 ? value / goal : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
      <span style={{ fontSize: '0.7em', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <div style={{ position: 'relative', width: ringSize, height: ringSize }}>
        <Ring size={ringSize} strokeWidth={5} progress={progress} color={color} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '0.95em', fontWeight: 600 }}>
            {Math.round(value)}
          </span>
        </div>
      </div>
      <span style={{ fontSize: '0.75em', color: 'var(--color-text-secondary)' }}>
        / {Math.round(goal)}g
      </span>
    </div>
  );
}

export default function CalorieRingChart({
  calories,
  caloriesGoal,
  protein,
  proteinGoal,
  carbs,
  carbsGoal,
  fat,
  fatGoal,
  sugar,
  sugarGoal,
}: Props) {
  const calProgress = caloriesGoal > 0 ? calories / caloriesGoal : 0;
  const mainSize = 180;
  const mainStroke = 12;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '0.5rem 0' }}>
      {/* Main calorie ring */}
      <div style={{ position: 'relative', width: mainSize, height: mainSize }}>
        <Ring size={mainSize} strokeWidth={mainStroke} progress={calProgress} color="var(--color-calories)" />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.1 }}>
            {calories.toLocaleString()}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            / {caloriesGoal.toLocaleString()} cal
          </span>
        </div>
      </div>

      {/* Small macro rings */}
      <div style={{ display: 'flex', gap: '1.75rem', justifyContent: 'center' }}>
        <SmallRing label="Protein" value={protein} goal={proteinGoal} color="var(--color-protein)" />
        <SmallRing label="Carbs" value={carbs} goal={carbsGoal} color="var(--color-carbs)" />
        <SmallRing label="Fat" value={fat} goal={fatGoal} color="var(--color-fat)" />
        <SmallRing label="Sugar" value={sugar} goal={sugarGoal} color="var(--color-sugar)" />
      </div>
    </div>
  );
}
