// src/router/index.tsx - UPDATED: With Landing Page
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useAuthStore } from "@/store";
import { LandingPage } from "@/pages/LandingPage";
import { MainLayout } from "@/components/layouts/MainLayout";
import { AuthMethodSelector } from "@/components/AuthMethodSelector";
import { Login } from "@/components/Login";
import { Register } from "@/components/Register";
import { SSOCallback } from "@/components/SSOCallback";
import { Main } from "@/components/Main";
import { Completed } from "@/components/Completed";
import { Urgent } from "@/components/Urgent";
import { Loader2 } from "lucide-react";

/* ----------------------------------
   Loading Screen
-----------------------------------*/
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

/* ----------------------------------
   Auth Method Hook
-----------------------------------*/
export function useAuthMethod(): "clerk" | "jwt" | null {
  const { isSignedIn, isLoaded } = useAuth();
  const { isAuthenticated, token } = useAuthStore();

  if (!isLoaded) return null;
  if (isSignedIn) return "clerk";
  if (isAuthenticated && token) return "jwt";
  return null;
}

/* ----------------------------------
   Root Redirect Component
-----------------------------------*/
function RootRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isAuthenticated } = useAuthStore();

  if (!isLoaded) return <LoadingScreen />;

  // Redirect based on auth status
  if (isSignedIn || isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return <Navigate to="/landing" replace />;
}

/* ----------------------------------
   Protected Route (for App pages)
-----------------------------------*/
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { isAuthenticated } = useAuthStore();

  if (!isLoaded) return <LoadingScreen />;

  // If not authenticated, redirect to landing page
  if (!isSignedIn && !isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  return <>{children}</>;
}

/* ----------------------------------
   Auth Route (for Login/Register pages)
-----------------------------------*/
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { isAuthenticated } = useAuthStore();

  if (!isLoaded) return <LoadingScreen />;

  // If already authenticated, redirect to app
  if (isSignedIn || isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}

/* ----------------------------------
   Protected Layout with Auth Context
-----------------------------------*/
function ProtectedLayout() {
  const authMethod = useAuthMethod();

  return (
    <ProtectedRoute>
      <MainLayout authMethod={authMethod} />
    </ProtectedRoute>
  );
}

/* ----------------------------------
   Router Configuration
-----------------------------------*/
export const router = createBrowserRouter([
  // Root - Auto redirect
  {
    path: "/",
    element: <RootRedirect />,
  },

  // Landing Page (Public)
  {
    path: "/landing",
    element: <LandingPage />,
  },

  // App Routes (Protected)
  {
    path: "/app",
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Main /> },
      { path: "completed", element: <Completed /> },
      { path: "urgent", element: <Urgent /> },
    ],
  },

  // Auth Routes (Public)
  {
    path: "/auth",
    element: (
      <AuthRoute>
        <AuthMethodSelector
          onSelectJWT={() => (window.location.href = "/auth/login")}
          onSelectClerk="clerk"
        />
      </AuthRoute>
    ),
  },
  {
    path: "/auth/login",
    element: (
      <AuthRoute>
        <Login
          onSwitchToRegister={() => (window.location.href = "/auth/register")}
          onBack={() => (window.location.href = "/landing")}
        />
      </AuthRoute>
    ),
  },
  {
    path: "/auth/register",
    element: (
      <AuthRoute>
        <Register
          onSwitchToLogin={() => (window.location.href = "/auth/login")}
          onBack={() => (window.location.href = "/landing")}
        />
      </AuthRoute>
    ),
  },

  // SSO Callback
  {
    path: "/sso-callback",
    element: <SSOCallback />,
  },

  // Catch-all: Redirect to root
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

/* ----------------------------------
   Router Provider
-----------------------------------*/
export function AppRouter() {
  return <RouterProvider router={router} />;
}