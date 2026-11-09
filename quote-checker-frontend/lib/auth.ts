import { request } from "./api";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
};

export type SignUpRequest = { fullName: string; email: string; password: string };
export type SignInRequest = { email: string; password: string };

export function signUp(body: SignUpRequest): Promise<User> {
  return request<User>("/auth/signup", { method: "POST", body: JSON.stringify(body) });
}

export function getMe(): Promise<User> {
  return request<User>("/auth/me");
}

export function signIn(body: SignInRequest): Promise<User> {
  return request<User>("/auth/signin", { method: "POST", body: JSON.stringify(body) });
}
