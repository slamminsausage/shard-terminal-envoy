/**
 * Centralized localStorage utility
 * Provides type-safe localStorage operations with error handling
 */

import { toast } from "sonner";

/**
 * Get item from localStorage with type safety and fallback
 * @param key - The localStorage key
 * @param fallback - The fallback value if key doesn't exist or parsing fails
 * @returns The parsed value or fallback
 */
export function getLocalStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch (error) {
    console.error(`Failed to parse localStorage key "${key}":`, error);
    return fallback;
  }
}

/**
 * Set item in localStorage with automatic JSON serialization
 * @param key - The localStorage key
 * @param value - The value to store (will be JSON.stringify'd)
 * @param showError - Whether to show error toast on failure (default: false)
 * @returns true if successful, false otherwise
 */
export function setLocalStorage<T>(key: string, value: T, showError = false): boolean {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Failed to set localStorage key "${key}":`, error);
    if (showError) {
      toast.error("Failed to save data locally. Storage may be full.");
    }
    return false;
  }
}

/**
 * Remove item from localStorage
 * @param key - The localStorage key to remove
 */
export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove localStorage key "${key}":`, error);
  }
}

/**
 * Clear multiple localStorage keys
 * @param keys - Array of localStorage keys to clear
 */
export function clearLocalStorage(keys: string[]): void {
  keys.forEach(key => removeLocalStorage(key));
}

/**
 * Clear all localStorage (use with caution!)
 */
export function clearAllLocalStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }
}

/**
 * Check if a localStorage key exists
 * @param key - The localStorage key to check
 * @returns true if the key exists
 */
export function hasLocalStorage(key: string): boolean {
  return localStorage.getItem(key) !== null;
}

/**
 * Get all keys in localStorage
 * @returns Array of all localStorage keys
 */
export function getAllLocalStorageKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) keys.push(key);
  }
  return keys;
}

/**
 * Get localStorage usage estimate
 * @returns Approximate size in bytes
 */
export function getLocalStorageSize(): number {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      total += key.length + (value?.length || 0);
    }
  }
  return total;
}

/**
 * Get localStorage usage as human-readable string
 * @returns Size formatted as "X KB" or "X MB"
 */
export function getLocalStorageSizeFormatted(): string {
  const bytes = getLocalStorageSize();
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
