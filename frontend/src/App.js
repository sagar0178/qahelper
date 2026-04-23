/**
 * App.jsx – root component for the AI Test Case Generator.
 *
 * Layout:
 *   - Header with app name
 *   - Requirement input form (left/top on desktop)
 *   - Tabbed output panel (right/bottom on desktop)
 */

import React, { useState } from "react";
import "./App.css";
import RequirementInput from "./components/RequirementInput";
import OutputTabs from "./components/OutputTabs";
import { generateTestArtifacts } from "./services/api";

function App() {
  // ── State ────────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [currentRequirement, setCurrentRequirement] = useState("");

  // ── Handler ───────────────────────────────────────────────────────────────
  const handleGenerate = async (requirement) => {
    setIsLoading(true);
    setError(null);
    setCurrentRequirement(requirement);

    try {
      const data = await generateTestArtifacts(requirement);
      setResult(data);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <span className="text-2xl">🧪</span>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              AI Test Case Generator
            </h1>
            <p className="text-xs text-gray-500">
              Generate test cases, edge cases &amp; QA checklists from requirements
            </p>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column: input form ──────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600
                                  flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Enter Requirement
              </h2>

              <RequirementInput
                onGenerate={handleGenerate}
                isLoading={isLoading}
              />

              {/* Current requirement display */}
              {currentRequirement && !isLoading && (
                <div className="mt-4 rounded-lg bg-indigo-50 border border-indigo-100 p-3">
                  <p className="text-xs font-semibold text-indigo-600 mb-1">
                    Last generated for:
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {currentRequirement}
                  </p>
                </div>
              )}
            </div>

            {/* Tips card */}
            <div className="mt-4 bg-amber-50 rounded-xl border border-amber-200 p-4">
              <h3 className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1">
                💡 Tips for better results
              </h3>
              <ul className="space-y-1 text-xs text-amber-800">
                <li>• Be specific about the feature or user action</li>
                <li>• Include the actor (user / admin / system)</li>
                <li>• Mention the goal or expected outcome</li>
                <li>• Example: "User should be able to reset their password via email"</li>
              </ul>
            </div>
          </div>

          {/* ── Right column: output tabs ─────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600
                                  flex items-center justify-center text-xs font-bold">
                  2
                </span>
                Generated Output
              </h2>

              {/* Error banner */}
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3
                                flex items-start gap-2">
                  <span className="text-red-500 text-lg">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-red-700">Generation failed</p>
                    <p className="text-xs text-red-600 mt-0.5">{error}</p>
                    <p className="text-xs text-red-500 mt-1">
                      Make sure the backend server is running on{" "}
                      <code className="font-mono">http://localhost:8000</code>
                    </p>
                  </div>
                </div>
              )}

              {/* Loading skeleton */}
              {isLoading && (
                <div className="space-y-3 animate-pulse">
                  <div className="h-8 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-5/6" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-4/6" />
                </div>
              )}

              {/* Results */}
              {!isLoading && result && (
                <OutputTabs
                  testCases={result.test_cases}
                  edgeCases={result.edge_cases}
                  checklist={result.checklist}
                />
              )}

              {/* Empty state */}
              {!isLoading && !result && !error && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="text-5xl mb-4">📋</span>
                  <p className="text-gray-500 text-sm">
                    Enter a requirement on the left and click{" "}
                    <span className="font-semibold text-indigo-600">✨ Generate</span>{" "}
                    to see test cases, edge cases, and a QA checklist here.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="mt-8 border-t border-gray-200 bg-white py-4">
        <p className="text-center text-xs text-gray-400">
          AI Test Case Generator • Built with React + FastAPI + SQLite
        </p>
      </footer>
    </div>
  );
}

export default App;

