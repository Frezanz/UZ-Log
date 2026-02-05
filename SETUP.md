# UZ-log Development Setup Guide

Complete setup instructions, dependencies, environment variables, and configuration details for developing and running the UZ-log application.

## Table of Contents

- [Quick Start](#quick-start)
- [Development Server Details](#development-server-details)
- [Project Configuration](#project-configuration)
- [Dependencies](#dependencies)
- [Environment Variables](#environment-variables)
- [Port Configuration](#port-configuration)
- [Build & Deployment](#build--deployment)
- [Scripts Reference](#scripts-reference)
- [Directory Structure](#directory-structure)
- [Troubleshooting](#troubleshooting)

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/Frezanz/UZ-log.git
cd UZ-log
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Configure Environment Variables

Create or configure these variables in your project/environment:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Google OAuth
VITE_GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 4. Setup Database Schema

```bash
# Download SQL_SCHEMA.sql from project root
# Execute in Supabase SQL Editor:
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Click "New Query"
# 3. Copy contents of SQL_SCHEMA.sql
# 4. Click "Run"
```

### 5. Create Storage Bucket

```
1. Go to Supabase Storage → Buckets
2. Click "Create Bucket"
3. Name: uz-log-files
4. Make public if needed
```

### 6. Start Development Server

```bash
npm run dev
# or
pnpm dev
```

Server will start at `http://localhost:5173`

---

## Development Server Details

### Vite Development Server

**Configuration File:** `vite.config.ts`

#### Server Settings

```typescript
{
  host: "::",           // IPv6 and IPv4 localhost
  port: 8080,           // Development server port (proxied)
  fs: {
    allow: ["./client", "./shared"],
    deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"]
  }
}
```

#### Build Output

- **Client Build:** `dist/spa`
- **Server Build:** `dist/server`
- **Combined Build:** `dist/`

### Express Server Integration

The development server includes an Express middleware layer:

```typescript
// server/index.ts
const app = express();
// - Serves static files
// - Handles API routes
// - Provides middleware for development
```

**Features:**

- Hot Module Replacement (HMR)
- Fast refresh for React components
- TypeScript on-the-fly compilation
- Vite plugin system integration

### Proxy Configuration

**Proxy Port:** 3000 (Builder.io proxy)

The dev server is proxied through Builder.io's development environment:

- Vite dev server: http://localhost:5173 (internal)
- Builder.io proxy: http://localhost:3000 (user-facing)

---

## Project Configuration

### TypeScript Configuration

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "moduleResolution": "bundler",

    // Path aliases
    "paths": {
      "@/*": ["./client/*"],
      "@shared/*": ["./shared/*"]
    },

    // Strict type checking
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["client/**/*", "server/**/*", "shared/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Path Aliases

Use these in imports:

```typescript
// Instead of
import Button from "../../../components/ui/button";

// Use
import Button from "@/components/ui/button";

// For shared code
import { types } from "@shared/types";
```

### Vite Plugins

**Installed:**

1. `@vitejs/plugin-react-swc` - SWC-powered React plugin
2. Express plugin - Custom middleware for development

### Node Version

**Minimum:** Node.js 16+
**Recommended:** Node.js 18+ or 20+

Check your version:

```bash
node --version
npm --version
```

---

## Dependencies

### Runtime Dependencies (Production)

```json
{
  "@supabase/supabase-js": "^2.94.1", // Database & Auth
  "dotenv": "^17.2.1", // Environment variables
  "express": "^5.1.0", // Backend server
  "zod": "^3.25.76" // Schema validation
}
```

### Development Dependencies (Build & Tools)

#### React & TypeScript

- `react`: ^18.3.1
- `react-dom`: ^18.3.1
- `typescript`: ^5.9.2
- `@types/react`: ^18.3.23
- `@types/react-dom`: ^18.3.7

#### Styling & UI

- `tailwindcss`: ^3.4.17
- `@tailwindcss/typography`: ^0.5.16
- `postcss`: ^8.5.6
- `autoprefixer`: ^10.4.21
- `tailwind-merge`: ^2.6.0
- `tailwindcss-animate`: ^1.0.7

#### Component Libraries

- `@radix-ui/*`: Multiple packages (20+ components)
  - `@radix-ui/react-dialog`
  - `@radix-ui/react-tabs`
  - `@radix-ui/react-popover`
  - etc.
- `lucide-react`: ^0.539.0 (Icons)
- `sonner`: ^1.7.4 (Toast notifications)

#### Forms & Validation

- `react-hook-form`: ^7.62.0
- `@hookform/resolvers`: ^5.2.1

#### Routing

- `react-router-dom`: ^6.30.1

#### Data & Utilities

- `date-fns`: ^4.1.0
- `clsx`: ^2.1.1
- `class-variance-authority`: ^0.7.1

#### Build Tools

- `vite`: ^7.1.2
- `@vitejs/plugin-react-swc`: ^4.0.0
- `@swc/core`: ^1.13.3

#### Code Quality

- `prettier`: ^3.6.2
- `vitest`: ^3.2.4
- `tsx`: ^4.20.3

#### Other

- `framer-motion`: ^12.23.12 (Animations)
- `next-themes`: ^0.4.6 (Theme management)
- `@react-three/fiber`: ^8.18.0 (3D graphics - optional)
- `@react-three/drei`: ^9.122.0 (3D utilities - optional)
- `recharts`: ^2.12.7 (Charts - optional)

### Install All Dependencies

```bash
npm install
# or
pnpm install
```

---

## Environment Variables

### Required Variables (Must Configure)

```env
# Supabase API Configuration
# Get from Supabase Dashboard → Settings → API
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google OAuth Client ID
# Get from Supabase Dashboard → Authentication → Providers → Google
VITE_GOOGLE_OAUTH_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### Where to Set Variables

#### Option 1: Builder.io Settings (Recommended)

1. Click [Open Settings](#open-settings)
2. Find "Environment Variables" section
3. Add each variable:
   - Key: `VITE_SUPABASE_URL`
   - Value: `https://your-project.supabase.co`
   - Repeat for other variables
4. Save and restart dev server

#### Option 2: .env.local File (Development Only)

Create file in project root:

```
UZ-log/.env.local
```

Content:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
VITE_GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Important:** Never commit `.env.local` to Git

#### Option 3: DevServerControl Tool

```bash
# Set individual variables
set_env_variable VITE_SUPABASE_URL https://your-project.supabase.co
```

### Retrieving Your Credentials

#### Supabase URL & Anon Key

1. Go to https://supabase.com
2. Sign in to your account
3. Select your UZ-log project
4. Navigate to **Settings** → **API**
5. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

#### Google OAuth Client ID

1. Go to Supabase Dashboard
2. **Authentication** → **Providers** → **Google**
3. If configured, copy the **Client ID**
4. If not configured:
   - Follow the Google OAuth setup guide in README.md
   - Get credentials from Google Cloud Console
   - Add to Supabase

### Variable Usage in Code

All variables prefixed with `VITE_` are accessible in client code:

```typescript
// In client code
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
```

---

## Port Configuration

### Default Ports

| Service          | Port | Use                                |
| ---------------- | ---- | ---------------------------------- |
| Vite Dev Server  | 8080 | Internal development               |
| Builder.io Proxy | 3000 | Public/external access             |
| Express (Node)   | 3000 | Backend server                     |
| Localhost        | 5173 | Direct Vite access (if applicable) |

### Change Vite Dev Server Port

**File:** `vite.config.ts`

```typescript
export default defineConfig({
  server: {
    host: "::",
    port: 8080, // ← Change this
    // ...
  },
});
```

### Update Builder.io Proxy Port

If you change the Vite port, update the proxy:

1. Use DevServerControl: `set_proxy_port 8080`
2. Or manually in Builder.io settings

### Network Access

**During Development (via Builder.io):**

- App available at proxy URL (shown in iframe)
- Direct localhost access not available to user

**Production (After Deployment):**

- App available at deployed domain
- Example: `https://uz-log.netlify.app`

---

## Build & Deployment

### Development Build

```bash
# Start dev server with hot reload
npm run dev

# Output:
# ✓ built in XXXms
# ➜ Local:   http://localhost:5173/
# ➜ press h + enter to show help
```

### Production Build

```bash
# Full build (client + server)
npm run build

# Output:
# dist/
# ├── spa/               # Client code
# ├── server/            # Server code
# └── package.json

# Client-only build
npm run build:client     # Output: dist/spa

# Server-only build
npm run build:server     # Output: dist/server
```

### Start Production Server

```bash
npm run start

# Starts Node.js server with compiled code
# Available at configured domain/port
```

### Build Artifacts

**Client Build (dist/spa/):**

- HTML files
- JavaScript bundles
- CSS files
- Static assets
- Source maps (in dev mode)

**Server Build (dist/server/):**

- Compiled Express server
- API routes
- Middleware

### Deployment to Netlify

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect repository to Netlify
# 3. Configure build settings:
#    - Build command: npm run build
#    - Publish directory: dist/spa
#
# 4. Add environment variables in Netlify:
#    - VITE_SUPABASE_URL
#    - VITE_SUPABASE_ANON_KEY
#    - VITE_GOOGLE_OAUTH_CLIENT_ID
#
# 5. Netlify auto-deploys on push
```

### Deployment to Vercel

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel
# 3. Auto-detects Vite project
# 4. Set environment variables in Vercel dashboard
# 5. Auto-deploys on push
```

---

## Scripts Reference

### Available npm Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Build
npm run build            # Build client + server for production
npm run build:client     # Build only client (React app)
npm run build:server     # Build only server (Express)

# Production
npm run start            # Run production server

# Code Quality
npm run format.fix       # Format all code with Prettier
npm run typecheck        # Run TypeScript type checking

# Testing
npm run test             # Run tests with Vitest
```

### Running Scripts

```bash
# Using npm
npm run dev
npm run build
npm run format.fix

# Using pnpm
pnpm dev
pnpm build
pnpm format.fix

# Using yarn
yarn dev
yarn build
yarn format.fix
```

---

## Directory Structure

### Project Root

```
UZ-log/
├── client/                    # Frontend React application
│   ├── pages/                 # Page components
│   │   ├── Index.tsx          # Main app page
│   │   ├── Login.tsx          # Login page
│   │   └── Share.tsx          # Public share page
│   ├── components/            # Reusable components
│   │   ├── Header.tsx
│   │   ├── SearchBar.tsx
│   │   ├── ContentCard.tsx
│   │   ├── FileUpload.tsx
│   │   ├── modals/            # Modal components
│   │   └── ui/                # Radix UI wrappers
│   ├── context/               # React Context
│   │   └── AuthContext.tsx
│   ├── hooks/                 # Custom hooks
│   │   ├── useContent.ts
│   │   └── useTheme.ts
│   ├── types/                 # TypeScript types
│   │   └── content.ts
│   ├── lib/                   # Utilities & API
│   │   ├── supabase.ts
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── global.css             # Global styles
│   └── App.tsx                # Routes & app setup
│
├── server/                    # Backend Express server
│   ├── index.ts               # Express app setup
│   └── middleware/            # Custom middleware
│
├── shared/                    # Shared code (client + server)
│   └── types.ts               # Shared types
│
├── SQL_SCHEMA.sql             # Database schema
├── vite.config.ts             # Vite configuration
├── vite.config.server.ts      # Server build config
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies & scripts
├── README.md                  # Documentation
├── SETUP.md                   # This file
└── .env.local                 # Environment variables (do not commit)
```

### Key Directories

| Directory       | Purpose                           |
| --------------- | --------------------------------- |
| `client/`       | React frontend code               |
| `server/`       | Express backend server            |
| `shared/`       | Code used by both client & server |
| `dist/`         | Build output (generated)          |
| `node_modules/` | Dependencies (generated)          |

---

## Troubleshooting

### 1. Dev Server Won't Start

**Error:** `Port 8080 is already in use`

```bash
# Solution: Use a different port
# Edit vite.config.ts, change port to 8081
# Then update proxy in Builder.io
```

**Error:** `Cannot find module`

```bash
# Solution: Reinstall dependencies
rm -rf node_modules
npm install
npm run dev
```

### 2. Environment Variables Not Loading

**Problem:** App shows "Supabase not configured"

```bash
# Solution 1: Restart dev server
npm run dev

# Solution 2: Check variables are set correctly
echo $VITE_SUPABASE_URL

# Solution 3: Verify in browser
console.log(import.meta.env.VITE_SUPABASE_URL)
```

### 3. Build Fails

**Error:** `TypeScript errors`

```bash
# Check for type errors
npm run typecheck

# Fix and retry
npm run build
```

**Error:** `Module not found`

```bash
# Reinstall dependencies
npm install
npm run build
```

### 4. Authentication Not Working

**Problem:** Google OAuth 403 error

See Troubleshooting section in [README.md](README.md#troubleshooting)

**Problem:** "User not authenticated" error

```bash
# Solution:
# 1. Make sure environment variables are set
# 2. Restart dev server
# 3. Clear browser cache
# 4. Check Supabase credentials
```

### 5. Styles Not Loading

**Problem:** App looks unstyled

```bash
# Solution: Check Tailwind CSS is compiled
# 1. Verify tailwind.config.js exists
# 2. Check global.css imports Tailwind
# 3. Restart dev server
npm run dev
```

### 6. File Upload Not Working

**Problem:** Files won't upload

```bash
# Solution:
# 1. Check storage bucket exists (uz-log-files)
# 2. Verify Supabase credentials
# 3. Check file is under 100MB
# 4. Look at browser console for errors
```

### 7. Database Connection Failed

**Problem:** "Connection to Supabase failed"

```bash
# Solution:
# 1. Verify VITE_SUPABASE_URL is correct
# 2. Check network connectivity
# 3. Confirm Supabase project is active
# 4. Test with Supabase dashboard
```

### Getting Help

- Check [README.md Troubleshooting](README.md#troubleshooting)
- View browser console for error messages
- Check terminal output for server errors
- Contact: dupsobon@gmail.com
- GitHub: https://github.com/Frezanz/UZ-log

---

## Development Workflow

### 1. Start Development

```bash
npm install
npm run dev
# App available in browser
```

### 2. Make Changes

Edit files in `client/` directory

- Hot reload automatically updates browser
- TypeScript errors shown in terminal

### 3. Format Code

```bash
npm run format.fix
# Prettier formats all files
```

### 4. Type Check

```bash
npm run typecheck
# Verify TypeScript types are correct
```

### 5. Build & Test

```bash
npm run build
npm run test
# Verify everything works
```

### 6. Deploy

```bash
git push origin main
# Netlify/Vercel auto-deploys
```

---

## Package Manager

**Current:** pnpm 10.14.0

**Install pnpm:**

```bash
npm install -g pnpm@10.14.0
```

**Use pnpm instead of npm:**

```bash
pnpm install    # instead of npm install
pnpm dev        # instead of npm run dev
pnpm build      # instead of npm run build
```

**Advantages:**

- Faster installations
- Smaller disk usage
- Better dependency management

---

## Additional Resources

- **Vite Documentation:** https://vitejs.dev
- **React Documentation:** https://react.dev
- **Supabase Documentation:** https://supabase.com/docs
- **TailwindCSS Documentation:** https://tailwindcss.com/docs
- **TypeScript Documentation:** https://www.typescriptlang.org/docs

---

**Last Updated:** 2024
**Version:** 1.0
**Maintainer:** Frezanz/UZ-log
