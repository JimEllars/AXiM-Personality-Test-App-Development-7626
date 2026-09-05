import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { scoreAssessmentDiagnostics } from '../services/psychometrics/irtEngine';
import { QUESTION_BANK, FUNCTION_KEYS } from '../data/questionBank';
import { trackEvent } from '../services/telemetry';
import { submitAssessment } from '../services/personalityApi';

const STORAGE_VERSION = 4;

const initialState = {
  screen: 'intro',
  currentClusterIndex: 0,
  demographics: {
    age: '',
    region: '',
    explicitConsent: false
  },
  answers: {},
  thetaScores: {},
  semScores: {},
  assessmentMetrics: {
    answeredCount: 0,
    totalItems: 0,
    coverage: 0,
    averageSem: 0
  },
  assignedArchetype: null,
  confidence: 0,
  proximityRanking: [],
  resultHistory: [],
  completedExercises: {},
  exerciseNotes: {},
  exerciseStartedAt: {},
  bookmarkedInsights: {},
  pendingSync: []
};

function isValidSession(value) {
  return (
    value &&
    typeof value === 'object' &&
    value.answers &&
    typeof value.answers === 'object'
  );
}

function normalizeMetrics(metrics = {}) {
  return {
    ...initialState.assessmentMetrics,
    ...metrics,
    answeredCount: Number(metrics.answeredCount) || 0,
    totalItems: Number(metrics.totalItems) || 0,
    coverage: Number(metrics.coverage) || 0,
    averageSem: Number(metrics.averageSem) || 0
  };
}

function normalizeHistory(history = []) {
  if (!Array.isArray(history)) return [];

  return history
    .filter((snapshot) => snapshot && typeof snapshot === 'object')
    .map((snapshot, index) => ({
      id: snapshot.id || `attempt-${index + 1}-${Date.now()}`,
      generatedAt: snapshot.generatedAt || new Date().toISOString(),
      assignedArchetype: snapshot.assignedArchetype || null,
      thetaScores: snapshot.thetaScores || {},
      confidence: Number(snapshot.confidence) || 0,
      assessmentMetrics: normalizeMetrics(snapshot.assessmentMetrics)
    }))
    .slice(-5);
}

function createResultSnapshot(state) {
  if (!state.assignedArchetype) return null;

  return {
    id: `attempt-${Date.now()}-${state.resultHistory.length + 1}`,
    generatedAt: new Date().toISOString(),
    assignedArchetype: state.assignedArchetype,
    thetaScores: { ...state.thetaScores },
    confidence: state.confidence,
    assessmentMetrics: { ...state.assessmentMetrics }
  };
}

