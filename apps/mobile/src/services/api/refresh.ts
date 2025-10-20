import { Env } from "@/config/env";
import { TokenService } from "../auth/token.service";

let refreshing: Promise<string | null> | null = null;

// expected shape: { token: { accessToken, refreshToken? } }
type RefreshResponse = {
  token: {
    accessToken: string;
    refreshToken?: string;
  };
};

async function runRefresh(): Promise<string | null> {
  const refreshToken = await TokenService.getRefresh();
  if (!refreshToken) return null;

  const res = await fetch(`${Env.API_URL}/auth/refresh/`, {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  const json = (await res.json()) as RefreshResponse;

  if (!res.ok || !json?.token) {
    throw new Error(`${res.status}`);
  }

  const tokens = json.token;
  await TokenService.setTokens(tokens.accessToken, tokens.refreshToken);

  return tokens.accessToken;
}


export function getFreshAccessToken(): Promise<string | null> | null {
    refreshing ??= runRefresh().finally(() => (refreshing = null));
    return refreshing;
}