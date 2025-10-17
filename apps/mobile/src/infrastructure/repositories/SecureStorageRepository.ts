import * as SecureStore from "expo-secure-store";
import { ISecureStorageRepository } from "@domain/repositories/ISecureStorageRepository";

export class SecureStorageRepository implements ISecureStorageRepository {
  async setItem<T>(
    key: string,
    value: T | string,
    options?: SecureStore.SecureStoreOptions
  ): Promise<void> {
    // Validate key
    if (!key || typeof key !== "string") {
      throw new Error("SecureStorage: key must be non-empty string");
    }

    // Prevent unsupported or meaningless values
    if (value === undefined) {
      throw new Error(
        `SecureStorage: cannot store 'undefined' for key '${key}'`
      );
    } else if (
      typeof value === "boolean" ||
      typeof value === "function" ||
      typeof value === "symbol"
    ) {
      throw new Error(
        `SecureStorage: cannot store value of type ${typeof value} for key ${key}`
      );
    }

    // Serialize value (always as string)
    const toSave =
      typeof value === "string" ? String(value) : JSON.stringify(value);

    await SecureStore.setItemAsync(key, toSave, options);
  }

  async getItem<T>(
    key: string,
    options: SecureStore.SecureStoreOptions | undefined
  ): Promise<T | string | undefined> {
    if (!key || typeof key !== "string") {
      throw new Error("SecureStorage: key must be non-empty string");
    }

    const row = await SecureStore.getItemAsync(key, options);
    if (!row) return undefined;

    // Try to parse in json
    try {
      return JSON.parse(row) as T;
    } catch {
      return row;
    }
  }

  async deleteItem(key: string): Promise<void> {
    if (!key || typeof key !== "string") {
      throw new Error("SecureStorage: key must be non-empty string");
    }

    await SecureStore.deleteItemAsync(key);
  }

  async updateItem<T>(key: string, newValue: T | string): Promise<void> {
    try {
      await this.deleteItem(key);
      await this.setItem(key, newValue);
    } catch (error) {
      throw new Error(
        `SecureStore: updating key: ${key} new value: ${newValue} was unsuccessful\nReason: ${error}`
      );
    }
  }

  async clearAll(): Promise<void> {
    const knownKeys = [
      "access_token",
      "refresh_token",
      "install_id",
      "e2ee_key",
    ];
    await Promise.all(knownKeys.map((k) => SecureStore.deleteItemAsync(k)));
  }
}
