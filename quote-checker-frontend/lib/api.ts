export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly field?: string,
  ) {
    super(message);
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (res.status === 401 && path !== "/auth/signin") {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.assign(new URL("/signin", window.location.origin));
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body.message === "string"
        ? body.message
        : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, body.field);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}
