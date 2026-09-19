import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import {
  ScenarioCardInput,
  TradeoffSliderInput,
  ReactionDilemmaInput,
  ModernLikertInput
} from '../src/components/personality/inputs';

describe('Question Input Components', () => {
  afterEach(() => {
    cleanup();
  });

  it('ScenarioCardInput renders and responds to clicks', () => {
    const item = { id: 'test1', type: 'scenario', options: { left: 'Left', right: 'Right' } };
    const onChange = vi.fn();
    render(<ScenarioCardInput item={item} value={null} onChange={onChange} />);

    const radio2 = screen.getByRole('radio', { name: '2' });
    fireEvent.click(radio2);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('TradeoffSliderInput renders and responds to keyboard', () => {
    const item = { id: 'test2', type: 'tradeoff', options: { left: 'A', right: 'B' } };
    const onChange = vi.fn();
    render(<TradeoffSliderInput item={item} value={3} onChange={onChange} />);

    const slider = screen.getByRole('radiogroup');
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('ReactionDilemmaInput renders labels properly', () => {
    const item = {
      id: 'test3',
      type: 'reaction',
      options: { choices: [{ label: 'React A', description: '' }, { label: 'React B', description: '' }] }
    };
    render(<ReactionDilemmaInput item={item} value={5} onChange={() => {}} />);
    expect(screen.getByText('React A')).toBeTruthy();
    expect(screen.getByText('React B')).toBeTruthy();
  });

  it('ModernLikertInput sets specific styles when selected', () => {
    const item = { id: 'test4', type: 'likert' };
    render(<ModernLikertInput item={item} value={1} onChange={() => {}} />);
    const selectedOption = screen.getByText('Definitely Not').closest('label');
    expect(selectedOption.className).toContain('bg-blue-600');
  });
});
