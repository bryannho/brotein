interface Props {
  calories: number
  caloriesGoal: number
  protein: number
  proteinGoal: number
  carbs: number
  carbsGoal: number
  fat: number
  fatGoal: number
  sugar: number
  sugarGoal: number
}

function Ring({
  size,
  strokeWidth,
  progress,
  color,
  trackColor = 'var(--color-border)',
  glow = false,
}: {
  size: number
  strokeWidth: number
  progress: number
  color: string
  trackColor?: string
  glow?: boolean
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(Math.max(progress, 0), 1)
  const offset = circumference * (1 - clamped)
  const center = size / 2
  const filterId = glow ? `glow-${size}` : undefined

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {glow && (
        <defs>
          <filter id={filterId}>
            <feGaussianBlur stdDeviation="0.75" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
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
        filter={glow ? `url(#${filterId})` : undefined}
      />
    </svg>
  )
}

function MacroBar({
  label,
  value,
  goal,
  color,
}: {
  label: string
  value: number
  goal: number
  color: string
}) {
  const progress = goal > 0 ? Math.min(value / goal, 1) : 0
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '0.2rem',
        }}
      >
        <span
          style={{
            fontSize: '0.7em',
            fontWeight: 600,
            color,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: '0.8em',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {Math.round(value)} / {Math.round(goal)}g
        </span>
      </div>
      <div
        style={{
          height: '6px',
          borderRadius: '3px',
          background: 'var(--color-border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress * 100}%`,
            borderRadius: '3px',
            background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 50%, transparent))`,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  )
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
  const calProgress = caloriesGoal > 0 ? calories / caloriesGoal : 0
  const ringSize = 140

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '0.5rem 0',
      }}
    >
      {/* Calorie ring */}
      <div style={{ position: 'relative', width: ringSize, height: ringSize, flexShrink: 0 }}>
        <Ring
          size={ringSize}
          strokeWidth={10}
          progress={calProgress}
          color="var(--color-calories)"
          glow
        />
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
          <span
            style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: '0.15rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {calories.toLocaleString()}
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            / {caloriesGoal.toLocaleString()} cal
          </span>
        </div>
      </div>

      {/* Macro bars */}
      <div style={{ flex: 1 }}>
        <MacroBar label="Protein" value={protein} goal={proteinGoal} color="var(--color-protein)" />
        <MacroBar label="Carbs" value={carbs} goal={carbsGoal} color="var(--color-carbs)" />
        <MacroBar label="Fat" value={fat} goal={fatGoal} color="var(--color-fat)" />
        <MacroBar label="Sugar" value={sugar} goal={sugarGoal} color="var(--color-sugar)" />
      </div>
    </div>
  )
}
