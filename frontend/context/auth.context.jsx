import { createContext, useContext, useState } from "react";
import userService from "../src/services/userService";
import { useEffect } from "react";

export const AuthContext = createContext();
AuthContext.displayName = "Auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(userService.getUser());
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await userService.getUserData(user?.userId);
        setUserData(response);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (user) {
      fetchUserData();
    } else {
      setUserData(null);
    }
  }, [user]);

  const loadUserData = async () => {
    if (user) {
      const response = await userService.getUserData(user?.userId);
      setUserData(response);
      return response;
    }
  };

  const refreshUser = () => {
    setUser(userService.getUser());
    loadUserData();
  };

  const logIn = async (values) => {
    const response = await userService.login(values);
    refreshUser();
    return response;
  };

  const register = async (values) => {
    const response = await userService.register(values);
    refreshUser();
    return response;
  };
  
  const logOut = () => {
    userService.logOut();
    refreshUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        logIn,
        register,
        refreshUser,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  return useContext(AuthContext);
}