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

      {/* Teachable Partner CTA */}
      <div className="teachable-cta-inline" style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1rem'
      }}>
        <h4 style={{ margin: 0, color: '#1e293b' }}>
          Master Your {store.assignedArchetype || 'Profile'} Cognitive Strengths on Teachable
        </h4>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
          Explore structured video masterclasses and operational blueprints designed for your dominant cognitive function stack.
        </p>
        <a
          href="https://swiy.co/Teach1"
          target="_blank"
          rel="noopener noreferrer"
          className="primary-button"
          style={{ textDecoration: 'none' }}
        >
          Explore Recommended Courses on Teachable
        </a>
      </div>
    </section>
  );
}

export default GrowthExercises;
