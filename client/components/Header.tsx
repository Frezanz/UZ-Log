import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, Settings, LogOut, Moon, Sun, MessageCircle } from "lucide-react";
import { SettingsModal } from "./modals/SettingsModal";
import { useTheme } from "@/hooks/useTheme";

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const { isDark, toggleDarkMode } = useTheme();
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollYRef = useRef(0);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Handle scroll to hide/show header like YouTube, Instagram, Facebook
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollYRef.current;

      // Show header when at the top of page
      if (currentScrollY < 10) {
        setIsHidden(false);
      }
      // Hide header when scrolling down more than 5px with speed
      else if (scrollDifference > 5 && currentScrollY > 50) {
        setIsHidden(true);
      }
      // Show header immediately when scrolling up
      else if (scrollDifference < -5) {
        setIsHidden(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out ${
          isHidden ? "-translate-y-full shadow-none" : "translate-y-0 shadow-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                UZ-log
              </h1>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                title={isDark ? "Light mode" : "Dark mode"}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </Button>

              {/* User Profile */}
              {user && (
                <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-secondary">
                  <div className="text-right">
                    <p className="text-xs font-medium text-foreground truncate max-w-[120px]">
                      {user.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Settings Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(true)}
                title="Settings"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>

              {/* Sign Out Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sign out"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};
