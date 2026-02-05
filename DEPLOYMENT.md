# Netlify Deployment Guide for UZ-log

Complete step-by-step guide to deploy the UZ-log application to Netlify production environment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Step-by-Step Deployment](#step-by-step-deployment)
- [Environment Variables Setup](#environment-variables-setup)
- [Update Google OAuth Credentials](#update-google-oauth-credentials)
- [Domain Configuration](#domain-configuration)
- [Post-Deployment Testing](#post-deployment-testing)
- [Troubleshooting](#troubleshooting)
- [CI/CD Pipeline](#cicd-pipeline)
- [Rollback Procedures](#rollback-procedures)

## Prerequisites

- GitHub account with the UZ-log repository
- Netlify account (https://netlify.com)
- Supabase project with configured database
- Google OAuth credentials set up in Supabase
- All code pushed to GitHub main branch

## Pre-Deployment Checklist

Before deploying, ensure the following:

### Code Quality

- [ ] Run `npm run typecheck` - No TypeScript errors
- [ ] Run `npm run format.fix` - Code is formatted
- [ ] Run `npm run build` - Build succeeds locally
- [ ] All changes committed and pushed to GitHub

### Configuration

- [ ] `netlify.toml` exists in project root
- [ ] Environment variables documented in SETUP.md
- [ ] Database schema deployed to Supabase
- [ ] Storage bucket created in Supabase (`uz-log-files`)
- [ ] Google OAuth app is **published** (not in Testing mode)

### Testing

- [ ] Tested locally with `npm run dev`
- [ ] Authenticated flow works (Google OAuth)
- [ ] File upload works
- [ ] Public content library loads
- [ ] Search and filters work
- [ ] Dark mode toggles correctly

### Security

- [ ] `.env.local` is in `.gitignore` (not committed)
- [ ] No secrets in code or comments
- [ ] Supabase RLS policies configured
- [ ] CORS settings correct for your domain

---

## Step-by-Step Deployment

### 1. Connect Repository to Netlify

**Step 1: Go to Netlify Dashboard**

```
https://app.netlify.com
```

**Step 2: Create New Site**

- Click "Add new site"
- Select "Import an existing project"
- Choose "GitHub"

**Step 3: Authorize Netlify**

- Click "Authorize Netlify"
- Log in to GitHub
- Select your GitHub account
- Grant Netlify access to repositories

**Step 4: Select Repository**

- Search for "UZ-log" or your repository name
- Click to select it
- Click "Install" if prompted

**Step 5: Configure Build Settings**

Netlify should auto-detect settings, but verify:

| Setting           | Value           |
| ----------------- | --------------- |
| Base directory    | (leave empty)   |
| Build command     | `npm run build` |
| Publish directory | `dist/spa`      |
| Node version      | 20 (or higher)  |

If not auto-detected:

1. Click "Show advanced"
2. Set Build command: `npm run build`
3. Set Publish directory: `dist/spa`

**Step 6: Review**

- Verify all settings are correct
- Click "Deploy site"
- Netlify starts building automatically

---

### 2. Monitor First Build

Once you click "Deploy site":

**Check Build Progress:**

1. Netlify automatically starts building
2. Go to **Deploys** tab
3. Watch the build log in real-time
4. Build typically takes 2-5 minutes

**Build Log shows:**

```
Installing dependencies...
Building client...
Building server...
Optimizing...
Deploy complete!
```

**If Build Fails:**

- Click on failed deploy
- Read error message in build log
- Common issues:
  - Missing Node version
  - Build script error
  - Type errors (run `npm run typecheck`)
  - Missing dependencies (run `npm install`)

---

## Environment Variables Setup

### Critical: Set Environment Variables

Your app won't work without these variables. They must be added to Netlify.

**Step 1: Go to Site Settings**

1. In Netlify dashboard, select your site
2. Click **Site settings**
3. Go to **Build & deploy**
4. Click **Environment**

**Step 2: Add Environment Variables**

Click "Add" or "Edit variables" for each:

```
Variable Name: VITE_SUPABASE_URL
Value: https://your-project.supabase.co
```

```
Variable Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your full anon key)
```

```
Variable Name: VITE_GOOGLE_OAUTH_CLIENT_ID
Value: 123456789-abcdefghijklmnop.apps.googleusercontent.com
```

**Step 3: Trigger Rebuild**

After adding variables:

1. Go to **Deploys** tab
2. Click **Trigger deploy**
3. Select **Deploy site** (no cache clearing needed)
4. Monitor build log

### Getting Your Credentials

**Supabase URL & Anon Key:**

1. Go to Supabase Dashboard
2. Select your project
3. **Settings** → **API**
4. Copy **Project URL** and **anon public**

**Google OAuth Client ID:**

1. In Supabase: **Authentication** → **Providers** → **Google**
2. Copy the **Client ID** shown
3. If not configured, see section below

---

## Update Google OAuth Credentials

Your Google OAuth app's redirect URIs must include your Netlify domain.

### Get Your Netlify Domain

After first deployment, Netlify assigns a domain:

```
https://your-site-name.netlify.app
```

You can also use a custom domain (see Domain Configuration section).

### Update Supabase OAuth Settings

1. **Go to Supabase Dashboard**
   - Select your UZ-log project

2. **Navigate to Authentication**
   - Click **Authentication** → **Providers** → **Google**

3. **Add Redirect URI**
   - Look for "Authorized redirect URIs" in your Google OAuth config
   - Add: `https://your-site-name.netlify.app/`
   - Format: `https://domain.com/` (with trailing slash)

4. **For Custom Domain**
   - Add: `https://yourdomain.com/`

5. **Save Changes**

### Complete List of Redirect URIs Needed

```
https://your-site-name.netlify.app/
https://yourdomain.com/           (if using custom domain)
http://localhost:5173             (for local development)
https://[your-supabase-domain].supabase.co/auth/v1/callback
```

---

## Domain Configuration

### Option 1: Use Netlify Default Domain

Your site is automatically available at:

```
https://your-site-name.netlify.app
```

This works immediately after deployment. Update Google OAuth as shown above.

### Option 2: Connect Custom Domain

**Steps:**

1. **Go to Site Settings**
   - Select site in Netlify
   - **Site settings** → **Domain management**

2. **Add Custom Domain**
   - Click "Add domain"
   - Enter your domain (e.g., uz-log.com)
   - Click "Verify"

3. **Update DNS Records**
   - Netlify provides DNS settings
   - Update your domain registrar's DNS to point to Netlify
   - Instructions specific to your registrar

4. **Wait for DNS Propagation**
   - Can take 24-48 hours
   - Check status in Netlify dashboard

5. **Enable HTTPS**
   - Netlify auto-provisions SSL certificate
   - Usually takes a few minutes
   - Status shown in Domain management

6. **Update OAuth Redirect URIs**
   - Add your custom domain to Google OAuth settings
   - Format: `https://yourdomain.com/`

---

## Post-Deployment Testing

### Test All Features

**Public Access (without login):**

1. Visit your deployed site
2. View public library
3. Try search and filters
4. Click on a public item to view

**Authentication:**

1. Click "Sign In"
2. Log in with Google
3. Verify you see authenticated UI
4. Check that Settings button appears

**Content Creation:**

1. Click "New Content"
2. Create a test item
3. Verify it appears in list
4. Toggle public/private
5. Test sharing

**File Upload:**

1. Create new content with file
2. Upload an image or file
3. Verify file appears in storage
4. Download/view file

**Search & Filtering:**

1. Create multiple test items with different categories
2. Test search by title
3. Test filter by category/tags
4. Test sort options
5. Clear filters

**Dark Mode:**

1. Toggle dark mode
2. Refresh page
3. Verify preference persists
4. Test in both modes

### Check Performance

1. **Lighthouse Audit:**
   - Right-click → Inspect
   - Go to Lighthouse tab
   - Run audit
   - Check Performance score

2. **Build Time:**
   - Should be < 5 minutes
   - Watch in Deploy log

3. **Site Performance:**
   - Click on site
   - Go to **Analytics** tab (if enabled)
   - Check page loads

### Monitor Logs

**Netlify Logs:**

1. Go to site dashboard
2. **Netlify Logs** → View logs
3. Check for any errors

**Browser Console:**

1. Open deployed site
2. Right-click → Developer Tools
3. **Console** tab
4. Check for JavaScript errors

---

## Troubleshooting

### Build Fails with "Command not found"

**Problem:** `npm: command not found`

**Solution:**

1. Set Node version explicitly
2. Go to **Build & deploy** → **Environment**
3. Add variable: `NODE_VERSION = 20`
4. Trigger rebuild

### "Cannot find module" Error

**Problem:** Dependencies not installing

**Solution:**

```
1. Commit package-lock.json to Git
2. Verify npm install works locally
3. Clear Netlify cache:
   - Deploys → Trigger deploy → Clear cache and rebuild
4. Trigger rebuild
```

### Environment Variables Not Loaded

**Problem:** App shows "Supabase not configured"

**Solution:**

1. Verify variables added to Netlify dashboard
2. Check spelling (case-sensitive)
3. Confirm "Save" was clicked
4. Clear build cache:
   - **Deploys** → **Trigger deploy** → **Clear cache and rebuild**
5. Trigger new deploy

### Google OAuth 403 Error

**Problem:** Getting 403 after login

**Solution:**

1. Verify Google OAuth app is **published**
2. Check redirect URIs include your Netlify domain
3. Format: `https://your-site.netlify.app/`
4. Wait a few minutes for Google to sync changes
5. Clear browser cache and try again

### Blank Page After Deploy

**Problem:** Site loads but shows nothing

**Solutions:**

1. Check browser console for errors (F12)
2. Verify build command created `dist/spa/index.html`
3. Check `netlify.toml` publish directory is correct
4. Look at deploy log for TypeScript/build errors

### File Upload Returns 404

**Problem:** File upload fails or 404

**Solution:**

1. Verify Supabase storage bucket exists
2. Check bucket is named `uz-log-files`
3. Verify bucket allows authenticated uploads
4. Check Supabase RLS policies
5. Look at browser console for specific error

### Infinite Redirect Loop

**Problem:** Getting redirected continuously

**Solution:**

1. Check `netlify.toml` redirect rules
2. Verify React Router redirects aren't conflicting
3. Clear browser cache
4. Try incognito/private window

---

## CI/CD Pipeline

### Automatic Deployments

Netlify automatically deploys when you push to GitHub:

**Deployment Triggers:**

1. **Push to main branch** → Builds and deploys automatically
2. **Pull requests** → Netlify creates preview deployment
3. **Rollback to previous** → Manual action in dashboard

### Continuous Integration

Netlify runs your build command on every push:

```
npm run build
```

This verifies:

- No TypeScript errors
- All dependencies available
- Build succeeds
- Output files created

### Preview Deployments

For every pull request, Netlify creates a preview:

**Pull Request Preview:**

1. Push code to a branch
2. Create pull request on GitHub
3. Netlify automatically builds preview
4. Link appears in PR checks
5. Share preview link with reviewers

### Rollback to Previous Deploy

If current deploy has issues:

1. Go to **Deploys** tab
2. Find previous successful deploy
3. Click on it
4. Click **Publish deploy**
5. Site reverts to that version (takes ~1 minute)

---

## Maintenance & Monitoring

### Regular Checks

**Weekly:**

- Monitor **Analytics** dashboard
- Check error logs
- Review Netlify notifications

**Monthly:**

- Update dependencies: `npm update`
- Run `npm audit` for security vulnerabilities
- Test all features in production
- Check Supabase usage/quotas

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Update specific package
npm update package-name

# Commit and push
git add package.json package-lock.json
git commit -m "chore: update dependencies"
git push origin main

# Netlify auto-deploys after push
```

### Monitor Supabase Usage

1. Go to Supabase Dashboard
2. Check **Project Settings** → **Usage**
3. Monitor:
   - Database storage
   - API calls
   - File storage usage
   - Bandwidth

---

## Deployment Comparison

| Feature              | Netlify         | Vercel              |
| -------------------- | --------------- | ------------------- |
| GitHub Integration   | Excellent       | Excellent           |
| Deploy Speed         | Fast (2-5 min)  | Very Fast (1-3 min) |
| Free Tier            | Good            | Good                |
| Custom Domain        | Yes             | Yes                 |
| Preview Deploys      | Yes             | Yes                 |
| Environment Vars     | Yes             | Yes                 |
| Serverless Functions | Yes (Functions) | Yes (API Routes)    |
| Auto HTTPS           | Yes             | Yes                 |
| Analytics            | Yes             | Yes (Pro)           |
| Cost                 | Affordable      | Affordable          |

---

## Common Deployment Questions

### Q: How do I deploy changes?

**A:** Push code to main branch on GitHub. Netlify automatically builds and deploys.

### Q: How long does deployment take?

**A:** Typically 2-5 minutes from push to live.

### Q: Can I use a custom domain?

**A:** Yes! Add domain in Site settings → Domain management.

### Q: What happens if the build fails?

**A:** Failed deploys don't go live. Previous version stays online. Check build log for errors.

### Q: How do I see deployment history?

**A:** Go to **Deploys** tab. Shows all builds with status, time, and logs.

### Q: Can I schedule deployments?

**A:** Not directly, but you can use GitHub Actions or manually trigger via Netlify API.

### Q: How do I update environment variables?

**A:** Site settings → Build & deploy → Environment. Changes apply to next build.

---

## Support & Resources

- **Netlify Docs:** https://docs.netlify.com
- **Netlify Support:** https://support.netlify.com
- **UZ-log README:** README.md
- **Setup Guide:** SETUP.md
- **Contact:** dupsobon@gmail.com

---

## Deployment Checklist (Final)

Before hitting "Deploy site":

- [ ] Code pushed to GitHub main
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] Local build works (`npm run build`)
- [ ] `netlify.toml` in project root
- [ ] GitHub repository connected to Netlify
- [ ] Build command set to `npm run build`
- [ ] Publish directory set to `dist/spa`
- [ ] Node version set to 20
- [ ] Environment variables ready to add
- [ ] Supabase project active and configured
- [ ] Storage bucket created (`uz-log-files`)
- [ ] Google OAuth app published
- [ ] All features tested locally

**After Deployment:**

- [ ] First build succeeds
- [ ] Site loads without errors
- [ ] Google OAuth works
- [ ] Public library displays content
- [ ] File upload works
- [ ] Dark mode persists
- [ ] Search and filters work
- [ ] Settings modal visible when logged in

---

**Deployment Status:** Ready for Netlify
**Last Updated:** 2024
**Version:** 1.0
