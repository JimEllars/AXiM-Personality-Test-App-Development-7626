import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, fireEvent, cleanup, waitFor } from '@testing-library/react';
import DemographicGateModal from '../src/components/personality/DemographicGateModal';
import { usePersonalityStore } from '../src/store/usePersonalityStore';

describe('DemographicGateModal Compliance & Gating', () => {
  beforeEach(() => {
    cleanup();
    usePersonalityStore.setState({
      demographics: { age: '', region: '', explicitConsent: false }
    });
  });

  it('renders explicit TDPSA consent copy', () => {
    const onClose = vi.fn();
    const onContinue = vi.fn();
    const { getByText } = render(<DemographicGateModal onClose={onClose} onContinue={onContinue} />);

    expect(getByText(/explicitly consent to the collection and processing/i)).toBeDefined();
  });

  it('triggers under-13 COPPA/TDPSA hard stop and blocks proceeding', async () => {
    const onClose = vi.fn();
    const onContinue = vi.fn();
    const { getByRole, getByText } = render(<DemographicGateModal onClose={onClose} onContinue={onContinue} />);

    const ageInput = getByRole('spinbutton');
    fireEvent.change(ageInput, { target: { value: '11' } });

    const submitBtn = getByRole('button', { name: /Continue securely/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(getByText(/Parental Verification Required/i)).toBeDefined();
      expect(getByText(/In compliance with COPPA and the Texas Data Privacy and Security Act/i)).toBeDefined();
    });
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('allows valid submission when age >= 13, region selected, and consent checked', () => {
    const onClose = vi.fn();
    const onContinue = vi.fn();
    const { getByRole } = render(<DemographicGateModal onClose={onClose} onContinue={onContinue} />);

    const ageInput = getByRole('spinbutton');
    fireEvent.change(ageInput, { target: { value: '25' } });

    const regionSelect = getByRole('combobox');
    fireEvent.change(regionSelect, { target: { value: 'United States' } });

    const consentCheckbox = getByRole('checkbox');
    fireEvent.click(consentCheckbox);

    const submitBtn = getByRole('button', { name: /Continue securely/i });
    fireEvent.click(submitBtn);

    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