export const usePersonalityStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      setScreen: (screen) => {
        trackEvent('screen_view', { screen });
        set({ screen });
      },

      setDemographics: (data) =>
        set((state) => ({
          demographics: {
            ...state.demographics,
            ...data
          }
        })),

      setAnswer: (itemId, value) =>
        set((state) => {
          const nextAnswers = {
            ...state.answers,
            [itemId]: value
          };
          const metrics = scoreAssessmentDiagnostics(QUESTION_BANK, nextAnswers, FUNCTION_KEYS);
          return {
            answers: nextAnswers,
            thetaScores: metrics.thetaScores,
            semScores: metrics.semScores,
            assessmentMetrics: { ...state.assessmentMetrics, ...metrics }
          };
        }),

      setClusterIndex: (currentClusterIndex) =>
        set({
          currentClusterIndex: Math.max(0, currentClusterIndex)
        }),

      nextCluster: () =>
        set((state) => ({
          currentClusterIndex: state.currentClusterIndex + 1
        })),

      prevCluster: () =>
        set((state) => ({
          currentClusterIndex: Math.max(0, state.currentClusterIndex - 1)
        })),

      setResults: (thetaScores, result, metrics = {}) => {
        set((state) => {
          const previousSnapshot = createResultSnapshot(state);
          const nextHistory = previousSnapshot
            ? [...state.resultHistory, previousSnapshot].slice(-5)
            : state.resultHistory;

          return {
            thetaScores: { ...thetaScores },
            semScores: { ...(metrics.semScores || {}) },
            assessmentMetrics: normalizeMetrics(metrics),
            assignedArchetype: result.archetype,
            confidence: result.confidence,
            proximityRanking: result.proximityRanking,
            resultHistory: nextHistory,
            screen: 'results'
          };
        });

        // Syndicate to AXiM Core if authenticated via Edge Worker API
        const token = localStorage.getItem('axim_passport_token');
        if (token) {
          const currentState = get();
          const payload = {
            token,
            assignedArchetype: result.archetype,
            thetaScores,
            completedAt: new Date().toISOString(),
            answers: currentState.answers
          };

          submitAssessment(payload).then(res => {
            if (!res.success) {
              set(state => ({ pendingSync: [...(state.pendingSync || []), payload] }));
            }
          }).catch(err => {
            console.error("Failed to syndicate profile", err);
            set(state => ({ pendingSync: [...(state.pendingSync || []), payload] }));
          });
        }
      },


      flushPendingSync: async () => {
        const state = get();
        if (!state.pendingSync || state.pendingSync.length === 0) return;

        if (!navigator.onLine) return;

        const stillPending = [];
        for (const payload of state.pendingSync) {
          try {
            const res = await submitAssessment(payload);
            if (!res.success) {
              stillPending.push(payload);
            }
          } catch (err) {
            stillPending.push(payload);
          }
        }

        set({ pendingSync: stillPending });
      },


      resumeAssessment: () => {
        set((state) => {
          if (state.assignedArchetype) {
             return { screen: 'results' };
          }
          if (Object.keys(state.answers).length > 0) {
             return { screen: 'assessment' }; // Preserve currentClusterIndex and answers
          }
          return { screen: 'assessment', currentClusterIndex: 0 };
        });
      },

      startRetake: () => {
        trackEvent('assessment_retake');
        set((state) => ({
          screen: 'assessment',
          currentClusterIndex: 0,
          answers: {},
          thetaScores: {},
          semScores: {},
          assessmentMetrics: { ...initialState.assessmentMetrics },
          assignedArchetype: null,
          confidence: 0,
          proximityRanking: [],
          completedExercises: {},
          exerciseNotes: {},
          exerciseStartedAt: {},
          bookmarkedInsights: {},

          // The completed result is already archived by setResults.
          // Keeping this list unchanged prevents duplicate attempts.
          resultHistory: state.resultHistory
        }));
      },

      toggleExercise: (exerciseId) =>
        set((state) => ({
          completedExercises: {
            ...state.completedExercises,
            [exerciseId]: !state.completedExercises[exerciseId]
          }
        })),

      setExerciseNote: (exerciseId, note) =>
        set((state) => ({
          exerciseNotes: {
            ...state.exerciseNotes,
            [exerciseId]: note
          }
        })),

      markExerciseStarted: (exerciseId) =>
        set((state) => ({
          exerciseStartedAt: {
            ...state.exerciseStartedAt,
            [exerciseId]:
              state.exerciseStartedAt[exerciseId] ||
              new Date().toISOString()
          }
        })),

      toggleInsightBookmark: (insightId) =>
        set((state) => ({
          bookmarkedInsights: {
            ...state.bookmarkedInsights,
            [insightId]: !state.bookmarkedInsights[insightId]
          }
        })),

      clearInsightBookmarks: () => set({ bookmarkedInsights: {} }),

      clearExerciseProgress: () =>
        set({
          completedExercises: {},
          exerciseNotes: {},
          exerciseStartedAt: {}
        }),

      resetAssessment: () => set({ ...initialState })
    }),
    {
      name: 'axim_personality_session',
      version: STORAGE_VERSION,

      partialize: (state) => ({
        screen: state.screen,
        currentClusterIndex: state.currentClusterIndex,
        demographics: state.demographics,
        answers: state.answers,
        thetaScores: state.thetaScores,
        semScores: state.semScores,
        assessmentMetrics: state.assessmentMetrics,
        assignedArchetype: state.assignedArchetype,
        confidence: state.confidence,
        proximityRanking: state.proximityRanking,
        resultHistory: state.resultHistory,
        completedExercises: state.completedExercises,
        exerciseNotes: state.exerciseNotes,
        exerciseStartedAt: state.exerciseStartedAt,
        bookmarkedInsights: state.bookmarkedInsights,
        pendingSync: state.pendingSync || []
      }),

      migrate: (persistedState) => {
        if (!isValidSession(persistedState)) return initialState;

        return {
          ...initialState,
          ...persistedState,
          demographics: {
            ...initialState.demographics,
            ...persistedState.demographics
          },
          assessmentMetrics: normalizeMetrics(
            persistedState.assessmentMetrics
          ),
          resultHistory: normalizeHistory(persistedState.resultHistory),
          currentClusterIndex: Math.max(
            0,
            Number(persistedState.currentClusterIndex) || 0
          )
        };
      }
    }
  )
);

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    usePersonalityStore.getState().flushPendingSync?.();
  });
}
