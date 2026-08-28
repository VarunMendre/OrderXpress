import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  api,
  setUnauthorizedHandler,
  restoreSessionCookie,
  clearSessionCookie,
  setAuthToken,
} from "../api/client";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | signedOut | signedIn

  const signOut = useCallback(async () => {
    setUser(null);
    setStatus("signedOut");
    await clearSessionCookie();
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await restoreSessionCookie();
      try {
        const data = await authApi.me();
        if (!mounted) return;
        setUser(data);
        setStatus("signedIn");
      } catch {
        await clearSessionCookie();
        if (!mounted) return;
        setStatus("signedOut");
      }
    })();

    setUnauthorizedHandler(() => {
      if (mounted) signOut();
    });

    return () => {
      mounted = false;
    };
  }, [signOut]);

  const login = useCallback(async (email, password) => {
    const loginData = await authApi.login({ email, password });
    if (loginData?.tokens?.bearer) {
      await setAuthToken(loginData.tokens.bearer);
    }
    const data = await authApi.me();
    setUser(data);
    setStatus("signedIn");
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const registerData = await authApi.register(payload);
    if (registerData?.tokens?.bearer) {
      await setAuthToken(registerData.tokens.bearer);
    }
    const data = await authApi.me();
    setUser(data);
    setStatus("signedIn");
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // session is cleared locally regardless
    }
    await signOut();
  }, [signOut]);

  return (
    <AuthContext.Provider value={{ status, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
