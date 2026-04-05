/**
 * api.js – centralised API communication layer.
 * All requests to the FastAPI backend go through this module.
 */

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

/**
 * POST /generate
 * @param {string} requirement - plain-English software requirement text
 * @returns {Promise<{test_cases, edge_cases, checklist}>}
 */
export async function generateTestArtifacts(requirement) {
  const response = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requirement }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Server error: ${response.status}`);
  }

  return response.json();
}

/**
 * GET /history
 * @returns {Promise<Array>} list of previous generation records
 */
export async function fetchHistory() {
  const response = await fetch(`${BASE_URL}/history`);
  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.status}`);
  }
  return response.json();
}
