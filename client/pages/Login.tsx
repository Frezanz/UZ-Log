import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "@/lib/api";
import { getSupabaseConfigStatus } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock, Zap, BookOpen, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const supabaseConfig = getSupabaseConfigStatus();

  const handleGoogleSignIn = async () => {
    const { configured, message } = getSupabaseConfigStatus();

    if (!configured) {
      toast.error(message);
      return;
    }

    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to sign in with Google";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">UZ-log</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Your personal content vault
        </p>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-sm">
        <div className="space-y-6">
          {/* Features */}
          <div className="space-y-3 mb-8">
            <div className="flex gap-3">
              <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground text-sm">
                  Create & Organize
                </h3>
                <p className="text-muted-foreground text-sm">
                  Store text, code, images, videos, files and more
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground text-sm">
                  Private & Secure
                </h3>
                <p className="text-muted-foreground text-sm">
                  All your data stays private and synced
                </p>
              </div>
            </div>
          </div>

          {/* Sign In Configuration Warning */}
          {!supabaseConfig.configured && (
            <div className="p-4 rounded-lg border border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    Sign-in Unavailable
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    {supabaseConfig.message} You can still use the app as a
                    guest with full functionality.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sign In Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading || !supabaseConfig.configured}
            size="lg"
            className="w-full"
            title={
              !supabaseConfig.configured ? supabaseConfig.message : undefined
            }
          >
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                or
              </span>
            </div>
          </div>

          {/* Continue as Guest Button */}
          <Button
            onClick={handleContinueAsGuest}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Continue as Guest
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>© 2024 UZ-log • A modern content vault</p>
      </div>
    </div>
  );
}
