import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import ResultView from '../src/components/personality/ResultView';
import { usePersonalityStore } from '../src/store/usePersonalityStore';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('ResultView', () => {
  beforeAll(() => { window.scrollTo = vi.fn(); });
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing even when data is null or incomplete', () => {
    usePersonalityStore.setState({
      screen: 'results',
      assignedArchetype: null,
      thetaScores: null,
      semScores: null,
      assessmentMetrics: null,
      confidence: null,
      proximityRanking: null,
      resultHistory: null
    });

    render(<ResultView />);

    // Test if a core text like "Your closest cognitive archetype is" rendered properly
    expect(screen.getByText(/Your closest cognitive archetype is/i)).toBeTruthy();
  });
});
