import React, {ReactNode, useReducer} from 'react';
import {AuthDispatchContext, AuthStateContext} from './context';
import {authReducer} from "./reducer.ts";
import {AuthState} from "./types.ts";

const getInitialAuthState = (): AuthState => {
  const storedState = localStorage.getItem('authState');
  if (storedState) {
    try {
      return JSON.parse(storedState);
    } catch (error) {
      console.error('Failed to parse authState from localStorage:', error);
    }
  }
  return {isAuthenticated: false, token: undefined}; // Default state
};

type AuthProviderProps = { children: ReactNode };

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [state, dispatch] = useReducer(authReducer, getInitialAuthState());

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
};
