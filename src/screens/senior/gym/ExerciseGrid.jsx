// Hier werden die Uebungen als einfaches Raster angezeigt.
// Autor: Wilfred Feyem
export function ExerciseGrid({ exercises, activeExercise, setActiveExercise, feedbackActive, onSelect }) {
  return (
    <div className={`exercise-grid ${feedbackActive ? 'is-updated' : ''}`}>
      {exercises.map((exercise) => (
        <button
          type="button"
          key={exercise.id}
          className={`exercise-card ${activeExercise === exercise.id ? 'is-active' : ''} ${exercise.done ? 'is-done' : ''}`}
          onClick={() => {
            setActiveExercise(exercise.id)
            onSelect()
          }}
        >
          <div className="exercise-emoji">{getExerciseIcon(exercise)}</div>
          <div className="exercise-meta">
            <strong>{exercise.name}</strong>
          </div>
          <span className="exercise-check">{exercise.done ? '✓' : '○'}</span>
        </button>
      ))}
    </div>
  )
}

function getExerciseIcon(exercise) {
  const name = exercise.name.toLowerCase()
  if (name.includes('lauf') || name.includes('geh')) return '🚶'
  if (name.includes('rücken') || name.includes('ruecken')) return '🤸'
  if (name.includes('meditation')) return '🧘'
  if (name.includes('bein')) return '🧍'
  return exercise.emoji || '🏋️'
}
