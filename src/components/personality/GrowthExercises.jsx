import React, { useMemo, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { getPersonalizedExercises } from '../../data/growthExercises';
import { usePersonalityStore } from '../../store/usePersonalityStore';
import ExerciseCard from './ExerciseCard';
import './GrowthExercises.css';

const { FiCheck, FiClock, FiRefreshCw, FiTarget } = FiIcons;
const TRACKS = ['Natural strength', 'Growth edge'];

function GrowthExercises() {
  const store = usePersonalityStore();
  const [activeTrack, setActiveTrack] = useState(TRACKS[0]);

  const exercises = useMemo(
    () => getPersonalizedExercises(store.thetaScores),
    [store.thetaScores]
  );

  const visibleExercises = exercises.filter(
    (exercise) => exercise.track === activeTrack
  );
  const completedCount = exercises.filter(
    (exercise) => store.completedExercises[exercise.id]
  ).length;
  const startedCount = exercises.filter(
    (exercise) => store.exerciseStartedAt[exercise.id]
  ).length;
  const progress = exercises.length
    ? Math.round((completedCount / exercises.length) * 100)
    : 0;

  return (
    <section className="result-panel growth-exercises">
      <div className="exercises-heading">
        <div>
          <span className="card-kicker">
            <SafeIcon icon={FiTarget} /> Personalized practice
          </span>
          <h3>Turn insight into movement.</h3>
          <p>
            Follow the strength track to work with your natural tendencies. Use
            the growth track to build flexibility in your least-developed
            function.
          </p>
        </div>
        <div className="exercise-progress">
          <strong>{completedCount}/{exercises.length}</strong>
          <span>complete</span>
        </div>
      </div>

      <div className="exercise-summary">
        <div className="exercise-progress-bar">
          <span style={{ width: `${progress}%` }} />
        </div>
        <span>
          <SafeIcon icon={FiClock} /> {startedCount} started
        </span>
        <span>
          <SafeIcon icon={FiCheck} /> {progress}% complete
        </span>
      </div>

      <div className="exercise-tabs" role="tablist" aria-label="Growth tracks">
        {TRACKS.map((track) => (
          <button
            key={track}
            type="button"
            role="tab"
            aria-selected={activeTrack === track}
            className={activeTrack === track ? 'active' : ''}
            onClick={() => setActiveTrack(track)}
          >
            {track}
          </button>
        ))}
      </div>

      <div className="exercise-list">
        {visibleExercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            completed={Boolean(store.completedExercises[exercise.id])}
            note={store.exerciseNotes[exercise.id]}
            onComplete={() => store.toggleExercise(exercise.id)}
            onNoteChange={(note) => store.setExerciseNote(exercise.id, note)}
            onStart={() => store.markExerciseStarted(exercise.id)}
          />
        ))}
      </div>

      {completedCount > 0 && (
        <button
          className="exercise-reset"
          type="button"
          onClick={store.clearExerciseProgress}
        >
          <SafeIcon icon={FiRefreshCw} /> Reset exercise progress
        </button>
      )}
    </section>
  );
}

export default GrowthExercises;