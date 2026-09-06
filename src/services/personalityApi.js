// For a full-stack Cloudflare Pages deployment, relative `/api` paths work best.
// If deployed standalone, it falls back to the VITE_EDGE_WORKER_URL env var, or localhost.
const WORKER_URL = import.meta.env.VITE_EDGE_WORKER_URL || (import.meta.env.PROD ? (import.meta.env.BASE_URL.replace(/\/$/, '') || '') : 'http://localhost:8787');

export async function submitAssessment(data) {
  try {
    const response = await fetch(`${WORKER_URL}/api/v1/assessment/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to submit assessment to edge worker:', error);
    return { success: false, error };
  }
}

export async function emailReport(data) {
  try {
    const response = await fetch(`${WORKER_URL}/api/v1/personality/email-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to email report via edge worker:', error);
    return { success: false, error };
  }
}

export async function getBenchmarks() {
  try {
    const response = await fetch(`${WORKER_URL}/api/v1/personality/benchmarks`);
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
