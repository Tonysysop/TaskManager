import { createRoot } from "react-dom/client";
import "./index.css";
import AppRoutes from "@/components/Routes.tsx";
import React from "react";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle.tsx";
import { Amplify } from "aws-amplify";
import awsConfig from "@/aws-export.ts";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/Context/AuthContext.tsx"; // 👈 use your custom context
import { TagsProvider } from "@/Context/TagContext.tsx"; // 👈 import it
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2, // Retry failed queries twice
      gcTime: 10 * 60 * 1000, // 10 minutes cache time
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
});

// Configure Amplify
Amplify.configure(awsConfig);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TagsProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <>
              <Toaster richColors position="top-center" />
              <div className="bg-muted min-h-screen">
                <ModeToggle />
                <AppRoutes />
              </div>
            </>
          </ThemeProvider>
        </TagsProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
