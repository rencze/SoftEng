"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1 = request reset, 2 = set new password
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 1: Request reset
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter your email");

    try {
      const res = await fetch("http://localhost:3001/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setStep(2); // move to set new password
      } else {
        alert(data.message || "Error requesting reset");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  // Step 2: Set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return alert("Please fill in both password fields");
    if (newPassword !== confirmPassword) return alert("Passwords do not match");

    try {
      const res = await fetch("http://localhost:3001/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setStep(1);
        setEmail("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(data.message || "Error resetting password");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-center">
        {step === 1 ? (
          <>
            <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
            <form onSubmit={handleRequestReset} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
                Request Reset
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6">Set New Password</h1>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <button type="submit" className="w-full bg-green-500 text-white py-2 rounded">
                Reset Password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}









// "use client";

// import { useState } from "react";

// export default function ForgotPasswordPage() {
//   const [step, setStep] = useState(1); // 1 = request reset, 2 = set new password
//   const [email, setEmail] = useState("");
//   const [newPassword, setNewPassword] = useState("");

//   const handleRequestReset = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await fetch("http://localhost:3001/api/auth/forgotPassword", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         alert(data.message);
//         setStep(2); // move to set new password
//       } else {
//         alert(data.message || "Error requesting reset");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Network error");
//     }
//   };

//   const handleResetPassword = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await fetch("http://localhost:3001/api/auth/resetPassword", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, newPassword }),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         alert(data.message);
//         setStep(1);
//         setEmail("");
//         setNewPassword("");
//       } else {
//         alert(data.message || "Error resetting password");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Network error");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
//       <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-center">
//         {step === 1 ? (
//           <>
//             <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
//             <form onSubmit={handleRequestReset} className="space-y-4">
//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="w-full border border-gray-300 rounded-md px-3 py-2"
//               />
//               <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
//                 Request Reset
//               </button>
//             </form>
//           </>
//         ) : (
//           <>
//             <h1 className="text-2xl font-bold mb-6">Set New Password</h1>
//             <form onSubmit={handleResetPassword} className="space-y-4">
//               <input
//                 type="password"
//                 placeholder="Enter new password"
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 required
//                 className="w-full border border-gray-300 rounded-md px-3 py-2"
//               />
//               <button type="submit" className="w-full bg-green-500 text-white py-2 rounded">
//                 Reset Password
//               </button>
//             </form>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
