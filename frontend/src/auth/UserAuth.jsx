import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/user.context";

const UserAuth = ({ children }) => {
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && !user) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [user, setUser]);

  if (loading) return null;

  // Avoid redirecting while already on login/register page
  if (
    !user &&
    !["/login", "/register"].includes(location.pathname)
  ) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default UserAuth;
