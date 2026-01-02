// src/components/SSOCallback.tsx
import { useEffect } from "react";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

export function SSOCallback() {
  useEffect(() => {
    console.log("🔄 Processing SSO callback...");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-purple-500/10">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-purple-500 mb-6 animate-pulse shadow-2xl shadow-primary/30">
          <span className="text-4xl">🔐</span>
        </div>
        <div className="flex items-center gap-3 justify-center mb-4">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-lg font-bold text-muted-foreground">
            Completing authentication...
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Please wait while we redirect you
        </p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}