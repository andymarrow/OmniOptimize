import { useState, useEffect } from "react";

/**
 * Custom hook to manage localStorage state
 * Syncs state with localStorage and persists across page reloads
 */
export function useLocalStorage(key, initialValue) {
  // State to store our value
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      // Save to localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error saving to localStorage (${key}):`, error);
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      }
    } catch (error) {
      console.warn(`Error reading from localStorage (${key}):`, error);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  return [storedValue, setValue, isLoaded];
}
