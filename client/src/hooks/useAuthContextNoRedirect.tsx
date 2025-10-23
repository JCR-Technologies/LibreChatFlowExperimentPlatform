import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { useTimeout } from '~/hooks';
import { useGetUserQuery, useLoginUserMutation, useLogoutUserMutation, useRefreshTokenMutation } from '~/data-provider';
import store from '~/store';
import type { TUser, TLoginResponse, TResError, TLoginUser, TRefreshTokenResponse } from 'librechat-data-provider';
import * as t from 'librechat-data-provider';

type TAuthContext = {
  user: TUser | undefined;
  token: string | undefined;
  isAuthenticated: boolean;
  login: (data: TLoginUser) => void;
  logout: (redirect?: string) => void;
  error: string | undefined;
  setError: (error: string | undefined) => void;
  redirect: string | undefined;
  setRedirect: (redirect: string | undefined) => void;
};

const AuthContext = createContext<TAuthContext | undefined>(undefined);

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<TUser | undefined>(undefined);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [redirect, setRedirect] = useState<string | undefined>(undefined);
  const [queriesEnabled, setQueriesEnabled] = useRecoilState<boolean>(store.queriesEnabled);
  const navigate = useNavigate();

  const doSetError = useTimeout({ callback: (error) => setError(error as string | undefined) });

  const loginUser = useLoginUserMutation({
    onSuccess: (data: t.TLoginResponse) => {
      const { user, token, twoFAPending, tempToken } = data;
      if (twoFAPending) {
        // Redirect to the two-factor authentication route.
        navigate(`/login/2fa?tempToken=${tempToken}`, { replace: true });
        return;
      }
      setError(undefined);
      setUserContext({ token, isAuthenticated: true, user, redirect: '/c/new' });
    },
    onError: (error: TResError | unknown) => {
      const resError = error as TResError;
      doSetError(resError.message);
      navigate('/login', { replace: true });
    },
  });

  const logoutUser = useLogoutUserMutation({
    onSuccess: (data) => {
      setUserContext({
        token: undefined,
        isAuthenticated: false,
        user: undefined,
        redirect: data.redirect ?? '/login',
      });
    },
    onError: (error) => {
      doSetError((error as Error).message);
      setUserContext({
        token: undefined,
        isAuthenticated: false,
        user: undefined,
        redirect: '/login',
      });
    },
  });

  const refreshToken = useRefreshTokenMutation();

  const logout = useCallback(
    (redirect?: string) => {
      if (redirect) {
        setRedirect(redirect);
      }
      logoutUser.mutate(undefined);
    },
    [logoutUser],
  );

  const userQuery = useGetUserQuery({ enabled: !!(token ?? '') });

  const login = (data: TLoginUser) => {
    loginUser.mutate(data);
  };

  const silentRefresh = useCallback(() => {
    if (token) {
      refreshToken.mutate(undefined);
    }
  }, [token, refreshToken]);

  const setUserContext = useCallback(
    (context: {
      token?: string;
      isAuthenticated: boolean;
      user?: TUser;
      redirect?: string;
    }) => {
      setToken(context.token);
      setIsAuthenticated(context.isAuthenticated);
      setUser(context.user);
      if (context.redirect) {
        setRedirect(context.redirect);
      }
    },
    [],
  );

  useEffect(() => {
    if (userQuery.data) {
      setUser(userQuery.data);
    } else if (userQuery.isError) {
      doSetError((userQuery.error as Error).message);
      // Only redirect to login if user was previously authenticated
      // This prevents redirects for non-authenticated users
      if (isAuthenticated) {
        navigate('/login', { replace: true });
      }
    }
    if (error != null && error && isAuthenticated) {
      doSetError(undefined);
    }
    if (token == null || !token || !isAuthenticated) {
      silentRefresh();
    }
  }, [
    token,
    isAuthenticated,
    userQuery.data,
    userQuery.isError,
    userQuery.error,
    error,
    setUser,
    navigate,
    silentRefresh,
    doSetError,
  ]);

  useEffect(() => {
    if (queriesEnabled) {
      return;
    }
    const timeout: NodeJS.Timeout = setTimeout(() => {
      setQueriesEnabled(true);
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [queriesEnabled, setQueriesEnabled]);

  useEffect(() => {
    if (redirect) {
      navigate(redirect, { replace: true });
      setRedirect(undefined);
    }
  }, [redirect, navigate]);

  const refreshTokenMutation = useRefreshTokenMutation({
    onSuccess: (data: TRefreshTokenResponse | undefined) => {
      const { user, token = '' } = data ?? {};
      if (token) {
        setUserContext({ token, isAuthenticated: true, user });
      } else {
        console.log('Token is not present. User is not authenticated.');
        // Don't redirect to login for non-authenticated users
      }
    },
    onError: (error) => {
      console.log('refreshToken mutation error:', error);
      // Don't redirect to login for non-authenticated users
    },
  });

  const contextValue = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    error,
    setError,
    redirect,
    setRedirect,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthContextProvider');
  }
  return context;
};

export { AuthContextProvider, useAuthContext };
