// src/main.tsx - FIXED: No BrowserRouter (RouterProvider handles it)
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      afterSignInUrl="/"
      afterSignUpUrl="/"
      signInUrl="/auth/login"
      signUpUrl="/auth/register"
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);
