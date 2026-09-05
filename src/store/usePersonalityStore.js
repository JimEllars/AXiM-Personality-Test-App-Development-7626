import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialState = {
  screen: 'intro',
  currentClusterIndex: 0,
  demographics: { age: '', region: '', explicitConsent: false },
  answers: {},
  thetaScores: {},
  semScores: {},
  assignedArchetype: null,
  confidence: 0,
  proximityRanking: []
};

export const usePersonalityStore = create()(
  persist(
    (set) => ({
      ...initialState,
      setScreen: (screen) => set({ screen }),
      setDemographics: (data) =>
        set((state) => ({
          demographics: { ...state.demographics, ...data }
        })),
      setAnswer: (itemId, value) =>
        set((state) => ({
          answers: { ...state.answers, [itemId]: value }
        })),
      nextCluster: () =>
        set((state) => ({
          currentClusterIndex: state.currentClusterIndex + 1
        })),
      prevCluster: () =>
        set((state) => ({
          currentClusterIndex: Math.max(0, state.currentClusterIndex - 1)
        })),
      setResults: (thetaScores, result) =>
        set({
          thetaScores,
          assignedArchetype: result.archetype,
          confidence: result.confidence,
          proximityRanking: result.proximityRanking,
          screen: 'results'
        }),
      resetAssessment: () => set({ ...initialState })
    }),
    {
      name: 'axim_personality_session',
      partialize: (state) => ({
        screen: state.screen,
        currentClusterIndex: state.currentClusterIndex,
        demographics: state.demographics,
        answers: state.answers,
        thetaScores: state.thetaScores,
        assignedArchetype: state.assignedArchetype,
        confidence: state.confidence,
        proximityRanking: state.proximityRanking
      })
    }
  )
);