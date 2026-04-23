/**
 * api.js – centralised API communication layer.
 * All requests to the FastAPI backend go through this module.
 */

const DEV_BASE_URL = "http://localhost:8000";
const PROD_BASE_URL = "/api";

export const BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "development" ? DEV_BASE_URL : PROD_BASE_URL);

function normalizeBaseUrl(url) {
  return url.replace(/\/$/, "");
}

const NORMALIZED_BASE_URL = normalizeBaseUrl(BASE_URL);
const SHOULD_RETRY_WITHOUT_API_PREFIX = NORMALIZED_BASE_URL === "/api";

function getApiUrl(path) {
  return `${NORMALIZED_BASE_URL}${path}`;
}

function shouldRetryWithoutApiPrefix(response) {
  return (
    SHOULD_RETRY_WITHOUT_API_PREFIX &&
    (response.status === 404 || response.status === 405)
  );
}

async function fetchWithApiFallback(path, options) {
  const primaryResponse = await fetch(getApiUrl(path), options);
  if (primaryResponse.ok || !shouldRetryWithoutApiPrefix(primaryResponse)) {
    return { response: primaryResponse, retriedWithoutApiPrefix: false };
  }

  const fallbackResponse = await fetch(path, options);
  return { response: fallbackResponse, retriedWithoutApiPrefix: true };
}

/**
 * POST /generate
 * @param {string} requirement - plain-English software requirement text
 * @returns {Promise<{test_cases, edge_cases, checklist}>}
 */
export async function generateTestArtifacts(requirement) {
  const { response, retriedWithoutApiPrefix } = await fetchWithApiFallback("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requirement }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const fallbackSuffix = retriedWithoutApiPrefix
      ? " (after retry without /api)"
      : "";
    throw new Error(err.detail || `Server error: ${response.status}${fallbackSuffix}`);
  }

  return response.json();
}

/**
 * GET /history
 * @returns {Promise<Array>} list of previous generation records
 */
export async function fetchHistory() {
  const { response, retriedWithoutApiPrefix } = await fetchWithApiFallback("/history");
  if (!response.ok) {
    const fallbackSuffix = retriedWithoutApiPrefix
      ? " (after retry without /api)"
      : "";
    throw new Error(`Failed to fetch history: ${response.status}${fallbackSuffix}`);
  }
  return response.json();
}
