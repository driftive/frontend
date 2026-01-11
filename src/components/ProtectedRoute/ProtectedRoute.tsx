import {Navigate, Outlet, useLocation} from "react-router";
import {useAuthState} from "../../context/auth/hook.ts";

export const ProtectedRoute = () => {
  const authState = useAuthState();
  const location = useLocation();

  if (!authState?.isAuthenticated) {
    return <Navigate to="/login" state={{from: location}} replace/>;
  }

  return <Outlet/>;
};
