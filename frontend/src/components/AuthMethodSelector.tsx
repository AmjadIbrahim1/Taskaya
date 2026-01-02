// src/components/AuthMethodSelector.tsx
import { useNavigate } from "react-router-dom";
import { useSignIn } from "@clerk/clerk-react";
import { Mail, LogIn } from "lucide-react";

interface AuthMethodSelectorProps {
  onSelectJWT: () => void;
  onSelectClerk: "clerk";
}

export function AuthMethodSelector({
  onSelectJWT,
  onSelectClerk,
}: AuthMethodSelectorProps) {
  const navigate = useNavigate();
  const { signIn, isLoaded } = useSignIn();

  const handleOAuth = async (
    provider: "oauth_google" | "oauth_github" | "oauth_linkedin"
  ) => {
    if (!isLoaded) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: window.location.origin + "/sso-callback",
        redirectUrlComplete: window.location.origin + "/",
      });
    } catch (err: any) {
      console.error("OAuth error:", err);
    }
  };

  const handleEmailLogin = () => {
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-purple-500/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-purple-500 mb-6 animate-in zoom-in duration-500 delay-150 shadow-2xl shadow-primary/30">
            <span className="text-4xl">📝</span>
          </div>
          <h1 className="text-5xl font-black mb-3">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Welcome to Taskaya! 👋
            </span>
          </h1>
          <p className="text-muted-foreground font-bold text-lg">
            Choose how you want to sign in
          </p>
        </div>

        <div className="bg-card border-2 rounded-3xl p-8 shadow-2xl shadow-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 backdrop-blur-xl space-y-6">
          {/* Email/Password Option */}
          <div className="space-y-3">
            <h2 className="text-xl font-black text-center mb-4">
              Sign in with Email
            </h2>
            <button
              onClick={handleEmailLogin}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary via-purple-500 to-primary text-white font-black text-lg hover:opacity-90 active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 bg-[length:200%_auto] animate-gradient"
            >
              <Mail className="w-6 h-6" />
              Continue with Email
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground font-bold">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login Options */}
          <div className="space-y-3">
            <h2 className="text-xl font-black text-center mb-4">
              Quick Sign In
            </h2>

            <button
              onClick={() => handleOAuth("oauth_google")}
              disabled={!isLoaded}
              className="w-full py-4 rounded-2xl border-2 border-input hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-3 font-bold disabled:opacity-50 hover:scale-[1.02]"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            <button
              onClick={() => handleOAuth("oauth_github")}
              disabled={!isLoaded}
              className="w-full py-4 rounded-2xl border-2 border-input hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-3 font-bold disabled:opacity-50 hover:scale-[1.02]"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Sign in with GitHub
            </button>

            <button
              onClick={() => handleOAuth("oauth_linkedin")}
              disabled={!isLoaded}
              className="w-full py-4 rounded-2xl border-2 border-input hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-3 font-bold disabled:opacity-50 hover:scale-[1.02]"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Sign in with LinkedIn
            </button>
          </div>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to Taskaya's Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
