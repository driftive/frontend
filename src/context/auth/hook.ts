import {AuthAction, AuthState} from "./types.ts";
import React, {useContext} from "react";
import {AuthDispatchContext, AuthStateContext} from "./context.ts";

export const useAuthState = (): AuthState => {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
};

export const useAuthDispatch = (): React.Dispatch<AuthAction> => {
  const context = useContext(AuthDispatchContext);
  if (context === undefined) {
    throw new Error('useAuthDispatch must be used within an AuthProvider');
  }
  return context;
};
