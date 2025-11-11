// user.context.jsx
import React, { createContext, useState, useEffect } from "react";

// ------------------------------------------------------------
// Create a Context to hold and share user data across the app
// ------------------------------------------------------------
export const UserContext = createContext();

// ------------------------------------------------------------
// Context Provider Component
// - Wraps the app and gives access to { user, setUser } globally
// ------------------------------------------------------------
export const UserProvider = ({ children }) => {
  // user → stores the current logged-in user's data (or null)
  // setUser → updates the user (used during login/logout)
  const [user, setUser] = useState(null);

  // loading → ensures UI doesn't flicker before user is loaded
  const [loading, setLoading] = useState(true);

  // ------------------------------------------------------------
  // Load saved user data from localStorage when app first mounts
  // ------------------------------------------------------------
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser)); // Convert JSON string to object
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
    }
    setLoading(false);
  }, []);

  // ------------------------------------------------------------
  // Sync user state with localStorage
  // Whenever user logs in/out, update localStorage accordingly
  // ------------------------------------------------------------
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Error saving user to localStorage:", error);
    }
  }, [user]);

  // ------------------------------------------------------------
  // Prevent rendering app before user state is ready
  // Avoids redirects or flashes of incorrect UI
  // ------------------------------------------------------------
  if (loading) return null;

  // ------------------------------------------------------------
  // Provide user data and updater to the entire app
  // ------------------------------------------------------------
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
