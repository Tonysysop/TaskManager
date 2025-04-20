// Inside AuthProvider in AuthContext.tsx

import { Hub } from 'aws-amplify/utils';
import React, { createContext, useContext, useEffect, useState } from "react";
// 👇 Import AuthTokens type if available (check your Amplify version)
import { fetchAuthSession, FetchAuthSessionOptions } from "aws-amplify/auth";
// If AuthTokens isn't available, you might need to rely on checking session.tokens?.idToken etc.

interface AuthContextProps {
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuthStatus = async () => {
    console.log("AuthProvider: Starting initial checkAuthStatus...");
    setLoading(true);
    try {
      // Consider { forceRefresh: false } if you only want to check local storage initially
      const session = await fetchAuthSession(/* { forceRefresh: false } */);
      console.log("AuthProvider: fetchAuthSession success block. Session:", session);

      // --- MORE ROBUST CHECK ---
      // Check if valid tokens actually exist in the session result.
      // Accessing tokens directly might trigger internal validation in some Amplify versions.
      const idToken = session.tokens?.idToken;
      const accessToken = session.tokens?.accessToken; // Corrected property name

      if (idToken && accessToken) {
        // You could add token expiration checks here if needed, but Amplify
        // often handles basic expiration checks internally when fetching/using tokens.
        console.log("AuthProvider: Valid tokens found. Setting isAuthenticated = true");
        setIsAuthenticated(true);
      } else {
        // fetchAuthSession succeeded but didn't return expected tokens. Treat as not authenticated.
        console.log("AuthProvider: fetchAuthSession succeeded but tokens missing. Setting isAuthenticated = false");
        setIsAuthenticated(false);
      }
      // --- End Robust Check ---

    } catch (error) {
      // This catch block IS EXPECTED for users who are not logged in
      console.info("AuthProvider: fetchAuthSession catch block (Expected for no session). Setting isAuthenticated = false. Error:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      console.log("AuthProvider: Initial checkAuthStatus finished.");
    }
  };

  useEffect(() => {
    checkAuthStatus();

    // Hub listener code remains the same...
    const hubListenerCancel = Hub.listen('auth', ({ payload }) => {
      // ... switch statement ...
       // Add console logs inside your Hub cases too for debugging
       console.log('AuthProvider Hub Event:', payload.event);
       switch (payload.event as string) {
          // ... your cases ...
          case 'signedIn':
          case 'autoSignIn':
            setIsAuthenticated(true);
            break;
          case 'signedOut':
          case 'tokenRefresh_failure':
          case 'autoSignIn_failure':
            setIsAuthenticated(false);
            break;
          // ... etc
       }
    });

    return () => {
      if (typeof hubListenerCancel === 'function') {
        hubListenerCancel();
      }
    };
  }, []);

  const contextValue = {
    isAuthenticated,
    loading,
  };

  // Add a log here too, to see when the provider itself re-renders
  // console.log("AuthProvider Rendering. State:", contextValue);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook remains the same
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};