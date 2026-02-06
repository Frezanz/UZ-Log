import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Mail,
  Instagram,
  Youtube,
  FileText,
  Moon,
  Sun,
} from "lucide-react";

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
            <div className="bg-card border border-border  p-6 space-y-4">
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

              <div className="bg-secondary/50 border border-border  p-3 mt-4">
                <p className="text-xs text-muted-foreground">
                  Dark mode is controlled from the header toggle. Your
                  preference is automatically saved.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* How to Use Tab */}
          <TabsContent value="how-to-use" className="space-y-4">
            <div className="bg-card border border-border  p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Getting Started with UZ-log
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Welcome to UZ-log, your personal content vault designed to
                    store, organize, manage, and share all types of digital
                    content in one secure place. Whether you're saving code
                    snippets, notes, links, media files, or AI prompts, UZ-log
                    provides a comprehensive solution for managing your personal
                    knowledge base. This guide will walk you through every
                    feature to help you get the most out of the platform.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  1. Understanding Content Types
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    UZ-log supports 9 different content types, each optimized
                    for different use cases. Understanding these types will help
                    you organize your content effectively:
                  </p>
                  <div className="bg-secondary/30 border border-border  p-4 space-y-3">
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">
                        Text - Notes, Articles & Ideas
                      </p>
                      <p className="text-xs">
                        Perfect for personal notes, article summaries, blog
                        posts, research notes, meeting minutes, and any written
                        content. Supports rich text formatting with title,
                        description, and metadata.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">
                        Code - Snippets & Algorithms
                      </p>
                      <p className="text-xs">
                        Store reusable code snippets in any programming language
                        (Python, JavaScript, Java, C++, etc.). Includes syntax
                        highlighting for easy readability and quick reference
                        when you need to remember that function you wrote.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">
                        Script - Bash, Python & Automation
                      </p>
                      <p className="text-xs">
                        Save complete scripts and automation routines. Great for
                        terminal commands, deployment scripts, data processing
                        scripts, and any executable code you want to reference
                        later.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">
                        Prompt - AI Prompts & Templates
                      </p>
                      <p className="text-xs">
                        Store your favorite AI prompts, ChatGPT templates,
                        instruction sets, and prompt variations. Perfect for
                        maintaining a library of optimized prompts for different
                        use cases and AI models.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">
                        Link - URLs & Web References
                      </p>
                      <p className="text-xs">
                        Bookmark important websites, articles, documentation,
                        and resources. Keep all your favorite links organized
                        with titles and descriptions instead of cluttering your
                        browser bookmarks.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">
                        Image - Screenshots & Graphics
                      </p>
                      <p className="text-xs">
                        Upload and store screenshots, diagrams, design mockups,
                        reference images, and any visual content. Perfect for
                        design inspiration, documentation, and visual examples.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">
                        Video - Tutorials & Media
                      </p>
                      <p className="text-xs">
                        Store video files, recorded tutorials, screen
                        recordings, and multimedia content. Organize video
                        references and keep track of important video resources
                        in one place.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">
                        File - Documents & Archives
                      </p>
                      <p className="text-xs">
                        Upload any file type (PDFs, Word documents,
                        spreadsheets, archives, etc.). Keep important documents
                        organized and easily accessible with proper
                        categorization.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">
                        Book - References & Literature
                      </p>
                      <p className="text-xs">
                        Track books you're reading or want to read, create
                        reading notes, store book recommendations, and maintain
                        a personal library index with summaries and insights.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  2. Creating & Adding Content
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    To create new content, click the chevron (↓) button on the
                    home screen to expand the action panel, then click "New
                    Content". Follow these detailed steps:
                  </p>
                  <div className="bg-secondary/30 border border-border  p-4 space-y-4">
                    <div>
                      <p className="font-medium text-foreground mb-2">
                        Step 1: Select Your Content Type
                      </p>
                      <p className="text-xs mb-2">
                        Click the "Content Type" dropdown to choose which type
                        of content you want to create (Text, Code, Script,
                        Prompt, Link, Image, Video, File, or Book). Each type
                        has optimized fields for that specific content.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-2">
                        Step 2: Add a Title
                      </p>
                      <p className="text-xs mb-2">
                        Enter a descriptive title that clearly identifies your
                        content. Good titles make searching easier later.
                        Examples: "Python List Sorting Algorithm", "AWS S3 Setup
                        Guide", "React Hooks Best Practices"
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-2">
                        Step 3: Enter Your Content
                      </p>
                      <p className="text-xs mb-2">
                        Add the actual content (text, code, link URL, file
                        upload, etc.). For code content, you can paste directly
                        with syntax highlighting automatically applied. For
                        files and media, use the upload button.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-2">
                        Step 4: Assign a Category
                      </p>
                      <p className="text-xs mb-2">
                        Choose or create a category to organize your content
                        logically. Good categories might be: Work, Personal,
                        Programming, Learning, Ideas, Design, Documentation, or
                        create custom categories based on your needs.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-2">
                        Step 5: Add Tags for Better Discovery
                      </p>
                      <p className="text-xs mb-2">
                        Add comma-separated tags to make your content more
                        discoverable. Tags act as keywords for searching.
                        Examples: "python,algorithm,sorting" or
                        "important,urgent,reference". Use consistent tag names
                        across similar content.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-2">
                        Step 6: Set Privacy & Sharing
                      </p>
                      <p className="text-xs mb-2">
                        Toggle the "Public" switch if you want to make this
                        content publicly shareable via a unique link. Private
                        content is only visible to you. Once public, anyone with
                        the link can view your content without needing to log
                        in.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-2">
                        Step 7: Save Your Content
                      </p>
                      <p className="text-xs">
                        Click the "Save" button to store your content in UZ-log.
                        Your content is now safely saved and can be accessed
                        anytime from any device.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  3. Organizing Your Content Effectively
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Proper organization is key to making UZ-log useful. Here's
                    how to structure your content for maximum efficiency:
                  </p>
                  <div className="bg-secondary/30 border border-border  p-4 space-y-3">
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Categories: The Foundation of Organization
                      </p>
                      <p className="text-xs">
                        Categories are the primary way to organize your content.
                        Create meaningful categories that match your workflow.
                        Examples: "Work Projects", "Learning", "Code Snippets",
                        "Design Resources", "Personal Notes", "AI Prompts". Keep
                        category names consistent and descriptive. Avoid
                        creating too many categories (5-10 is ideal) as it
                        becomes harder to navigate.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Tags: Secondary Organization & Discovery
                      </p>
                      <p className="text-xs">
                        Tags provide a secondary layer of organization. While
                        categories are broad, tags are specific. Use tags to
                        mark content attributes like urgency, status, or topic.
                        Examples: "urgent", "reviewed", "incomplete",
                        "favorite", "to-revisit". Tags help you quickly filter
                        content within a category or across the entire vault.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Naming Conventions
                      </p>
                      <p className="text-xs">
                        Use clear, consistent naming patterns. Instead of
                        "Important Stuff", use "React Hooks Best Practices v2".
                        Include version numbers, dates, or languages when
                        relevant. This makes scanning your content list easier
                        and helps with sorting.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Metadata Enrichment
                      </p>
                      <p className="text-xs">
                        Add descriptions and notes to your content when creating
                        it. This provides context for future reference. A code
                        snippet's description might note what problem it solves.
                        An article link might include a brief summary. The more
                        context, the more valuable your vault becomes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  4. Advanced Search & Filtering
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    UZ-log provides powerful search and filtering capabilities
                    to help you find exactly what you need instantly, even if
                    you have thousands of items stored:
                  </p>
                  <div className="bg-secondary/30 border border-border  p-4 space-y-3">
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Full-Text Search
                      </p>
                      <p className="text-xs">
                        The main search bar searches across your entire vault.
                        It searches in titles, content, tags, categories, and
                        descriptions. Type any keyword and results appear
                        instantly. The search is smart enough to find partial
                        matches and variations.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Sorting Options
                      </p>
                      <p className="text-xs">
                        Sort your results by different criteria: Newest (most
                        recent first), Oldest (earliest first), A-Z
                        (alphabetical), or Word Count (longest first). Choose
                        the sorting that works best for your current task.
                        Newest is perfect for recent work; A-Z helps when
                        browsing a category.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Filter by Category
                      </p>
                      <p className="text-xs">
                        Narrow down results by selecting one or more categories.
                        When you click a category, you see only items in that
                        category. This is useful when you know which area of
                        your vault to search but need to find something specific
                        within it.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Filter by Tags
                      </p>
                      <p className="text-xs">
                        Select specific tags to see only content with those
                        tags. You can select multiple tags to narrow results
                        further. Tags are perfect for finding all "urgent" items
                        across all categories, or all "favorite" snippets
                        regardless of type.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Search Examples
                      </p>
                      <p className="text-xs bg-background/50 p-2 rounded font-mono text-xs">
                        Search "async" → See all async-related code
                        <br />
                        "react" + Category "Code" → React code only
                        <br />
                        "python" + Tag "useful" → Useful Python snippets
                        <br />
                        Category "Work" + Sort "Newest" → Recent work items
                        <br />
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  5. Sharing Your Content Publicly
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Make your content shareable and accessible to others with
                    just a few clicks:
                  </p>
                  <div className="bg-secondary/30 border border-border  p-4 space-y-3">
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Making Content Public
                      </p>
                      <p className="text-xs">
                        When creating or editing content, toggle the "Public"
                        switch to ON. This generates a unique, unguessable link
                        that you can share with others. Your content remains
                        private to you until you toggle this setting.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Sharing Links
                      </p>
                      <p className="text-xs">
                        Once content is public, click the share icon on the
                        content card to copy the public link. Share this link
                        via email, chat, social media, or any communication
                        channel. Anyone with the link can view your content
                        without logging in.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Viewing Permissions
                      </p>
                      <p className="text-xs">
                        Public content is read-only for others. Viewers can see
                        all details but cannot edit, download, or delete your
                        content. Only you can modify or manage your content.
                        This ensures your vault content remains under your
                        complete control.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Revoking Public Access
                      </p>
                      <p className="text-xs">
                        Toggle the "Public" switch OFF to make content private
                        again. Previously shared links will stop working. This
                        is useful if you want to keep something private or if
                        you no longer want to share it publicly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  6. Editing & Managing Content
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Manage your content with full control and flexibility:</p>
                  <div className="bg-secondary/30 border border-border  p-4 space-y-3">
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Editing Content
                      </p>
                      <p className="text-xs">
                        Hover over any content card to reveal action buttons.
                        Click the "Edit" button to modify the title, content,
                        category, tags, description, or public status. All
                        changes are saved automatically when you update the
                        content.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Downloading Files
                      </p>
                      <p className="text-xs">
                        For file, image, and video content, the "Download"
                        button allows you to save the file back to your
                        computer. This is useful for backing up important
                        documents or accessing media files offline.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Copying Content
                      </p>
                      <p className="text-xs">
                        For text and code content, you can select and copy the
                        content to your clipboard for use elsewhere. Most
                        content has copy-to-clipboard functionality built in for
                        convenience.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Deleting Content
                      </p>
                      <p className="text-xs">
                        Click the "Delete" button to remove content permanently.
                        Be careful—deleted content cannot be recovered. For
                        important content, consider keeping it even if you don't
                        use it regularly, as it takes minimal storage space.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  7. Multi-Device Sync
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Your content is synchronized across all your devices
                    automatically. Access UZ-log from your computer, tablet, or
                    smartphone, and all your content is instantly available.
                    Changes made on one device appear on all others within
                    seconds. This cloud-based approach means you always have
                    access to your vault regardless of where you are.
                  </p>
                </div>
              </div>

              <div className="bg-secondary/50 border border-border  p-4 space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Pro Tips for Maximum Productivity:
                </p>
                <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                  <li>
                    Create a consistent tagging strategy and stick with it. This
                    makes searching much more effective.
                  </li>
                  <li>
                    Review and reorganize your vault monthly. Remove outdated
                    content and update category structures as needed.
                  </li>
                  <li>
                    Use descriptive titles and add meaningful descriptions to
                    complex content for future reference.
                  </li>
                  <li>
                    Create a "Favorites" or "Important" tag for quick access to
                    your most-used items.
                  </li>
                  <li>
                    Share useful public content with your community and build a
                    reputation as a knowledge contributor.
                  </li>
                  <li>
                    Use the most recent-first sorting to quickly see what you've
                    been working on lately.
                  </li>
                  <li>
                    Backup critical files by downloading them periodically,
                    especially important documents and scripts.
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-4">
            <div className="bg-card border border-border  p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  About UZ-log
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    UZ-log is a powerful, all-in-one personal content vault
                    designed to help you store, organize, manage, and share all
                    types of digital content in a secure cloud environment.
                    Created with the modern digital creator in mind, UZ-log
                    serves as your personal knowledge management system, serving
                    as a central hub for everything from code snippets and notes
                    to media files and research materials.
                  </p>
                  <p>
                    Whether you're a software developer saving code snippets, a
                    content creator managing resources, a student organizing
                    notes, or a professional building a knowledge base, UZ-log
                    provides the tools to keep everything organized and
                    accessible across all your devices.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Core Mission
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To empower individuals to build and maintain their personal
                  digital knowledge base with an intuitive, secure, and
                  feature-rich platform. UZ-log believes that everyone should
                  have easy access to their accumulated knowledge, insights, and
                  resources, anytime and anywhere.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Key Features
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="font-medium text-foreground text-sm">
                      Diverse Content Types
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Store 9 different types of content: Text (notes,
                      articles), Code (snippets, algorithms), Scripts (Bash,
                      Python, automation), Prompts (AI templates), Links
                      (bookmarks), Images (screenshots, graphics), Videos
                      (tutorials, recordings), Files (documents, archives), and
                      Books (references, reading notes). Each content type is
                      optimized with relevant fields and features.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground text-sm">
                      Intelligent Search & Discovery
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Find what you need instantly with our full-text search
                      engine that searches across titles, content, tags,
                      categories, and descriptions. Advanced filtering options
                      let you narrow results by category, tags, content type,
                      and sort by relevance, date, or alphabetical order.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground text-sm">
                      Smart Organization System
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Organize your content using a two-level system: Categories
                      for broad organization (Work, Learning, Ideas) and Tags
                      for specific attributes (urgent, reviewed, favorite). This
                      hierarchical approach ensures your vault remains organized
                      no matter how much content you accumulate.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground text-sm">
                      Secure Cloud Storage
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your content is stored securely on cloud infrastructure
                      with robust encryption, automatic backups, and redundancy
                      measures. All data transmission is secure, and your
                      information is protected with industry-standard security
                      practices.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground text-sm">
                      Public Sharing Capabilities
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Make any content public with a single click and share it
                      via unique, unguessable links. Share code snippets,
                      guides, resources, or insights with others without
                      requiring them to have a UZ-log account. Shared content is
                      read-only for protection.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground text-sm">
                      Multi-Device Synchronization
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Access your entire vault from desktop, tablet, or mobile
                      devices. All changes sync automatically across all your
                      devices within seconds. Start working on one device and
                      continue seamlessly on another without any manual syncing
                      required.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground text-sm">
                      User Authentication & Privacy
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Secure sign-in with email-based authentication keeps your
                      personal vault private. Only you can access your content
                      unless you explicitly choose to share it publicly. Your
                      data is yours alone, stored securely and never shared with
                      third parties.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground text-sm">
                      Dark Mode Support
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Comfortable viewing in low-light environments with our
                      beautifully designed dark theme. Your theme preference is
                      automatically saved and applied across all devices for a
                      consistent experience.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground text-sm">
                      Fully Responsive Design
                    </p>
                    <p className="text-sm text-muted-foreground">
                      UZ-log is built with mobile-first design principles.
                      Whether you're on a large desktop monitor or a small
                      smartphone screen, the interface adapts seamlessly to
                      provide an optimal experience on any device size.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground text-sm">
                      File Management
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Upload and manage files of any type. Download files back
                      to your computer anytime. Built-in support for images,
                      videos, documents, and archives ensures you can store any
                      digital content type you need.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Technology Stack
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  UZ-log is built with modern, reliable technologies:
                </p>
                <div className="bg-secondary/30 border border-border  p-4">
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    <li>
                      <span className="font-medium">Frontend:</span> React 18
                      with React Router for smooth, responsive user interfaces
                    </li>
                    <li>
                      <span className="font-medium">Backend:</span> Express.js
                      server for reliable API handling and business logic
                    </li>
                    <li>
                      <span className="font-medium">Database:</span> Supabase
                      for secure cloud storage with real-time capabilities
                    </li>
                    <li>
                      <span className="font-medium">Styling:</span> TailwindCSS
                      3 with Radix UI components for beautiful, accessible
                      design
                    </li>
                    <li>
                      <span className="font-medium">Type Safety:</span> Full
                      TypeScript implementation across frontend and backend
                    </li>
                    <li>
                      <span className="font-medium">Build Tool:</span> Vite for
                      fast development and optimized production builds
                    </li>
                    <li>
                      <span className="font-medium">Testing:</span> Vitest for
                      comprehensive test coverage
                    </li>
                    <li>
                      <span className="font-medium">Validation:</span> Zod for
                      runtime data validation and type safety
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Perfect For
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>
                    <span className="font-medium">Software Developers</span> -
                    Store and reference code snippets, algorithms, and technical
                    solutions
                  </li>
                  <li>
                    <span className="font-medium">Students & Learners</span> -
                    Organize notes, research, links, and learning resources by
                    subject
                  </li>
                  <li>
                    <span className="font-medium">Content Creators</span> -
                    Manage ideas, prompts, references, and creative resources
                  </li>
                  <li>
                    <span className="font-medium">Professionals</span> - Build a
                    personal knowledge base of business practices, templates,
                    and references
                  </li>
                  <li>
                    <span className="font-medium">Researchers</span> - Store
                    papers, links, notes, and findings organized by topic
                  </li>
                  <li>
                    <span className="font-medium">Anyone</span> - Building a
                    personal knowledge base for career growth and skill
                    development
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Why Choose UZ-log?
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">
                      All-in-One Solution:
                    </span>{" "}
                    Unlike scattered notes apps, code repositories, and bookmark
                    managers, UZ-log consolidates everything in one organized
                    place.
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      Privacy-First Design:
                    </span>{" "}
                    Your content is yours. We don't use your data for any
                    purposes, and you maintain complete control over what's
                    private and what's shared.
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      Intuitive Interface:
                    </span>{" "}
                    Clean, modern design that's easy to learn and use. Get
                    started in minutes without a steep learning curve.
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      Always Accessible:
                    </span>{" "}
                    Cloud-based with automatic sync means your knowledge is
                    always available wherever you are, on any device.
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      Powerful Organization:
                    </span>{" "}
                    Smart categorization and tagging system keeps your vault
                    organized even with thousands of items.
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      Community Sharing:
                    </span>{" "}
                    Share your knowledge easily with others through public
                    links, building connections and helping your community.
                  </p>
                </div>
              </div>

              <div className="bg-secondary/50 border border-border  p-4">
                <p className="font-medium text-foreground mb-2">Version</p>
                <p className="text-sm text-muted-foreground mb-3">1.0.0</p>
                <p className="text-xs text-muted-foreground">
                  UZ-log continues to evolve with new features and improvements.
                  Your feedback helps shape the future of the platform.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-4">
            <div className="bg-card border border-border  p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Have feedback, questions, or found a bug? We'd love to hear from
                you!
              </p>

              <a
                href="mailto:dupsobon@gmail.com"
                className="flex items-center gap-3 p-3  border border-border hover:bg-secondary transition-colors"
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
                className="flex items-center gap-3 p-3  border border-border hover:bg-secondary transition-colors"
              >
                <Instagram className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">
                    Instagram
                  </p>
                  <p className="text-xs text-muted-foreground">@frezanz</p>
                </div>
              </a>

              <a
                href="https://youtube.com/@frezanzzz?si=qWfgz5qt421TIK74"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3  border border-border hover:bg-secondary transition-colors"
              >
                <Youtube className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">YouTube</p>
                  <p className="text-xs text-muted-foreground">@frezanzzz</p>
                </div>
              </a>

              <div className="bg-secondary/50 border border-border  p-3">
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
