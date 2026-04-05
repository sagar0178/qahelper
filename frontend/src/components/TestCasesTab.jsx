/**
 * TestCasesTab.jsx
 * Renders the list of generated test cases in a responsive table.
 * Includes a CSV export button.
 */

import React from "react";

/**
 * Convert an array of test-case objects to a CSV string.
 */
function exportToCSV(testCases) {
  const headers = [
    "Test Case ID",
    "Title",
    "Preconditions",
    "Steps",
    "Test Data",
    "Expected Result",
  ];

  const escape = (val) => `"${String(val).replace(/"/g, '""')}"`;

  const rows = testCases.map((tc) => [
    escape(tc.id),
    escape(tc.title),
    escape(tc.preconditions.join("; ")),
    escape(tc.steps.map((s, i) => `${i + 1}. ${s}`).join("; ")),
    escape(tc.test_data),
    escape(tc.expected_result),
  ]);

  const csvContent = [headers.map(escape), ...rows]
    .map((r) => r.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "test_cases.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * @param {object} props
 * @param {Array}  props.testCases  – array of test-case objects from the API
 */
export default function TestCasesTab({ testCases }) {
  if (!testCases || testCases.length === 0) {
    return (
      <p className="text-gray-400 italic text-sm mt-2">
        No test cases generated yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Export button */}
      <div className="flex justify-end">
        <button
          onClick={() => exportToCSV(testCases)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 py-2 px-4
                     text-sm font-semibold text-white shadow hover:bg-emerald-700
                     active:bg-emerald-800 transition"
        >
          {/* Download icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
            />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Table – horizontally scrollable on small screens */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-indigo-50">
            <tr>
              {[
                "ID",
                "Title",
                "Preconditions",
                "Steps",
                "Test Data",
                "Expected Result",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-indigo-700
                             uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {testCases.map((tc) => (
              <tr key={tc.id} className="hover:bg-gray-50 transition">
                {/* ID */}
                <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600 whitespace-nowrap">
                  {tc.id}
                </td>

                {/* Title */}
                <td className="px-4 py-3 font-medium text-gray-800 max-w-xs">
                  {tc.title}
                </td>

                {/* Preconditions */}
                <td className="px-4 py-3 text-gray-600 max-w-xs">
                  <ul className="list-disc list-inside space-y-0.5">
                    {tc.preconditions.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </td>

                {/* Steps */}
                <td className="px-4 py-3 text-gray-600 max-w-xs">
                  <ol className="list-decimal list-inside space-y-0.5">
                    {tc.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </td>

                {/* Test Data */}
                <td className="px-4 py-3 text-gray-600 max-w-xs italic">
                  {tc.test_data}
                </td>

                {/* Expected Result */}
                <td className="px-4 py-3 text-gray-700 font-medium max-w-xs">
                  {tc.expected_result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 text-right">
        {testCases.length} test case{testCases.length !== 1 ? "s" : ""} generated
      </p>
    </div>
  );
}
