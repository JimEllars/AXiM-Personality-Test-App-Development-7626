import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import LikertInput, { resolveLikertKey } from '../src/components/personality/LikertInput';

afterEach(() => {
  cleanup();
});

describe('resolveLikertKey', () => {
  it('increments on ArrowRight and ArrowUp up to 5', () => {
    expect(resolveLikertKey(2, 'ArrowRight')).toBe(3);
    expect(resolveLikertKey(4, 'ArrowUp')).toBe(5);
    expect(resolveLikertKey(5, 'ArrowRight')).toBeNull(); // Boundary clamp
  });

  it('decrements on ArrowLeft and ArrowDown down to 1', () => {
    expect(resolveLikertKey(4, 'ArrowLeft')).toBe(3);
    expect(resolveLikertKey(2, 'ArrowDown')).toBe(1);
    expect(resolveLikertKey(1, 'ArrowLeft')).toBeNull(); // Boundary clamp
  });

  it('maps direct numeric keys 1-5 and maps 7 to 5', () => {
    expect(resolveLikertKey(1, '4')).toBe(4);
    expect(resolveLikertKey(2, '7')).toBe(5);
    expect(resolveLikertKey(3, '3')).toBeNull(); // Same value no-op
  });
});

describe('LikertInput Component', () => {
  it('renders semantic radiogroup with ARIA radio elements', () => {
    render(<LikertInput itemId="q1" value={3} onChange={vi.fn()} />);
    expect(screen.getByRole('radiogroup')).toBeDefined();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(5);
    expect(radios[2].getAttribute('aria-checked')).toBe('true');
  });

  it('calls onChange when an option is clicked', () => {
    const handleChange = vi.fn();
    render(<LikertInput itemId="q1" value={2} onChange={handleChange} />);

    // Update with conversational label since questionBank was updated
    fireEvent.click(screen.getByText('Totally Me'));
    expect(handleChange).toHaveBeenCalledWith(5);
  });
});
