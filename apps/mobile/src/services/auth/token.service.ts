import { SecureStorageRepository } from "@/src/infrastructure/repositories/SecureStorageRepository";

const secureStorage = new SecureStorageRepository();

const KEY = {
  ACCESS: "access_token",
  REFRESH: "refresh_token",
} as const;

export const TokenService = {
  getAccess: () => secureStorage.getItem<string>(KEY.ACCESS),
  getRefresh: () => secureStorage.getItem<string>(KEY.REFRESH),
  setTokens: async (access: string, refresh?: string) => {
    await secureStorage.setItem(KEY.ACCESS, access);
    if (refresh) secureStorage.setItem(KEY.REFRESH, refresh);
  },
  clear: async () => {
    await secureStorage.deleteItem(KEY.ACCESS);
    await secureStorage.deleteItem(KEY.REFRESH);
  },
};
