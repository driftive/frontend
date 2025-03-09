import {AuthAction, AuthState} from "./types";

// Reducer to manage authentication state
export const authReducer = (_state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN': {
      const newState = {isAuthenticated: true, token: action.token};
      localStorage.setItem('authState', JSON.stringify(newState));
      return newState;
    }
    case 'LOGOUT': {
      const newState = {isAuthenticated: false, token: undefined};
      localStorage.removeItem('authState');
      return newState;
    }
    default:
      throw new Error(`Unhandled action type: ${(action as AuthAction).type}`);
  }
};
