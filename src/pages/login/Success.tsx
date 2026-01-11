import {useNavigate, useSearchParams} from "react-router";
import {useAuthDispatch} from "../../context/auth/hook.ts";
import {APP_DEBUG} from "../../configs.ts";
import React from "react";
import Button from "antd/es/button";

export const LoginSuccessPage = () => {

  const authDispatch = useAuthDispatch();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  React.useEffect(() => {
    if (token) {
      authDispatch({
        type: 'LOGIN', token
      });
      if (!APP_DEBUG) {
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/gh/orgs';
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath, {replace: true});
      }
    }
  }, [authDispatch, navigate, token]);

  if (APP_DEBUG) {

    const decodedToken = token && JSON.parse(atob(token.split('.')[1]));

    const handleContinue = () => {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/gh/orgs';
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath, {replace: true});
    };

    return (
      <div>
        <h1>Login Successful</h1>
        <p>Token: {token}</p>
        <p>Debug: You are in debug mode</p>
        {
          decodedToken && (<div>
            <p>Decoded token</p>
            <pre>{JSON.stringify(decodedToken)}</pre>
          </div>)
        }
        <Button onClick={handleContinue}>Continue</Button>
      </div>)
  }

  return (
    <div>
      <h1>Login Successful</h1>
    </div>
  );
}
