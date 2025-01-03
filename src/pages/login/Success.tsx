import {useNavigate, useSearchParams} from "react-router";
import {useAuthDispatch} from "../../context/auth/hook.ts";
import {APP_DEBUG} from "../../configs.ts";
import React from "react";

export const LoginSuccessPage = () => {

  const authDispatch = useAuthDispatch();
  const navigate = useNavigate();

  // get token from url
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  React.useEffect(() => {
    if (token) {
      authDispatch({
        type: 'LOGIN', token
      });
      navigate('/gh/orgs');
    }
  }, [authDispatch, token]);

  return (
    <div>
      <h1>Login Successful</h1>
      {APP_DEBUG && <p>Token: {token}</p>}
    </div>
  );
}
