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

Amplify.configure(awsConfig);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <TagsProvider> {/* 👈 ADD THIS */}
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <>
            <Toaster />
            <div className="bg-muted">
              <ModeToggle />
              <AppRoutes />
            </div>
          </>
        </ThemeProvider>
      </TagsProvider> {/* 👈 CLOSE IT */}
    </AuthProvider>
  </React.StrictMode>
);
