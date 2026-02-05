# UZ-log - Content Management Application

A production-ready, full-stack content management application built with React, TypeScript, and Supabase. Create, organize, and share 9 different types of content with ease. Features Google OAuth authentication, public content library, dark mode, and Supabase storage integration.

![UZ-log](https://img.shields.io/badge/status-active-success) ![License](https://img.shields.io/badge/license-MIT-blue)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Authentication](#authentication)
- [API Reference](#api-reference)
- [Component Documentation](#component-documentation)
- [Content Types](#content-types)
- [Routing](#routing)
- [State Management](#state-management)
- [Adding New Features](#adding-new-features)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Features

### Core Features

- **9 Content Types**: Text, Code, Image, Video, File, Link, Prompt, Script, and Book
- **Authentication**: Google OAuth via Supabase
- **Public Library**: View public content without authentication
- **Content Management**: Create, edit, delete, and share content (requires login)
- **Search & Filtering**: Full-text search, filter by category/tags, sort by (newest, oldest, A-Z, word count)
- **File Upload**: Upload and store files to Supabase Storage
- **Public Sharing**: Generate shareable links for public content
- **Dark Mode**: Toggle dark/light theme with persistent preference
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Book Support**: Multi-page content with book management

### Security Features

- Row Level Security (RLS) in PostgreSQL
- Private content isolation
- User authentication required for content creation
- Public content access control

## Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router 6** - Client-side routing
- **TailwindCSS 3** - Styling with custom grayscale palette
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **Date-fns** - Date formatting

### Backend

- **Supabase** - PostgreSQL database, authentication, file storage
- **Google OAuth 2.0** - Social authentication
- **Row Level Security (RLS)** - Database-level access control

### Development

- **Vite** - Build tool and dev server
- **SWC** - Rust-based JavaScript compiler
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## Project Structure

```
├── client/
│   ├── pages/
│   │   ├── Index.tsx              # Main application page (authenticated & anonymous)
│   │   ├── Login.tsx              # Google OAuth login page
│   │   └── Share.tsx              # Public content sharing page (/share/:id)
│   ├── components/
│   │   ├── Header.tsx             # Authenticated user header with settings
│   │   ├── SearchBar.tsx          # Full-text search input
│   │   ├── ContentCard.tsx        # Individual content item display
│   │   ├── FileUpload.tsx         # Drag-and-drop file upload
│   │   ├── modals/
│   │   │   ├── ContentModal.tsx   # Create/edit content modal
│   │   │   ├── ShareModal.tsx     # Public/private toggle modal
│   │   │   ├── DeleteModal.tsx    # Deletion confirmation modal
│   │   │   └── SettingsModal.tsx  # User settings (Profile, About, Contact)
│   │   └── ui/                    # Radix UI component wrappers
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client initialization
│   │   ├── api.ts                 # API functions (CRUD, auth, file ops)
│   │   └── utils.ts               # Utility functions
│   ├── context/
│   │   └── AuthContext.tsx        # Authentication state management
│   ├── hooks/
│   │   ├── useContent.ts          # Content management (fetch, create, edit, delete)
│   │   └── useTheme.ts            # Dark mode management
│   ├── types/
│   │   └── content.ts             # TypeScript interfaces
│   ├── global.css                 # Tailwind + custom grayscale colors
│   └── App.tsx                    # Route definitions
├── SQL_SCHEMA.sql                 # Database schema for manual setup
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Setup & Installation

### Prerequisites

- Node.js 16+
- npm or pnpm
- Supabase account (https://supabase.com)
- Google Cloud Console project for OAuth

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Frezanz/UZ-log.git
cd UZ-log

# Install dependencies
npm install
# or
pnpm install
```

### 2. Set Environment Variables

See [Environment Variables](#environment-variables) section for details.

### 3. Database Setup

See [Database Setup](#database-setup) section for schema creation.

### 4. Google OAuth Configuration

See [Authentication](#authentication) section for OAuth setup.

### 5. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

The app will be available at `http://localhost:5173`

## Environment Variables

Create or configure these variables in your Builder.io project settings or `.env.local` file:

### Required Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Google OAuth (created in Supabase OAuth settings)
VITE_GOOGLE_OAUTH_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

### Finding Your Credentials

**Supabase:**

1. Go to your Supabase project dashboard
2. Settings → API
3. Copy `Project URL` and `anon public` key

**Google OAuth Client ID:**

1. In Supabase, go to Authentication → Providers → Google
2. Copy the Client ID provided, or create one in Google Cloud Console

## Database Setup

### Using SQL_SCHEMA.sql

1. **Export the SQL schema:**
   - Download `SQL_SCHEMA.sql` from the project root

2. **Execute in Supabase SQL Editor:**
   - Go to Supabase Dashboard → SQL Editor
   - Click "New Query"
   - Copy and paste contents of `SQL_SCHEMA.sql`
   - Click "Run"

3. **Create Storage Bucket:**
   - Go to Storage → Buckets → Create Bucket
   - Name it: `uz-log-files`
   - Make it public if you want direct access to files

### Database Schema Details

**content table:**

```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- title: TEXT
- type: TEXT (text, code, image, video, file, link, prompt, script, book)
- content: JSONB (stores main content)
- category: TEXT (optional)
- tags: TEXT[] (array of strings)
- file_url: TEXT (Supabase Storage URL)
- file_size: BIGINT (in bytes)
- is_public: BOOLEAN (default: false)
- word_count: INTEGER (auto-calculated)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**book_pages table:**

```sql
- id: UUID
- book_id: UUID (foreign key to content)
- page_number: INTEGER
- content: JSONB
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Row Level Security (RLS) Policies:**

- Users can see only their own content
- Users can create content for themselves
- Users can update/delete only their own content
- Everyone can view public content
- Admins can bypass RLS

## Authentication

### Google OAuth Setup

1. **Create Google Cloud Project:**
   - Go to Google Cloud Console (https://console.cloud.google.com)
   - Create new project
   - Enable "Google+ API"

2. **Configure OAuth Consent Screen:**
   - Go to "OAuth consent screen"
   - Choose "External" (for testing)
   - Fill in app name, user support email, developer contact
   - Click "Publish" to move from testing to production

3. **Create OAuth Credentials:**
   - Go to "Credentials"
   - Create new "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     ```
     https://[your-supabase-domain].supabase.co/auth/v1/callback
     http://localhost:5173 (for local development)
     ```

4. **Add to Supabase:**
   - Copy Client ID and Client Secret
   - In Supabase: Authentication → Providers → Google
   - Paste credentials and save

5. **Test Users (while in development):**
   - In Google OAuth consent screen
   - Add test user emails to test authentication before publishing

### Login Flow

1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent
3. After approval, redirected back to app with session
4. `AuthContext` updates with user data
5. App displays authenticated UI

### Auth State Management

```typescript
// useAuth() hook provides:
{
  user: User | null,           // Logged-in user
  isAuthenticated: boolean,    // Auth status
  isLoading: boolean,          // Loading state
  signOut: () => Promise<void> // Logout function
}
```

## API Reference

All API functions are in `client/lib/api.ts`

### Authentication Functions

```typescript
// Sign in with Google
signInWithGoogle(): Promise<User>

// Sign out current user
signOut(): Promise<void>

// Get current authenticated user
getCurrentUser(): Promise<User | null>

// Get current session
getCurrentSession(): Promise<Session | null>

// Subscribe to auth state changes
onAuthStateChange(callback): Unsubscribe
```

### Content CRUD Functions

```typescript
// Get all content for authenticated user
getAllContent(filters?): Promise<ContentItem[]>

// Get all public content (no auth required)
getAllPublicContent(filters?): Promise<ContentItem[]>

// Get single content item
getContent(id: string): Promise<ContentItem>

// Create new content
createContent(data: ContentItem): Promise<ContentItem>

// Update content
updateContent(id: string, data: Partial<ContentItem>): Promise<ContentItem>

// Delete content
deleteContent(id: string): Promise<void>

// Toggle public/private
shareContent(id: string, isPublic: boolean): Promise<ContentItem>
```

### File Operations

```typescript
// Upload file to Supabase Storage
uploadFile(file: File, contentId: string): Promise<string>

// Delete file from storage
deleteFile(fileUrl: string): Promise<void>
```

### Book Functions

```typescript
// Add page to book
addBookPage(bookId: string, content: string): Promise<BookPage>

// Get all pages for a book
getBookPages(bookId: string): Promise<BookPage[]>

// Update book page
updateBookPage(pageId: string, content: string): Promise<BookPage>

// Delete book page
deleteBookPage(pageId: string): Promise<void>
```

## Component Documentation

### Header Component

**File:** `client/components/Header.tsx`

Sticky header visible only to authenticated users.

**Features:**

- Logo and app title
- Dark mode toggle (Moon/Sun icon)
- User profile display
- Settings button (opens SettingsModal)
- Logout button

**Props:** None (uses AuthContext)

```typescript
// Usage in authenticated view
<Header />
```

### ContentCard Component

**File:** `client/components/ContentCard.tsx`

Displays individual content items in grid layout.

**Features:**

- Type badge with color coding
- Public/private indicator
- Content preview (text truncation, image thumbs, video previews)
- Metadata (date, word count, tags, category)
- Action buttons (copy, download, share, edit, delete)

**Props:**

```typescript
{
  item: ContentItem,
  onEdit: (item: ContentItem) => void,
  onDelete: (item: ContentItem) => void,
  onShare: (item: ContentItem) => void,
  isAuthenticated?: boolean
}
```

### SearchBar Component

**File:** `client/components/SearchBar.tsx`

Full-text search across all content.

**Features:**

- Real-time search input
- Cmd+K keyboard shortcut
- Search across title, content, tags, category

**Props:**

```typescript
{
  value: string,
  onChange: (query: string) => void,
  placeholder?: string
}
```

### ContentModal Component

**File:** `client/components/modals/ContentModal.tsx`

Modal for creating and editing content.

**Features:**

- Content type selector (9 types)
- Title input (auto-generated if empty)
- Content field (varies by type - textarea, URL input, file upload)
- Category and tags input
- Public/private toggle
- Word count display
- File drag-and-drop upload

**Props:**

```typescript
{
  open: boolean,
  onOpenChange: (open: boolean) => void,
  initialData?: ContentItem,
  contentType?: ContentType,
  onSave: (data: Partial<ContentItem>) => Promise<void>
}
```

### SettingsModal Component

**File:** `client/components/modals/SettingsModal.tsx`

User settings with 3 tabs.

**Tabs:**

1. **Profile**: Email, name, user ID, dark mode toggle
2. **About**: App description, 9 content types, features, version
3. **Contact**: Email (dupsobon@gmail.com), GitHub link, feedback message

**Props:**

```typescript
{
  open: boolean,
  onOpenChange: (open: boolean) => void
}
```

### FileUpload Component

**File:** `client/components/FileUpload.tsx`

Drag-and-drop file upload with file size validation.

**Features:**

- Click to browse files
- Drag and drop
- File size limit: 100MB
- Display selected file with size
- Remove button

**Props:**

```typescript
{
  onFileSelect: (file: File) => void,
  maxSize?: number (in bytes),
  accept?: string (mime types)
}
```

## Content Types

UZ-log supports 9 different content types:

| Type       | Description          | Features                                                   |
| ---------- | -------------------- | ---------------------------------------------------------- |
| **Text**   | Written content      | Full-text search, word count, category, tags               |
| **Code**   | Source code snippets | Syntax highlighting, copy to clipboard, language detection |
| **Image**  | Visual content       | Thumbnail preview, direct file link, download              |
| **Video**  | Video files          | Embedded player, file upload, streaming                    |
| **File**   | General documents    | File download, size display, type badge                    |
| **Link**   | URL references       | Clickable links, metadata extraction, sharing              |
| **Prompt** | AI prompts           | Template storage, tags, category organization              |
| **Script** | Scripts/commands     | Syntax highlighting, copy functionality                    |
| **Book**   | Multi-page content   | Page management, sequential reading, page count            |

## Routing

### Route Structure

```typescript
// src/App.tsx
{
  path: '/login',           // Google OAuth login page
  path: '/',                // Main app (authenticated & anonymous)
  path: '/share/:id',       // Public content sharing page
  path: '*'                 // 404 Not Found
}
```

### Page Components

**Login.tsx** - Authentication page

- Google OAuth sign-in button
- Feature highlights
- No signup required (read-only public access)

**Index.tsx** - Main application

- Authenticated view: Personal content vault with create/edit/delete
- Anonymous view: Public library (read-only)
- Header only shows for authenticated users
- Search, filter, sort for both views

**Share.tsx** - Public content sharing

- Display single public content item
- No authentication required
- Copy to clipboard, download, video/image display
- 404 if content not found or private

## State Management

### AuthContext

**File:** `client/context/AuthContext.tsx`

Global authentication state.

```typescript
{
  user: User | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  signOut: () => Promise<void>
}
```

### useContent Hook

**File:** `client/hooks/useContent.ts`

Content management state and functions.

```typescript
{
  items: ContentItem[],
  isLoading: boolean,
  error: string | null,
  filters: FilterState,
  setFilters: (filters: FilterState) => void,
  createNewContent: (data: Partial<ContentItem>) => Promise<ContentItem>,
  editContent: (id: string, data: Partial<ContentItem>) => Promise<ContentItem>,
  removeContent: (id: string) => Promise<void>,
  togglePublic: (id: string, isPublic: boolean) => Promise<ContentItem>,
  getCategories: () => string[],
  getTags: () => string[]
}
```

### useTheme Hook

**File:** `client/hooks/useTheme.ts`

Dark mode state management.

```typescript
{
  isDark: boolean,
  toggleTheme: () => void
}
```

## Adding New Features

### Adding a New Content Type

1. **Update Type Definition** (`client/types/content.ts`):

```typescript
export type ContentType =
  | "text"
  | "code"
  // ... existing types
  | "new-type"; // Add here
```

2. **Update ContentModal** (`client/components/modals/ContentModal.tsx`):

```typescript
// Add button to type selector
<Button onClick={() => setContentType('new-type')}>
  New Type
</Button>

// Add input handler in render method
{contentType === 'new-type' && (
  <CustomInput {...props} />
)}
```

3. **Update ContentCard** (`client/components/ContentCard.tsx`):

```typescript
// Add color for badge
const typeColors = {
  // ... existing
  'new-type': 'bg-your-color text-white'
}

// Add preview rendering
{item.type === 'new-type' && (
  <YourPreviewComponent content={item.content} />
)}
```

4. **Update Database** (optional):
   If your type needs custom fields, extend the `content` JSONB field.

### Adding a New Page/Route

1. **Create Page Component:**

```typescript
// client/pages/NewPage.tsx
export default function NewPage() {
  return <div>Your content</div>
}
```

2. **Add Route** (`client/App.tsx`):

```typescript
import NewPage from '@/pages/NewPage'

// In routes array
{ path: '/new-page', element: <NewPage /> }
```

3. **Link from Navigation:**

```typescript
<Link to="/new-page">New Page</Link>
```

### Breaking Down Large Components

If a component file grows large:

1. **Identify logical sections**
   - Search bar section
   - Filter sidebar section
   - Content grid section
   - Modals section

2. **Create sub-components:**

```typescript
// client/components/SearchSection.tsx
export const SearchSection = ({ ... }) => { ... }

// client/components/FilterSidebar.tsx
export const FilterSidebar = ({ ... }) => { ... }
```

3. **Import in main component:**

```typescript
import { SearchSection } from './SearchSection'
import { FilterSidebar } from './FilterSidebar'

// Use in main component
<SearchSection />
<FilterSidebar />
```

## Deployment

### Using Netlify

1. **Connect Repository:**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Select your UZ-log repository
   - Authorize Netlify access

2. **Configure Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist/spa`

3. **Add Environment Variables:**
   - In Netlify Dashboard → Site settings → Build & deploy → Environment
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_GOOGLE_OAUTH_CLIENT_ID`

4. **Update Supabase OAuth:**
   - Add your Netlify domain to Supabase Google OAuth redirect URIs
   - Format: `https://your-site.netlify.app/`

5. **Deploy:**
   - Push code to main branch
   - Netlify automatically builds and deploys

### Using Vercel

1. **Connect Repository:**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your UZ-log repository

2. **Configure Project:**
   - Framework: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Environment Variables:**
   - Add same variables as Netlify

4. **Deploy:**
   - Vercel automatically deploys on push

### Build Locally

```bash
# Build client and server
npm run build

# Start production server
npm run start
```

## Troubleshooting

### "User not authenticated" Error

**Problem:** Content fails to load with auth error.

**Solution:**

- Make sure you're logged in
- Check Supabase credentials in environment variables
- Verify authentication context is wrapping your app
- Check browser console for specific error

### Google OAuth 403 Error

**Problem:** Getting 403 error when clicking sign in.

**Solution:**

1. Ensure Google OAuth app is **published** (not in Testing mode)
2. Add test users if still in testing
3. Verify redirect URIs match exactly
4. Check credentials in Supabase match Google Cloud
5. Clear browser cache and try again

### File Upload Fails

**Problem:** Files won't upload to Supabase Storage.

**Solution:**

1. Verify storage bucket exists and is named `uz-log-files`
2. Check bucket permissions allow authenticated users to upload
3. Verify file is under 100MB
4. Check Supabase storage RLS policies
5. Look at browser console for specific error

### Search/Filter Not Working

**Problem:** Search or filters don't show results.

**Solution:**

1. Ensure content exists and is marked public (for anonymous users)
2. Check that search query matches content
3. Verify filters are correctly applied (check filter state)
4. Clear filters and try again
5. Refresh page to reload content

### Dark Mode Not Persisting

**Problem:** Dark mode preference resets on page refresh.

**Solution:**

- Check if localStorage is enabled in browser
- Verify `useTheme` hook is called in App.tsx
- Check browser DevTools → Application → Local Storage

### Settings Modal Missing

**Problem:** Can't see Settings button after login.

**Solution:**

- Make sure you're authenticated (check Header appears)
- Settings button is in top right of Header (gear icon)
- If Header not visible, you're not logged in - click "Sign In" first
- Refresh page after login

## Contributing

### Code Style

- Use TypeScript for type safety
- Follow existing code formatting (Prettier)
- Keep components focused and small
- Extract reusable logic into hooks
- Add comments for complex logic

### Before Pushing

```bash
# Format code
npm run format.fix

# Type check
npm run typecheck

# Build
npm run build
```

### Component Guidelines

- One component per file (unless very small related utilities)
- Use Radix UI primitives for accessibility
- Prop interface at top of file
- Separate container/presentational logic
- Use TailwindCSS for styling (no inline styles)

### Testing

```bash
# Run tests
npm run test
```

## License

MIT License - feel free to use this project

## Support

For issues, questions, or feedback:

- Email: dupsobon@gmail.com
- GitHub: [Frezanz/UZ-log](https://github.com/Frezanz/UZ-log)

---

**Made with ❤️ for content creators and developers**
