"use client";

export default function RegisterPage() {
  const handleRegister = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    // Basic validation
    if (!name || !email || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      console.log("Sending registration request:", { username: name, email, password });
      
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ username: name, email, password }),
      });

      const data = await res.json();
      console.log("Server response:", data);

      if (res.ok) {
        alert("Registration successful!");
        window.location.href = "/auth/login";
      } else {
        alert("Registration failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error occurred. Make sure the server is running on port 3001.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full p-3 border rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 border rounded"
            required
            minLength="6"
          />
          <button 
            type="submit" 
            className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
          >
            Register
          </button>
        </form>

        <div className="mt-4 text-center">
          <p>
            Already have an account?{" "}
            <a href="/auth/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// "use client";

// export default function RegisterPage() {
//  const handleRegister = async (e) => {
//   e.preventDefault();

//   const formData = new FormData(e.target); // get form inputs
//   const name = formData.get("name");
//   const email = formData.get("email");
//   const password = formData.get("password");

//   try {
//  const res = await fetch("http://localhost:5000/auth/register", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ username: name, email, password }),
// });


//     const data = await res.json();

//     if (res.ok) {
//       alert("Registration successful!");
//       // redirect to login page
//       window.location.href = "/auth/login";
//     } else {
//       alert("Registration failed: " + data.error);
//     }
//   } catch (err) {
//     console.error("Network error:", err);
//     alert("An error occurred. Please try again.");
//   }
// };
  
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
//         <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
// <form onSubmit={handleRegister} className="space-y-4">
//   <input
//     type="text"
//     name="name"  // ✅ must be here
//     placeholder="Full Name"
//     className="w-full p-3 border rounded"
//     required
//   />
//   <input
//     type="email"
//     name="email" // ✅ must be here
//     placeholder="Email"
//     className="w-full p-3 border rounded"
//     required
//   />
//   <input
//     type="password"
//     name="password" // ✅ must be here
//     placeholder="Password"
//     className="w-full p-3 border rounded"
//     required
//   />
//   <button type="submit" className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700">
//     Register
//   </button>
// </form>

//         <div className="mt-4 text-center">
//           <p>
//             Already have an account? <a href="/auth/login" className="text-blue-600 hover:underline">Login</a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
