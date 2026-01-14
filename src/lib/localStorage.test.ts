/**
 * Tests for localStorage utility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
  clearLocalStorage,
  hasLocalStorage,
  getAllLocalStorageKeys,
  getLocalStorageSize,
} from './localStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('localStorage Utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getLocalStorage', () => {
    it('should return fallback when key does not exist', () => {
      const result = getLocalStorage('nonexistent', 'fallback');
      expect(result).toBe('fallback');
    });

    it('should return parsed value when key exists', () => {
      localStorage.setItem('test', JSON.stringify({ name: 'John' }));
      const result = getLocalStorage<{ name: string }>('test', { name: 'Default' });
      expect(result).toEqual({ name: 'John' });
    });

    it('should handle arrays', () => {
      localStorage.setItem('array', JSON.stringify([1, 2, 3]));
      const result = getLocalStorage<number[]>('array', []);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle primitives', () => {
      localStorage.setItem('number', JSON.stringify(42));
      const result = getLocalStorage<number>('number', 0);
      expect(result).toBe(42);

      localStorage.setItem('string', JSON.stringify('hello'));
      const result2 = getLocalStorage<string>('string', '');
      expect(result2).toBe('hello');

      localStorage.setItem('boolean', JSON.stringify(true));
      const result3 = getLocalStorage<boolean>('boolean', false);
      expect(result3).toBe(true);
    });

    it('should return fallback on parse error', () => {
      localStorage.setItem('invalid', 'not valid json');
      const result = getLocalStorage('invalid', 'fallback');
      expect(result).toBe('fallback');
    });
  });

  describe('setLocalStorage', () => {
    it('should store object as JSON', () => {
      const data = { name: 'Jane', age: 30 };
      const result = setLocalStorage('user', data);

      expect(result).toBe(true);
      const stored = localStorage.getItem('user');
      expect(stored).toBe(JSON.stringify(data));
    });

    it('should store array as JSON', () => {
      const data = [1, 2, 3, 4];
      setLocalStorage('numbers', data);

      const stored = localStorage.getItem('numbers');
      expect(stored).toBe(JSON.stringify(data));
    });

    it('should store primitives', () => {
      setLocalStorage('count', 42);
      expect(localStorage.getItem('count')).toBe('42');

      setLocalStorage('active', true);
      expect(localStorage.getItem('active')).toBe('true');
    });

    it('should return false on error', () => {
      // Create circular reference to cause stringify error
      const circular: any = { a: 1 };
      circular.self = circular;

      const result = setLocalStorage('circular', circular);
      expect(result).toBe(false);
    });
  });

  describe('removeLocalStorage', () => {
    it('should remove item from localStorage', () => {
      localStorage.setItem('test', 'value');
      expect(localStorage.getItem('test')).toBe('value');

      removeLocalStorage('test');
      expect(localStorage.getItem('test')).toBeNull();
    });

    it('should not throw when removing non-existent key', () => {
      expect(() => removeLocalStorage('nonexistent')).not.toThrow();
    });
  });

  describe('clearLocalStorage', () => {
    it('should remove multiple keys', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');

      clearLocalStorage(['key1', 'key3']);

      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBe('value2'); // Should still exist
      expect(localStorage.getItem('key3')).toBeNull();
    });

    it('should handle empty array', () => {
      localStorage.setItem('test', 'value');
      clearLocalStorage([]);
      expect(localStorage.getItem('test')).toBe('value');
    });
  });

  describe('hasLocalStorage', () => {
    it('should return true when key exists', () => {
      localStorage.setItem('test', 'value');
      expect(hasLocalStorage('test')).toBe(true);
    });

    it('should return false when key does not exist', () => {
      expect(hasLocalStorage('nonexistent')).toBe(false);
    });

    it('should return true even for empty string values', () => {
      localStorage.setItem('empty', '');
      expect(hasLocalStorage('empty')).toBe(true);
    });
  });

  describe('getAllLocalStorageKeys', () => {
    it('should return all keys', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');

      const keys = getAllLocalStorageKeys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should return empty array when localStorage is empty', () => {
      const keys = getAllLocalStorageKeys();
      expect(keys).toEqual([]);
    });
  });

  describe('getLocalStorageSize', () => {
    it('should calculate size correctly', () => {
      localStorage.setItem('key1', 'value1'); // 4 + 6 = 10 bytes
      localStorage.setItem('key2', 'abc'); // 4 + 3 = 7 bytes

      const size = getLocalStorageSize();
      expect(size).toBe(17); // 10 + 7
    });

    it('should return 0 when localStorage is empty', () => {
      const size = getLocalStorageSize();
      expect(size).toBe(0);
    });

    it('should count both key and value lengths', () => {
      localStorage.setItem('a', 'b'); // 1 + 1 = 2
      expect(getLocalStorageSize()).toBe(2);
    });
  });

  describe('Integration tests', () => {
    it('should handle complex workflow', () => {
      interface User {
        id: string;
        name: string;
        email: string;
      }

      const user: User = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
      };

      // Save user
      expect(setLocalStorage('user', user)).toBe(true);
      expect(hasLocalStorage('user')).toBe(true);

      // Retrieve user
      const retrieved = getLocalStorage<User>('user', { id: '', name: '', email: '' });
      expect(retrieved).toEqual(user);

      // Remove user
      removeLocalStorage('user');
      expect(hasLocalStorage('user')).toBe(false);

      // Should return fallback after removal
      const afterRemoval = getLocalStorage<User>('user', {
        id: 'default',
        name: 'Default',
        email: 'default@example.com',
      });
      expect(afterRemoval.id).toBe('default');
    });

    it('should handle array operations', () => {
      const items = ['item1', 'item2', 'item3'];

      setLocalStorage('items', items);

      const retrieved = getLocalStorage<string[]>('items', []);
      expect(retrieved).toEqual(items);
      expect(retrieved).toHaveLength(3);

      // Modify and save again
      retrieved.push('item4');
      setLocalStorage('items', retrieved);

      const updated = getLocalStorage<string[]>('items', []);
      expect(updated).toHaveLength(4);
      expect(updated).toContain('item4');
    });
  });
});
