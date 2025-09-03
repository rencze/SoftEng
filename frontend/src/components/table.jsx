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




//DYANMIC SAMPLE 
// import Table from "@/components/Table";

// export default function UsersPage() {
//   const [users, setUsers] = useState([]);

//   useEffect(() => {
//     setUsers([
//       { id: 1, name: "John Doe", email: "john@example.com", role: "Customer", status: "Active" },
//       { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Technician", status: "Blocked" },
//     ]);
//   }, []);

//   const columns = ["name", "email", "contact number", "adress" "role", "status", "]; // dynamic column names
//   const actions = [
//     { label: "View", onClick: (row) => console.log("View", row) },
//     { label: "Edit", onClick: (row) => console.log("Edit", row) },
//     { label: "Delete", onClick: (row) => console.log("Delete", row.id) },
//   ];

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-6">User Management</h1>
//       <Table columns={columns} data={users} actions={actions} />
//     </div>
//   );
// }
