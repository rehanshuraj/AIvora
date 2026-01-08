import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/user.context";

const UserAuth = ({ children }) => {
  const { user, setUser } = useContext(UserContext);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (token && savedUser && !user) {
      setUser(JSON.parse(savedUser));
    }

    setCheckingAuth(false);
  }, [user, setUser]);

  // ⏳ Wait until auth check completes
  if (checkingAuth) {
    return null; // or loader
  }

  // ❌ Redirect only AFTER auth check
  if (!user && !["/login", "/register"].includes(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default UserAuth;
