import {Navigate} from "react-router";
import {useAuthState} from "../../context/auth/hook.ts";

export const RootRedirect = () => {
  const authState = useAuthState();

  if (authState?.isAuthenticated) {
    return <Navigate to="/github/orgs" replace/>;
  }

  return <Navigate to="/login" replace/>;
};
