// src/components/Register.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import { Eye, EyeOff, UserPlus, Loader2, ArrowLeft } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { z } from "zod";

interface RegisterProps {
  onSwitchToLogin: () => void;
  onBack: () => void;
}

export function Register({ onSwitchToLogin, onBack }: RegisterProps) {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterInput, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError("");

    // Basic validation
    const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fieldErrors.email = "Please enter a valid email address";
    }

    if (!password || password.length < 6) {
      fieldErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      fieldErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password);
      // Success - navigate to home
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("Registration error:", err);
      setGeneralError(err?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-purple-500/10 p-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold">Back to options</span>
        </button>

        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-purple-500 mb-6 animate-in zoom-in duration-500 delay-150 shadow-2xl shadow-primary/30">
            <span className="text-4xl">✨</span>
          </div>
          <h1 className="text-5xl font-black mb-3">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Join Taskaya! 🚀
            </span>
          </h1>
          <p className="text-muted-foreground font-bold text-lg">
            Create your account to get started
          </p>
        </div>

        <div className="bg-card border-2 rounded-3xl p-8 shadow-2xl shadow-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {generalError && (
              <div className="p-4 rounded-2xl bg-destructive/10 border-2 border-destructive/30 text-destructive font-bold text-sm animate-in fade-in">
                ⚠️ {generalError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-black text-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-5 py-4 rounded-2xl bg-background border-2 ${
                  errors.email ? "border-destructive" : "border-input"
                } focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all font-bold shadow-lg`}
                placeholder="you@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-destructive text-sm font-bold">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-5 py-4 pr-14 rounded-2xl bg-background border-2 ${
                    errors.password ? "border-destructive" : "border-input"
                  } focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all font-bold shadow-lg`}
                  placeholder="Create a password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all hover:scale-110"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm font-bold">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-foreground">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-5 py-4 pr-14 rounded-2xl bg-background border-2 ${
                    errors.confirmPassword
                      ? "border-destructive"
                      : "border-input"
                  } focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all font-bold shadow-lg`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all hover:scale-110"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive text-sm font-bold">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary via-purple-500 to-primary text-white font-black text-lg hover:opacity-90 active:scale-95 transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3 bg-[length:200%_auto] animate-gradient"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-6 h-6" />
                  Sign Up
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm font-bold text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-primary font-black hover:underline transition-all"
                disabled={isLoading}
              >
                Sign in 👋
              </button>
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
