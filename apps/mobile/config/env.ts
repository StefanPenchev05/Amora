import { z } from "zod";
import Constants from "expo-constants";
import { Platform } from "react-native";

function defaultApiUrl(): string {
  // Android emulator cannot reach host via localhost.
  if (Platform.OS === "android") return "http://10.0.2.2:8000";
  return "http://localhost:8000";
}

function defaultWsUrl(): string {
  if (Platform.OS === "android") return "ws://10.0.2.2:8000";
  return "ws://localhost:8000";
}

const EnvSchema = z.object({
  EXPO_PUBLIC_ENV: z.enum(["dev", "staging", "prod"]).default("dev"),
  EXPO_PUBLIC_API_URL: z.string().url().optional(),
  EXPO_PUBLIC_WS_URL: z.string().url().optional(),
  EXPO_VERSION: z.string().optional(),
  EXPO_MIN_VERSION: z.string().optional(),
});

const extra: Record<string, unknown> =
  // Expo SDK 49+ has expoConfig
  (Constants.expoConfig?.extra as Record<string, unknown> | undefined) ??
  // Older manifests
  ((Constants as any).manifest?.extra as Record<string, unknown> | undefined) ??
  {};

const candidate = {
  EXPO_PUBLIC_ENV: (process.env.EXPO_PUBLIC_ENV ?? extra.EXPO_PUBLIC_ENV) as any,
  EXPO_PUBLIC_API_URL: (process.env.EXPO_PUBLIC_API_URL ?? extra.EXPO_PUBLIC_API_URL) as any,
  EXPO_PUBLIC_WS_URL: (process.env.EXPO_PUBLIC_WS_URL ?? extra.EXPO_PUBLIC_WS_URL) as any,
  EXPO_VERSION: (process.env.EXPO_VERSION ?? extra.EXPO_VERSION) as any,
  EXPO_MIN_VERSION: (process.env.EXPO_MIN_VERSION ?? extra.EXPO_MIN_VERSION) as any,
};

const parsed = EnvSchema.safeParse(candidate);
if (!parsed.success) {
  // Don't crash the whole app for env issues in dev; fall back to defaults.
  console.warn("⚠️ Invalid ENV, using defaults", parsed.error.flatten().fieldErrors);
}

const env = parsed.success ? parsed.data : { EXPO_PUBLIC_ENV: "dev" as const };

export const Env = {
  MODE: env.EXPO_PUBLIC_ENV,
  API_URL: (parsed.success ? parsed.data.EXPO_PUBLIC_API_URL : undefined) ?? defaultApiUrl(),
  WS_URL: (parsed.success ? parsed.data.EXPO_PUBLIC_WS_URL : undefined) ?? defaultWsUrl(),
  VERSION: (parsed.success ? parsed.data.EXPO_VERSION : undefined) ?? "0.0.0",
  MIN_VERSION: (parsed.success ? parsed.data.EXPO_MIN_VERSION : undefined) ?? "0.0.0",
};
