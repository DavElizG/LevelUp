# Environment Configuration Setup

## Overview

This document explains how to properly configure environment variables for the LevelUp Gym App. 

**IMPORTANT**: As of the latest update, certain environment variables are **REQUIRED** and the app will not start without them.

## Required Environment Variables

The following variables **MUST** be configured in your `.env` file:

### 1. Supabase Configuration

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

- **VITE_SUPABASE_URL**: Your Supabase project URL
- **VITE_SUPABASE_ANON_KEY**: Your Supabase anonymous/public key

### 2. AI Microservice Configuration

```bash
VITE_AI_SERVICE_URL=https://your-backend-url.com/api/ai
```

- **VITE_AI_SERVICE_URL**: The URL of your deployed AI microservice backend
  - For production: Use your deployed URL (e.g., Render, Railway, etc.)
  - Example: `https://levelup-ai-microservice-main.onrender.com/api/ai`
  - **NO localhost URLs should be used in production**

## Setup Instructions

### 1. Copy the Example File

```bash
cp .env.example .env
```

### 2. Fill in Required Values

Edit the `.env` file and replace all placeholder values with your actual configuration:

```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://tltsnstjzffpwbtujifr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Microservice Configuration (REQUIRED)
VITE_AI_SERVICE_URL=https://levelup-ai-microservice-main.onrender.com/api/ai
```

### 3. Verify Configuration

Run the development server to verify everything is configured correctly:

```bash
pnpm run dev
```

If any required environment variables are missing, the app will throw an error:

```
Error: Missing required environment variable: VITE_AI_SERVICE_URL
```

## Optional Environment Variables

These variables are optional and only needed in specific scenarios:

```bash
# AI Service API Key (if your backend requires authentication)
VITE_AI_SERVICE_API_KEY=your_api_key

# AI Provider Keys (for direct client-side AI calls - NOT RECOMMENDED)
VITE_OPENAI_API_KEY=your_openai_key
VITE_GEMINI_API_KEY=your_gemini_key

# App Configuration
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
```

## Security Best Practices

### ✅ DO:
- Always use environment variables for sensitive configuration
- Use different `.env` files for different environments (dev, staging, prod)
- Keep your `.env` file in `.gitignore`
- Use the `.env.example` template for documentation
- Deploy environment variables through your hosting platform's dashboard

### ❌ DON'T:
- **NEVER** commit `.env` files to version control
- **NEVER** hardcode URLs or API keys in source code
- **NEVER** use `localhost` URLs in production
- **NEVER** expose backend API keys in client-side code

## Troubleshooting

### Error: Missing required environment variable

**Problem**: The app fails to start with an error message about missing environment variables.

**Solution**: 
1. Verify that you have a `.env` file in the project root
2. Ensure all required variables are present and have valid values
3. Restart the development server after making changes

### Backend Connection Failed

**Problem**: The app can't connect to the AI microservice.

**Solution**:
1. Verify `VITE_AI_SERVICE_URL` is set to your deployed backend URL
2. Ensure the backend is deployed and running
3. Check that the URL includes the `/api/ai` path
4. Test the backend URL in your browser or Postman

### Supabase Connection Failed

**Problem**: Database queries fail or authentication doesn't work.

**Solution**:
1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
2. Check that your Supabase project is active
3. Ensure the anon key hasn't been rotated

## Environment Files by Environment

### Development (`.env.development`)
```bash
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_dev_anon_key
VITE_AI_SERVICE_URL=http://localhost:3001/api/ai
VITE_APP_ENV=development
```

### Production (`.env.production`)
```bash
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_prod_anon_key
VITE_AI_SERVICE_URL=https://your-backend.onrender.com/api/ai
VITE_APP_ENV=production
```

## Changes from Previous Version

### What Changed?

**Before**: The app used fallback URLs (like `http://localhost:3001/api`) when environment variables weren't set.

**After**: All critical environment variables are now **required**. The app will fail fast with a clear error message if they're missing.

### Why This Change?

1. **Security**: Prevents accidental deployment with hardcoded URLs
2. **Clarity**: Makes it obvious when configuration is missing
3. **Best Practices**: Forces proper environment configuration
4. **Production Safety**: Eliminates the risk of using localhost in production

## Related Documentation

- [Supabase Setup Instructions](./SETUP_INSTRUCTIONS.md)
- [AI Microservice Documentation](../../levelup-ai-microservice-main/README.md)
- [Deployment Guide](./EXECUTIVE_SUMMARY.md)
