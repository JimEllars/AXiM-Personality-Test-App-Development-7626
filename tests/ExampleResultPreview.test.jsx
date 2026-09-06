import { describe, it, expect, vi, beforeAll } from 'vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import ExampleResultPreview from '../src/components/personality/ExampleResultPreview';

// Mock matchMedia for Framer Motion
window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // deprecated
  removeListener: vi.fn(), // deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock IntersectionObserver
beforeAll(() => {
  class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.IntersectionObserver = IntersectionObserver;
});

describe('ExampleResultPreview', () => {
  it('renders the mock scores and annotations properly', () => {
    const onStartMock = vi.fn();
    render(<ExampleResultPreview onStart={onStartMock} />);

    // Check header
    expect(screen.getByText('Your Cognitive Signature')).toBeDefined();

    // Check annotations
    expect(screen.getByText('Continuous Function Trait Spectrum')).toBeDefined();
    expect(screen.getByText('Multi-Axis Functional Landscape')).toBeDefined();
    expect(screen.getByText('Probabilistic IRT Confidence')).toBeDefined();
    expect(screen.getByText('Actionable Behavioral Blueprints')).toBeDefined();
    expect(screen.getAllByText('Executive PDF Dossier').length).toBeGreaterThan(0);

    // Check mock data
    expect(screen.getByText('INTJ — The Strategist')).toBeDefined();
    // In our component, we only render 'Ni' (func.label), not the full name.
    // We render 94 as the score.
    expect(screen.getAllByText('Ni').length).toBeGreaterThan(0);
    expect(screen.getByText('94')).toBeDefined();

    // Check CTA button
    expect(screen.getByRole('button', { name: /Begin Your Assessment/i })).toBeDefined();
  });
});
