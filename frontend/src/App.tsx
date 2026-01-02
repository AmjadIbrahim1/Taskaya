// src/App.tsx - FIXED: No useNavigate (RouterProvider handles navigation)
import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "./store";
import { AppRouter } from "./router";
import { ThemeProvider } from "./components/theme-provider";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  const { isLoaded: clerkLoaded } = useAuth();
  const { initializeAuth } = useAuthStore();

  // Initialize JWT auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Show loading screen while Clerk initializes
  if (!clerkLoaded) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="taskaya-theme">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-purple-500/10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-purple-500 mb-6 animate-pulse shadow-2xl shadow-primary/30">
              <span className="text-4xl">📝</span>
            </div>
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground font-bold">
              Loading Taskaya...
            </p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="taskaya-theme">
        <AppRouter />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
