"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);

      // Standardize the user object
      const standardizedUser = {
        ...parsedUser,
        name: parsedUser.name || parsedUser.username || "Unknown",
        id: parsedUser.id,
        customerId: parsedUser.customerId || null,
        roleId: parsedUser.roleId || null,
      };

      setUser(standardizedUser);
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (userData) => {
    const standardizedUser = {
      ...userData,
      name:
        userData.name ||
        userData.username ||
        `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
        "Unknown",
      id: userData.id,
      customerId: userData.customerId || null,
      roleId: userData.roleId || null,
    };

    setUser(standardizedUser);
    localStorage.setItem("user", JSON.stringify(standardizedUser));
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);



// "use client";

// import { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Load user from sessionStorage on app start
//   useEffect(() => {
//     const savedUser = sessionStorage.getItem("user");
//     if (savedUser) {
//       const parsedUser = JSON.parse(savedUser);

//       const standardizedUser = {
//         ...parsedUser,
//         name: parsedUser.name || parsedUser.username || "Unknown",
//         id: parsedUser.id,
//         customerId: parsedUser.customerId || null,
//         roleId: parsedUser.roleId || null,
//       };

//       setUser(standardizedUser);
//     }
//     setLoading(false);
//   }, []);

//   // Login function
//   const login = (userData) => {
//     const standardizedUser = {
//       ...userData,
//       name:
//         userData.name ||
//         userData.username ||
//         `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
//         "Unknown",
//       id: userData.id,
//       customerId: userData.customerId || null,
//       roleId: userData.roleId || null,
//     };

//     setUser(standardizedUser);
//     sessionStorage.setItem("user", JSON.stringify(standardizedUser));
//   };

//   // Logout function
//   const logout = () => {
//     setUser(null);
//     sessionStorage.removeItem("user");
//     sessionStorage.removeItem("token");
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
