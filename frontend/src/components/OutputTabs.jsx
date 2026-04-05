/**
 * OutputTabs.jsx
 * Three-tab container: Test Cases / Edge Cases / Checklist.
 */

import React, { useState } from "react";
import TestCasesTab from "./TestCasesTab";
import EdgeCasesTab from "./EdgeCasesTab";
import ChecklistTab from "./ChecklistTab";

const TABS = [
  { id: "testcases", label: "🧪 Test Cases" },
  { id: "edgecases", label: "⚠️ Edge Cases" },
  { id: "checklist", label: "✅ Checklist" },
];

/**
 * @param {object}        props
 * @param {Array}         props.testCases
 * @param {Array<string>} props.edgeCases
 * @param {Array<string>} props.checklist
 */
export default function OutputTabs({ testCases, edgeCases, checklist }) {
  const [active, setActive] = useState("testcases");

  return (
    <div className="space-y-0">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex-shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap
              ${
                active === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            {tab.label}
            {/* Badge count */}
            {tab.id === "testcases" && testCases?.length > 0 && (
              <span className="ml-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs px-1.5 py-0.5">
                {testCases.length}
              </span>
            )}
            {tab.id === "edgecases" && edgeCases?.length > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5">
                {edgeCases.length}
              </span>
            )}
            {tab.id === "checklist" && checklist?.length > 0 && (
              <span className="ml-1.5 rounded-full bg-green-100 text-green-700 text-xs px-1.5 py-0.5">
                {checklist.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pt-4">
        {active === "testcases" && <TestCasesTab testCases={testCases} />}
        {active === "edgecases" && <EdgeCasesTab edgeCases={edgeCases} />}
        {active === "checklist" && <ChecklistTab checklist={checklist} />}
      </div>
    </div>
  );
}
