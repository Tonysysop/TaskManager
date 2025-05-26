import { useState, useEffect, Dispatch, SetStateAction } from "react";

// Corrected return type for the setter function
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T) // Allow initialValue to be a function for lazy initialization
): [T, Dispatch<SetStateAction<T>>] {
  // Get stored value from localStorage or use initialValue
  const readValue = (): T => {
    // Prevent build error "window is undefined" but keep working
    if (typeof window === "undefined") {
      return initialValue instanceof Function ? initialValue() : initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item) as T;
      }
      return initialValue instanceof Function ? initialValue() : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  };

  // State to store our value
  // Pass initial state function to useState so logic is only executed on initial render
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Wrapped version of useState's setter function that persists the new value to localStorage.
  // Type 'value' as SetStateAction<T>
  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    // Prevent build error "window is undefined" but keep working
    if (typeof window == 'undefined') {
      console.warn(
        `Tried setting localStorage key “${key}” even though environment is not a client`,
      );
    }

    try {
      // Allow value to be a function so we have the same API as useState
      // This now works correctly because 'value' can be a function ((prevState: T) => T)
      const newValue = value instanceof Function ? value(storedValue) : value;
      
      // Save to state
      setStoredValue(newValue);
      
      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Effect to update state if localStorage changes in another tab
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue) as T);
        } catch (error) {
          console.warn(`Error parsing storage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Also, ensure the initial value is correctly set if the key changes during the component's lifecycle (rare for this hook)
    // Or if a value was set by another tab before this one loaded.
    setStoredValue(readValue());


    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // 'key' is a dependency for readValue and the event listener logic

  return [storedValue, setValue];
}