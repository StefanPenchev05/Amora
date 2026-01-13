import { Env } from "@/config/env";
import { TokenService } from "../auth/token.service";

let refreshing: Promise<string | null> | null = null;

type RefreshResponse = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  exp: number;
};

async function runRefresh(): Promise<string | null> {
  const refreshToken = await TokenService.getRefresh();
  if (!refreshToken) return null;

  const res = await fetch(`${Env.API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const json = (await res.json()) as RefreshResponse;

  if (!res.ok || !json?.access_token) {
    throw new Error(`${res.status}`);
  }

  await TokenService.setTokens(json.access_token, json.refresh_token);
  return json.access_token;
}


export function getFreshAccessToken(): Promise<string | null> | null {
    refreshing ??= runRefresh().finally(() => (refreshing = null));
    return refreshing;
}