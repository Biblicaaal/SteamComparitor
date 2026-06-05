# Steam Family Comparator

Shareable V0.2 prototype for one question:

> If Player A and Player B were in the same Steam Family, what games would each one gain?

The app compares two public Steam libraries, shows real Steam names and avatars, highlights duplicate games, shows what each player gains, supports search/sorting, and can copy a shareable text summary.

## Public Shareable Version

The Steam Web API key must live on the server, not in the browser. For a public link, deploy this repository as a Node web service and set `STEAM_API_KEY` as a private environment variable in the hosting dashboard.

Recommended shape:

- Runtime: Node 18+
- Build command: `npm install`
- Start command: `npm start`
- Required secret: `STEAM_API_KEY`
- Health check: `/api/health`

This repo includes:

- `server.js`: production-friendly Node server for static files and Steam API proxying.
- `Procfile`: works on Procfile-based hosts.
- `render.yaml`: ready-to-import web service config. Add `STEAM_API_KEY` as a secret value after creating the service.
- `.env.example`: local config template.

Once deployed, share the hosted app URL. Visitors do not need PowerShell, Node, or their own Steam API key.

## Local Run

Create a local `.env` file:

```text
STEAM_API_KEY=your-steam-web-api-key
PORT=3000
```

Then run:

```powershell
npm start
```

Open:

```text
http://localhost:3000
```

## API Key Notes

Do not put your Steam API key in frontend JavaScript, query strings, or committed files. The browser calls `/api/compare`; the server adds the private key when calling Steam.

If `/api/health` returns `"steamApiKeyConfigured": false`, the hosted service is running but the secret is not configured.

## Caveats

Private Steam profiles and hidden game details cannot be compared. Some games may not be eligible for Steam Family Sharing; this prototype compares ownership only.
