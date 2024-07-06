import { getCookie } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type Props = { children: ReactNode; redirect: string; reverse?: boolean };

const AuthGuard = ({ children, redirect, reverse = false }: Props) => {
  // If we don't have a valid token, redirect
  // If reverse, render the children

  // If we have a token, render the children
  // If reverse, redirect

  let isAuthenticated = false;

  try {
    const token = getCookie("token");

    if (token && jwtDecode<{ exp: number }>(token).exp >= Date.now() / 1000) {
      isAuthenticated = true;
    }
  } catch (_) {
    // Invalid token
  }

  console.log(isAuthenticated);

  if ((!reverse && !isAuthenticated) || (reverse && isAuthenticated)) {
    return <Navigate to={redirect} />;
  }

  return <>{children}</>;
};

export default AuthGuard;
