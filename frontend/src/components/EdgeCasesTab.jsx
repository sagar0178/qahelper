/**
 * EdgeCasesTab.jsx
 * Renders the list of edge cases as a styled bullet list.
 */

import React from "react";

/**
 * @param {object}        props
 * @param {Array<string>} props.edgeCases - list of edge-case strings from the API
 */
export default function EdgeCasesTab({ edgeCases }) {
  if (!edgeCases || edgeCases.length === 0) {
    return (
      <p className="text-gray-400 italic text-sm mt-2">
        No edge cases generated yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">
        {edgeCases.length} edge case{edgeCases.length !== 1 ? "s" : ""} identified
      </p>

      <ul className="space-y-2">
        {edgeCases.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3 rounded-lg bg-white border border-gray-200
                       px-4 py-3 shadow-sm hover:shadow-md transition"
          >
            {/* Numbered marker */}
            <span className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-amber-100
                             text-amber-600 flex items-center justify-center text-xs font-bold">
              {index + 1}
            </span>
            <span className="text-sm text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
