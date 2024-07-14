import { type ClassValue, clsx } from "clsx";
import { NavigateFunction } from "react-router-dom";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.substring(6);
}

export function logout(navigate: NavigateFunction) {
  document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  navigate("/login");
}
