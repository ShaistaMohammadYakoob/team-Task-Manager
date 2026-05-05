import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth.js';
import { tokenStore } from '../api/client.js';
import { getApiError } from '../utils/validators.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const loadMe = useCallback(async () => {
    if (!tokenStore.getAccess()) {
      setLoading(false);
      return;
    }

    try {
      const data = await authApi.me();
      setUser(data.user);
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    loadMe();
    window.addEventListener('auth:logout', clearSession);
    return () => window.removeEventListener('auth:logout', clearSession);
  }, [clearSession, loadMe]);

  const signup = async (payload) => {
    const data = await authApi.signup(payload);

    if (data.requiresApproval) {
      tokenStore.clear();
      setUser(null);
      toast.success('Account submitted for admin approval');
      return data;
    }

    tokenStore.set(data);
    setUser(data.user);
    toast.success('Account created');
    return data;
  };

  const login = async (payload) => {
    const data = await authApi.login(payload);
    tokenStore.set(data);
    setUser(data.user);
    toast.success('Welcome back');
    return data;
  };

  const logout = async () => {
    const refreshToken = tokenStore.getRefresh();
    try {
      await authApi.logout(refreshToken);
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      clearSession();
      toast.success('Signed out');
    }
  };

  const updateProfile = async (payload) => {
    const data = await authApi.updateProfile(payload);
    setUser(data.user);
    toast.success('Profile updated');
    return data;
  };

  const changePassword = async (payload) => {
    const data = await authApi.changePassword(payload);
    clearSession();
    toast.success('Password changed. Please sign in again');
    return data;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      signup,
      login,
      logout,
      updateProfile,
      changePassword
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
