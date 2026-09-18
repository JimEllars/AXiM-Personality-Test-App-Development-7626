import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { scoreAssessmentDiagnostics } from '../services/psychometrics/irtEngine';
import { projectArchetype } from '../services/psychometrics/archetypeProjector';
import { QUESTION_BANK, FUNCTION_KEYS } from '../data/questionBank';
import { trackEvent } from '../services/telemetry';
import { submitAssessment, scoreAssessment } from '../services/personalityApi';
import { ASSESSMENT_CLUSTERS } from '../data/questionBank';

const STORAGE_VERSION = 1;

const initialState = {
  screen: 'intro',
  activeSessionId: null,
  currentClusterIndex: 0,
  startedAt: null,
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
          sharedResultData: null,
  pendingSync: [],
  isSyncing: false
};

function isValidSession(value) {
  if (!value || typeof value !== 'object') return false;

  // Strict check on schema integrity
  if (value.answers !== undefined && (typeof value.answers !== 'object' || value.answers === null)) return false;
  if (value.demographics !== undefined && (typeof value.demographics !== 'object' || value.demographics === null)) return false;

  return true;
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


// Safe storage wrapper to handle QuotaExceededError and incognito
const safeStorage = {
  getItem: (name) => {
    try {
      // Requirements dictate using sessionStorage for active mid-test persist where possible.
      const value = sessionStorage.getItem(name) || localStorage.getItem(name);
      return value;
    } catch (e) {
      console.warn('Storage unavailable or corrupted (getItem)', e);
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      // Defaulting to sessionStorage for mid-assessment state
      sessionStorage.setItem(name, value);
      // We still backup to localStorage for demographics/history sync just in case
      localStorage.setItem(name, value);
    } catch (e) {
      console.warn('Storage unavailable or quota exceeded (setItem)', e);
    }
  },
  removeItem: (name) => {
    try {
      sessionStorage.removeItem(name);
      localStorage.removeItem(name);
    } catch (e) {
      console.warn('Storage unavailable (removeItem)', e);
    }
  }
};


export function validateAssessmentIntegrity(state) {
  let isValid = true;
  const sanitizedAnswers = {};

  if (state.answers) {
    Object.entries(state.answers).forEach(([key, value]) => {
      const numValue = Number(value);
      if (Number.isInteger(numValue) && numValue >= 1 && numValue <= 5) {
        sanitizedAnswers[key] = numValue;
      } else {
        isValid = false;
      }
    });
  }

  let sanitizedIndex = Number(state.currentClusterIndex);
  if (!Number.isInteger(sanitizedIndex) || sanitizedIndex < 0 || sanitizedIndex >= ASSESSMENT_CLUSTERS.length) {
    isValid = false;
    sanitizedIndex = 0;
  }

  return { isValid, sanitizedAnswers, sanitizedIndex };
}

export const usePersonalityStore = create(

  persist(
    (set, get) => ({

      ...initialState,

      setScreen: (screen) => {
        if (get().screen !== screen) {
          trackEvent('screen_view', { screen });
        }
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


      finalizeAssessment: async () => {
        const state = get();
        try {
          const hasAnswers = state.answers && Object.keys(state.answers).length > 0;
          let metrics;

          if (!hasAnswers) {
            console.warn("Invoked IRT calculation prematurely. Returning default neutral theta values.");
            metrics = { thetaScores: {}, semScores: {}, answeredCount: 0, totalItems: 0, coverage: 0, averageSem: 0, isDefaultFlag: true };
          } else {
            metrics = scoreAssessmentDiagnostics(QUESTION_BANK, state.answers, FUNCTION_KEYS);
          }

          const result = projectArchetype(metrics.thetaScores);

          // Try to score externally if available (fallback handles the rest in scoreAssessment API)
          try {

             if (scoreAssessment) {
                const apiResult = await scoreAssessment({ answers: state.answers, metrics });
                if (apiResult && apiResult.success && apiResult.result) {
                   // We could use the API result here if it differed from local calculation
                   // For now we just use it for side-effects / fallback logging
                }
             }
          } catch(e) {
             // Ignore API module loading error
          }

          get().setResults(metrics.thetaScores, result, metrics);
        } catch (err) {
          console.error('Error calculating results:', err);
          get().setResults({}, { archetype: 'Explorer', confidence: 0, proximityRanking: [] }, { thetaScores: {}, semScores: {} });
        }
      },

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

          // Background sync
          Promise.resolve().then(() => {
            submitAssessment(payload).then(res => {
              if (!res.success) {
                set(state => ({ pendingSync: [...(state.pendingSync || []), { ...payload, synced: false }] }));
              }
            }).catch(err => {
              console.error("Failed to syndicate profile", err);
              set(state => ({ pendingSync: [...(state.pendingSync || []), { ...payload, synced: false }] }));
            });
          });
        }
      },


      flushPendingSync: async () => {
        const state = get();
        if (state.isSyncing) return;
        if (!state.pendingSync || state.pendingSync.length === 0) return;

        if (!navigator.onLine) return;
        set({ isSyncing: true });

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

        set({ pendingSync: stillPending, isSyncing: false });
      },


      resumeAssessment: () => {
        set((state) => {
          if (state.assignedArchetype) {
             return { screen: 'results' };
          }
          if (Object.keys(state.answers).length > 0) {
             // Preserve currentClusterIndex and answers, make sure we have a startedAt
             return { screen: 'assessment', activeSessionId: state.activeSessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        startedAt: state.startedAt || Date.now(), demographics: state.demographics };
          }
          return { screen: 'assessment', currentClusterIndex: 0, activeSessionId: state.activeSessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, startedAt: Date.now(), demographics: state.demographics };
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
          sharedResultData: null,

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

      setSharedResultData: (data) => set({ sharedResultData: data, screen: "results" }),
      clearSharedResultData: () => set({ sharedResultData: null }),


      clearExerciseProgress: () =>
        set({
          completedExercises: {},
          exerciseNotes: {},
          exerciseStartedAt: {}
        }),

      auditStoreIntegrity: () => {
        const state = get();
        const { isValid, sanitizedAnswers, sanitizedIndex } = validateAssessmentIntegrity(state);

        if (!isValid) {
          set({
            answers: sanitizedAnswers,
            currentClusterIndex: sanitizedIndex
          });
        }

        return { isValid, sanitizedAnswers, sanitizedIndex };
      },


      resetAssessment: () => set((state) => ({ ...initialState, activeSessionId: null, demographics: { ...state.demographics }, resultHistory: [...state.resultHistory] }))
    }),
    {
      name: 'axim_personality_session',
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => safeStorage),
      onRehydrateStorage: () => (state, error) => { if (error) { console.error("Hydration failed", error); state?.resetAssessment?.(); } },

      partialize: (state) => ({
        screen: state.screen,
        activeSessionId: state.activeSessionId,
        currentClusterIndex: state.currentClusterIndex,
        demographics: state.demographics,
        answers: state.answers,
        responses: state.answers,
        currentQuestionIndex: state.currentClusterIndex,
        startedAt: state.startedAt || Date.now(),
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
        pendingSync: state.pendingSync || [],
        isSyncing: state.isSyncing || false
      }),

      migrate: (persistedState, version) => {
        try {
          if (!isValidSession(persistedState)) return initialState;

          let migratedAnswers = persistedState.answers || persistedState.responses || {};
          let migratedClusterIndex = Math.max(0, Number(persistedState.currentClusterIndex) || Number(persistedState.currentQuestionIndex) || 0);


          if (version !== STORAGE_VERSION && version !== 0 && version !== undefined) {
             // Schema mismatch - preserve demographics but reset incompatible answers & indexes
             migratedAnswers = {};
             migratedClusterIndex = 0;
          }

          const { isValid, sanitizedAnswers, sanitizedIndex } = validateAssessmentIntegrity({
             answers: migratedAnswers,
             currentClusterIndex: migratedClusterIndex
          });

          if (!isValid) {
             migratedAnswers = sanitizedAnswers;
             migratedClusterIndex = sanitizedIndex;
          }


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
            currentClusterIndex: migratedClusterIndex,
            answers: migratedAnswers,
            startedAt: persistedState.startedAt || Date.now()
          };
        } catch (e) {
          console.error("Failed to migrate store", e);
          return initialState;
        }
      }
    }
  )
);

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    usePersonalityStore.getState().flushPendingSync?.();
  });
}
