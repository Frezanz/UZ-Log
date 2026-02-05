import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Github, FileText, Moon, Sun } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                Settings
              </h1>
            </div>

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="how-to-use">How to Use</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              {isAuthenticated && user ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Email
                    </label>
                    <p className="text-sm text-muted-foreground break-all mt-1">
                      {user.email || "Not available"}
                    </p>
                  </div>

                  {user.user_metadata?.full_name && (
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Name
                      </label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {user.user_metadata.full_name}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-foreground">
                      User ID
                    </label>
                    <p className="text-sm text-muted-foreground font-mono text-xs break-all mt-1">
                      {user.id}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Sign in to see your profile information
                  </p>
                  <Button onClick={() => navigate("/login")}>Sign In</Button>
                </div>
              )}

              <div className="bg-secondary/50 border border-border rounded-lg p-3 mt-4">
                <p className="text-xs text-muted-foreground">
                  Dark mode is controlled from the header toggle. Your
                  preference is automatically saved.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  About UZ-log
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  UZ-log is a personal content vault with multi-device sync,
                  user authentication, and public sharing capabilities.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Features</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>
                      Store 9 content types (text, code, image, video, file,
                      link, prompt, script, book)
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Real-time full-text search</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Tags and category filtering</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Cloud storage with public sharing</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Dark mode support</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Responsive design</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Version</h3>
                <p className="text-sm text-muted-foreground">1.0.0</p>
              </div>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Have feedback, questions, or found a bug? We'd love to hear from
                you!
              </p>

              <a
                href="mailto:dupsobon@gmail.com"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
              >
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">Email</p>
                  <p className="text-xs text-muted-foreground">
                    dupsobon@gmail.com
                  </p>
                </div>
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
              >
                <Github className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">GitHub</p>
                  <p className="text-xs text-muted-foreground">
                    Open source repository
                  </p>
                </div>
              </a>

              <div className="bg-secondary/50 border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  Your feedback helps us improve. Contact us anytime with
                  suggestions or issues.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
