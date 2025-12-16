# Vercel Deployment Configuration

## Issue
When refreshing routes like `/voice-agents` on Vercel, you get a 404 error because Vercel tries to find a file at that path, but it doesn't exist (it's a client-side route handled by React Router).

## Solution
The `vercel.json` file has been created to configure Vercel to:
1. **Rewrite all routes** to serve `index.html` - This ensures that any route (like `/voice-agents`, `/call-history`, etc.) will serve the React app, allowing React Router to handle the routing client-side.
2. **Cache static assets** - Optimize performance by caching assets with long-term cache headers.

## Configuration Details

### Rewrites
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This tells Vercel: "For any request to any path, serve the `index.html` file." This allows React Router to handle the routing on the client side.

### Headers
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

This sets long-term caching for static assets (JS, CSS, images) to improve performance.

## How It Works

1. User navigates to `https://voice-agent-phi-ten.vercel.app/voice-agents`
2. Vercel receives the request for `/voice-agents`
3. The rewrite rule matches and serves `/index.html`
4. React app loads and React Router sees the `/voice-agents` path
5. React Router renders the `VoiceAgents` component
6. User sees the correct page ✅

## Testing

After deploying with this configuration:
1. Navigate to your Vercel deployment
2. Click on different routes (e.g., `/voice-agents`, `/call-history`)
3. Refresh the page (F5 or Cmd+R)
4. The page should load correctly without 404 errors

## Alternative: Using Vercel CLI

If you prefer to configure this via Vercel Dashboard:
1. Go to your project settings on Vercel
2. Navigate to "Settings" → "Framework Preset"
3. Select "Vite" or "Other"
4. The `vercel.json` file will be automatically used

## Notes

- This configuration works for all SPAs (Single Page Applications)
- API routes (if you have any) should be excluded from the rewrite rule
- The rewrite rule `"source": "/(.*)"` matches all paths, so make sure your API routes are handled separately if needed





