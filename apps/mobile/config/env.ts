import { z } from "zod";

const EnvSchema = z.object({
  EXPO_PUBLIC_ENV: z.enum(["dev", "staging", "prod"]).default("dev"),
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_WS_URL: z.string().url(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid ENV", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const Env = {
  MODE: parsed.data.EXPO_PUBLIC_ENV,
  API_URL: parsed.data.EXPO_PUBLIC_API_URL,
  WS_URL: parsed.data.EXPO_PUBLIC_WS_URL,
};
