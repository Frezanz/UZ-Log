import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Instagram, Youtube, FileText, Moon, Sun } from "lucide-react";

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

          {/* How to Use Tab */}
          <TabsContent value="how-to-use" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Getting Started
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    UZ-log is a personal content vault where you can store,
                    organize, and share various types of content. Here's how to
                    get started:
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  1. Creating Content
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Click the chevron (↓) on the home screen to expand the
                    action buttons, then click "New Content".
                  </p>
                  <div className="bg-secondary/30 border border-border rounded-lg p-4 space-y-3">
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Step 1: Select Content Type
                      </p>
                      <p>Click the "Content Type" chevron to choose from:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                        <li>
                          <span className="font-medium">Text</span> - Notes,
                          articles, ideas
                        </li>
                        <li>
                          <span className="font-medium">Code</span> - Code
                          snippets, algorithms
                        </li>
                        <li>
                          <span className="font-medium">Script</span> - Bash,
                          Python, etc.
                        </li>
                        <li>
                          <span className="font-medium">Prompt</span> - AI
                          prompts, templates
                        </li>
                        <li>
                          <span className="font-medium">Link</span> - URLs and
                          web links
                        </li>
                        <li>
                          <span className="font-medium">Image/Video/File</span>{" "}
                          - Media uploads
                        </li>
                        <li>
                          <span className="font-medium">Book</span> - Book
                          references
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Example: Creating a Code Snippet
                      </p>
                      <p className="text-xs bg-background/50 p-2 rounded font-mono">
                        1. Choose "Code" type
                        <br />
                        2. Add title: "Python List Reversal"
                        <br />
                        3. Enter code: my_list = [1,2,3]; reversed_list =
                        my_list[::-1]
                        <br />
                        4. Add tags: python, useful
                        <br />
                        5. Set category: Programming
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  2. Organizing Content
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Every content item has:</p>
                  <div className="bg-secondary/30 border border-border rounded-lg p-4 space-y-2 text-xs">
                    <p>
                      <span className="font-medium">Title:</span> Name your
                      content
                    </p>
                    <p>
                      <span className="font-medium">Category:</span> Organize by
                      type (e.g., Work, Personal, Ideas)
                    </p>
                    <p>
                      <span className="font-medium">Tags:</span> Add
                      comma-separated keywords (e.g., important, urgent, review)
                    </p>
                    <p>
                      <span className="font-medium">Public:</span> Make content
                      shareable via link
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  3. Searching & Filtering
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Use the search bar to find content instantly. Expand the
                    chevron to access advanced filters:
                  </p>
                  <div className="bg-secondary/30 border border-border rounded-lg p-4 space-y-2 text-xs">
                    <p>
                      <span className="font-medium">Search:</span> Full-text
                      search across all content
                    </p>
                    <p>
                      <span className="font-medium">Sort By:</span> Newest,
                      Oldest, A-Z, Word Count
                    </p>
                    <p>
                      <span className="font-medium">Categories:</span> Filter by
                      category
                    </p>
                    <p>
                      <span className="font-medium">Tags:</span> Filter by tags
                    </p>
                  </div>
                  <p className="text-xs italic mt-2">
                    Example: Search "python" → Filter by "code" category → Sort
                    by "newest"
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  4. Sharing Content
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Click the share icon on any content card to:</p>
                  <div className="bg-secondary/30 border border-border rounded-lg p-4 space-y-2 text-xs">
                    <p>• Make it public (shareable via link)</p>
                    <p>• Copy the public link</p>
                    <p>• Anyone with the link can view public content</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  5. Editing & Deleting
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Hover over any content card to see action buttons:</p>
                  <div className="bg-secondary/30 border border-border rounded-lg p-4 space-y-2 text-xs">
                    <p>
                      <span className="font-medium">Edit:</span> Modify content,
                      category, tags
                    </p>
                    <p>
                      <span className="font-medium">Share:</span> Make public or
                      copy link
                    </p>
                    <p>
                      <span className="font-medium">Download:</span> Download
                      files (if applicable)
                    </p>
                    <p>
                      <span className="font-medium">Delete:</span> Permanently
                      remove content
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/50 border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  💡 Pro Tip: Use consistent categories and tags to make
                  searching and organizing easier. The more structured your
                  content, the better you can find it later!
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
                href="https://www.instagram.com/frezanz?igsh=NnM1MmJqOW5vNmky"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
              >
                <Instagram className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">Instagram</p>
                  <p className="text-xs text-muted-foreground">
                    @frezanz
                  </p>
                </div>
              </a>

              <a
                href="https://youtube.com/@frezanzzz?si=qWfgz5qt421TIK74"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
              >
                <Youtube className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">YouTube</p>
                  <p className="text-xs text-muted-foreground">
                    @frezanzzz
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
