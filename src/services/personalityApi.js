// For a full-stack Cloudflare Pages deployment, relative `/api` paths work best.
// If deployed standalone, it falls back to the VITE_EDGE_WORKER_URL env var, or localhost.
import { scoreAssessmentDiagnostics } from './psychometrics/irtEngine';
import { trackEvent } from './telemetry';
import { QUESTION_BANK, FUNCTION_KEYS } from '../data/questionBank';

const WORKER_URL = import.meta.env.VITE_EDGE_WORKER_URL || (import.meta.env.PROD ? (import.meta.env.BASE_URL.replace(/\/$/, '') || '') : 'http://localhost:8787');

async function fetchWithTimeout(url, options = {}) {
  const timeout = options.timeout || 3000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function submitAssessment(data) {
  try {
    const response = await fetchWithTimeout(`${WORKER_URL}/api/v1/assessment/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      timeout: 3000
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to submit assessment to edge worker:', error);
    trackEvent('api_fallback', { endpoint: '/api/submit', error: error.message });
    return { success: false, error: error.message };
  }
}

export async function scoreAssessment({ answers, metrics }) {
  try {
    const response = await fetchWithTimeout(`${WORKER_URL}/api/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
      timeout: 3000
    });
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch from edge worker, falling back to local IRT computation:', error);
    trackEvent('api_fallback', { endpoint: '/api/score', error: error.message });

    // Fallback to local computation
    const localMetrics = scoreAssessmentDiagnostics(QUESTION_BANK, answers, FUNCTION_KEYS);
    return { success: true, result: localMetrics, fallback: true };
  }
}

export async function emailReport(data) {
  try {
    const response = await fetchWithTimeout(`${WORKER_URL}/api/v1/personality/email-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      timeout: 3000
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to email report via edge worker:', error);
    return { success: false, error: error.message };
  }
}

export async function getBenchmarks() {
  try {
    const response = await fetchWithTimeout(`${WORKER_URL}/api/v1/personality/benchmarks`, {
      timeout: 3000
    });
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch benchmarks, using local fallback:', error);
    // Fallback data
    return {
      "Ti": 0.1, "Te": -0.2, "Fi": 0.3, "Fe": -0.1,
      "Ni": -0.4, "Ne": 0.2, "Si": 0.5, "Se": -0.3
    };
  }
}
