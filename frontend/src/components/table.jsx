// Table.jsx
export default function Table({ columns, data, actions }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-2 text-left text-sm font-medium text-gray-700"
              >
                {col}
              </th>
            ))}
            {actions && <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 text-sm text-gray-700">{row[col]}</td>
              ))}
              {actions && (
                <td className="px-4 py-2 text-sm">
                  {actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => action.onClick(row)}
                      className="mr-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      {action.label}
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}