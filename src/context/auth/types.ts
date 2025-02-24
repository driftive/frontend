export type AuthState = {
  isAuthenticated: boolean;
  token: string | undefined;
  user?: { id: string; name: string } | null;
};

export type AuthAction =
  | { type: 'LOGIN'; token: string }
  | { type: 'LOGOUT' };
