// src/router/index.tsx - FIXED: Auth method context
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useAuthStore } from "@/store";
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
   Auth Method Hook (SAFE)
-----------------------------------*/
export function useAuthMethod(): "clerk" | "jwt" | null {
  const { isSignedIn, isLoaded } = useAuth();
  const { isAuthenticated, token } = useAuthStore();

  console.log("🔍 useAuthMethod Debug:", {
    clerkLoaded: isLoaded,
    clerkSignedIn: isSignedIn,
    jwtAuthenticated: isAuthenticated,
    hasJWTToken: !!token,
  });

  if (!isLoaded) {
    console.log("⏳ Clerk not loaded yet");
    return null;
  }

  if (isSignedIn) {
    console.log("✅ Auth Method: CLERK");
    return "clerk";
  }

  if (isAuthenticated && token) {
    console.log("✅ Auth Method: JWT");
    return "jwt";
  }

  console.log("❌ No authentication found");
  return null;
}

/* ----------------------------------
   Protected Route
-----------------------------------*/
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { isAuthenticated } = useAuthStore();

  if (!isLoaded) return <LoadingScreen />;

  if (!isSignedIn && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

/* ----------------------------------
   Auth Route
-----------------------------------*/
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { isAuthenticated } = useAuthStore();

  if (!isLoaded) return <LoadingScreen />;

  if (isSignedIn || isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/* ----------------------------------
   Protected Layout with Auth Context
-----------------------------------*/
function ProtectedLayout() {
  const authMethod = useAuthMethod();

  console.log("🔐 ProtectedLayout - Auth Method:", authMethod);

  return (
    <ProtectedRoute>
      <MainLayout authMethod={authMethod} />
    </ProtectedRoute>
  );
}

/* ----------------------------------
   Router
-----------------------------------*/
export const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Main /> },
      { path: "completed", element: <Completed /> },
      { path: "urgent", element: <Urgent /> },
    ],
  },
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
          onBack={() => (window.location.href = "/auth")}
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
          onBack={() => (window.location.href = "/auth")}
        />
      </AuthRoute>
    ),
  },
  {
    path: "/sso-callback",
    element: <SSOCallback />,
  },
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
