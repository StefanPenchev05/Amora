/**
 * Defines a contract for secure key-value storage in the app.
 * Implementations should ensure encryption and OS-level protection
 */
export interface ISecureStorageRepository {
  /**
   * Saves a value for given key
   * @param key Unique key name
   * @param value Any type if specified, otherwise the type is string
   */
  setItem<T>(key: string, value: T | string): Promise<void>;

  /**
   * Retrieve a stored value for a given key.
   * @param key Unique key name
   * @returns The stored value or null if not found
   */
  getItem<T>(key: string): Promise<T | string | null>;

  /**
   * Deletes the stored value
   * @param key Unique key name
   */
  deleteItem(key: string): Promise<void>;

  /**
   * Updates an already saved key, if not found - creates a new Item
   * @param key Unique key name
   * @param newValue A value to replace the old one stored
   */
  updateItem<T>(key: string, newValue: T | string): Promise<void>;

  /**
   * Deletes all Secure Stored Items
   */
  clearAll(): Promise<void>;
}
