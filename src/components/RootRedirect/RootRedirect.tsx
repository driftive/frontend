import {Navigate} from "react-router";
import {useAuthState} from "../../context/auth/hook.ts";
import {DEFAULT_PROVIDER} from "../../utils/provider.ts";

export const RootRedirect = () => {
  const authState = useAuthState();

  if (authState?.isAuthenticated) {
    return <Navigate to={`/${DEFAULT_PROVIDER}/orgs`} replace/>;
  }

  return <Navigate to="/login" replace/>;
};
