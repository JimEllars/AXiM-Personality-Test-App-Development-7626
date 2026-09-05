import React, { useEffect, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCheck, FiClock, FiEdit3, FiSave } = FiIcons;

function ExerciseCard({
  exercise,
  completed,
  note,
  onComplete,
  onNoteChange,
  onStart
}) {
  const [expanded, setExpanded] = useState(Boolean(note));
  const [draft, setDraft] = useState(note || '');

  useEffect(() => {
    setDraft(note || '');
  }, [note]);

  const toggleDetails = () => {
    setExpanded((value) => !value);
    onStart();
  };

  const saveNote = () => {
    onNoteChange(draft.trim());
    setExpanded(false);
  };

  return (
    <article className={`exercise-card ${completed ? 'completed' : ''}`}>
      <button
        className="exercise-check"
        type="button"
        onClick={() => {
          onComplete();
          onStart();
        }}
        aria-label={`${completed ? 'Mark' : 'Complete'} ${exercise.title}`}
        aria-pressed={completed}
      >
        <SafeIcon icon={FiCheck} />
      </button>

      <div>
        <div className="exercise-meta">
          <span>{exercise.functionKey} · {exercise.focus}</span>
          <span>
            <SafeIcon icon={FiClock} /> {exercise.duration}
          </span>
        </div>

        <h4>{exercise.title}</h4>
        <p>{exercise.prompt}</p>
        <strong>Practice cue: {exercise.action}</strong>

        <button
          className="exercise-details-button"
          type="button"
          onClick={toggleDetails}
          aria-expanded={expanded}
        >
          <SafeIcon icon={FiEdit3} />
          {expanded ? 'Hide reflection' : 'Add reflection'}
        </button>

        {expanded && (
          <div className="exercise-reflection">
            <label htmlFor={`note-${exercise.id}`}>
              What did you notice?
            </label>
            <textarea
              id={`note-${exercise.id}`}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onFocus={onStart}
              placeholder="Capture an observation, result, or next step..."
              rows="3"
            />
            <button
              className="exercise-save"
              type="button"
              onClick={saveNote}
            >
              <SafeIcon icon={FiSave} /> Save reflection
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default ExerciseCard;