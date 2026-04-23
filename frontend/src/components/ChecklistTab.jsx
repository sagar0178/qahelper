/**
 * ChecklistTab.jsx
 * Renders the QA checklist as an interactive checkbox list.
 * State is local (not persisted).
 */

import React, { useState, useEffect } from "react";

/**
 * @param {object}        props
 * @param {Array<string>} props.checklist – list of checklist item strings
 */
export default function ChecklistTab({ checklist }) {
  const [checked, setChecked] = useState({});

  // Reset checked state when checklist changes (new generation)
  useEffect(() => {
    setChecked({});
  }, [checklist]);

  if (!checklist || checklist.length === 0) {
    return (
      <p className="text-gray-400 italic text-sm mt-2">
        No checklist generated yet.
      </p>
    );
  }

  const toggleItem = (index) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = Math.round((checkedCount / checklist.length) * 100);

  // Extract category tag, e.g. "[ UI ]" from the item string
  const parseItem = (item) => {
    const match = item.match(/^\[\s*([^\]]+)\s*\]\s+(.*)/);
    if (match) return { tag: match[1].trim(), text: match[2].trim() };
    return { tag: null, text: item };
  };

  // Colour mapping for category badges
  const tagColor = (tag) => {
    const map = {
      "UI":          "bg-blue-100 text-blue-700",
      "Functional":  "bg-green-100 text-green-700",
      "API":         "bg-purple-100 text-purple-700",
      "Security":    "bg-red-100 text-red-700",
      "Auth":        "bg-indigo-100 text-indigo-700",
      "Performance": "bg-yellow-100 text-yellow-700",
      "Upload":      "bg-teal-100 text-teal-700",
      "Payment":     "bg-emerald-100 text-emerald-700",
      "A11y":        "bg-orange-100 text-orange-700",
    };
    return map[tag] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{checkedCount} / {checklist.length} checked</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <ul className="space-y-2">
        {checklist.map((item, index) => {
          const { tag, text } = parseItem(item);
          const isChecked = !!checked[index];

          return (
            <li
              key={index}
              onClick={() => toggleItem(index)}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer
                          transition shadow-sm hover:shadow-md select-none
                          ${isChecked
                            ? "bg-green-50 border-green-300"
                            : "bg-white border-gray-200"
                          }`}
            >
              {/* Custom checkbox */}
              <span
                className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded border-2 flex items-center
                            justify-center transition
                            ${isChecked
                              ? "bg-green-500 border-green-500"
                              : "border-gray-400 bg-white"
                            }`}
              >
                {isChecked && (
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </span>

              <div className="flex flex-1 flex-wrap items-start gap-2">
                {/* Category badge */}
                {tag && (
                  <span
                    className={`flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold
                                ${tagColor(tag)}`}
                  >
                    {tag}
                  </span>
                )}
                {/* Item text */}
                <span
                  className={`text-sm flex-1 ${
                    isChecked ? "line-through text-gray-400" : "text-gray-700"
                  }`}
                >
                  {text}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Reset button */}
      {checkedCount > 0 && (
        <button
          onClick={() => setChecked({})}
          className="text-xs text-gray-400 hover:text-red-500 underline transition"
        >
          Reset all
        </button>
      )}
    </div>
  );
}
