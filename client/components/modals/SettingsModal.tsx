import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Github, FileText } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account and app preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Email
                </label>
                <p className="text-sm text-muted-foreground break-all">
                  {user?.email || "Not available"}
                </p>
              </div>

              {user?.user_metadata?.full_name && (
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Name
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {user.user_metadata.full_name}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground">
                  User ID
                </label>
                <p className="text-sm text-muted-foreground font-mono text-xs break-all">
                  {user?.id}
                </p>
              </div>
            </div>

            <div className="bg-card border border-border -lg p-3">
              <p className="text-xs text-muted-foreground">
                Dark mode is controlled from the header toggle. Your preference
                is automatically saved.
              </p>
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-4 mt-4">
            <div className="space-y-4">
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
                <h3 className="font-semibold text-foreground mb-2">Features</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    ✓ Store 9 content types (text, code, image, video, file,
                    link, prompt, script, book)
                  </li>
                  <li>✓ Real-time full-text search</li>
                  <li>✓ Tags and category filtering</li>
                  <li>✓ Cloud storage with public sharing</li>
                  <li>✓ Dark mode support</li>
                  <li>✓ Responsive design</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Version</h3>
                <p className="text-sm text-muted-foreground">1.0.0</p>
              </div>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-4 mt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Have feedback, questions, or found a bug? We'd love to hear from
                you!
              </p>

              <a
                href="mailto:dupsobon@gmail.com"
                className="flex items-center gap-3 p-3 -lg border border-border hover:bg-secondary transition-colors"
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
                className="flex items-center gap-3 p-3 -lg border border-border hover:bg-secondary transition-colors"
              >
                <Github className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">GitHub</p>
                  <p className="text-xs text-muted-foreground">
                    Open source repository
                  </p>
                </div>
              </a>

              <div className="bg-card border border-border -lg p-3">
                <p className="text-xs text-muted-foreground">
                  Your feedback helps us improve. Contact us anytime with
                  suggestions or issues.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
