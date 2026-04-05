/**
 * RequirementInput.jsx
 * Text area + submit button for entering a software requirement.
 */

import React, { useState } from "react";

const SAMPLE_REQUIREMENT =
  "User should be able to login using email and password";

/**
 * @param {object} props
 * @param {function} props.onGenerate  - callback(requirementText) when user submits
 * @param {boolean}  props.isLoading   - disable controls while generating
 */
export default function RequirementInput({ onGenerate, isLoading }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onGenerate(trimmed);
  };

  const handleSample = () => {
    setText(SAMPLE_REQUIREMENT);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Label */}
      <label
        htmlFor="requirement"
        className="block text-sm font-semibold text-gray-700"
      >
        Software Requirement
      </label>

      {/* Text area */}
      <textarea
        id="requirement"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe your software requirement here…"
        rows={6}
        disabled={isLoading}
        className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-800
                   shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300
                   disabled:bg-gray-50 disabled:text-gray-400 transition resize-none"
      />

      {/* Character count */}
      <p className="text-xs text-gray-400 text-right">{text.length} characters</p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="flex-1 rounded-lg bg-indigo-600 py-2.5 px-6 text-sm font-semibold
                     text-white shadow hover:bg-indigo-700 active:bg-indigo-800
                     disabled:bg-indigo-300 disabled:cursor-not-allowed transition"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Generating…
            </span>
          ) : (
            "✨ Generate"
          )}
        </button>

        <button
          type="button"
          onClick={handleSample}
          disabled={isLoading}
          className="rounded-lg border border-gray-300 py-2.5 px-5 text-sm font-medium
                     text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
        >
          Use Sample
        </button>
      </div>
    </form>
  );
}
