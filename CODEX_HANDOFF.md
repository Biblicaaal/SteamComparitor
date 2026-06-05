# Codex Handoff: SteamComparitor

## Project Goal

SteamComparitor is a first-pass Steam Family comparison prototype. It answers one MVP question:

> If Player A and Player B were in the same Steam Family, what games would each one gain?

This is intentionally not the full product. Do not add wishlist comparison, prices, review scores, co-op filters, recommendations, sale alerts, accounts, database storage, browser extensions, or six-member Steam Family optimization yet.

## Current MVP Flow

1. User opens the local web app.
2. User enters two Steam users:
   - Steam profile URL
   - Steam custom URL
   - SteamID64
3. User clicks `Compare Libraries`.
4. Server resolves custom URLs when needed, fetches both public libraries through Steam Web API `GetOwnedGames`, and returns game data to the frontend.
5. Frontend computes:
   - Player 1 owns
   - Player 2 owns
   - Shared games
   - Unique family library
   - Player 1 gains
   - Player 2 gains
6. Results show four lists:
   - Games both players own
   - Games only Player 1 owns
   - Games only Player 2 owns
   - Combined unique family library

## Important Product Logic

The prototype compares ownership only:

- If Player A owns a game and Player B does not, Player B gains that game.
- If Player B owns a game and Player A does not, Player A gains that game.
- If both own it, it is a duplicate.
- If neither owns it, it is irrelevant.

The app displays this caveat:

> Some games may not be eligible for Steam Family Sharing. This prototype compares ownership only.

Private Steam profiles cannot be compared. The intended clean error is:

> This user's game library is private or unavailable.

## Files

- `public/index.html`: app markup and templates.
- `public/styles.css`: responsive dark UI styling.
- `public/app.js`: client-side form handling, comparison logic, summary cards, and tabbed game lists.
- `server.ps1`: dependency-free PowerShell local server for this Windows workspace.
- `server.js`: dependency-free Node server for environments with Node available.
- `README.md`: quick run instructions.

## Running Locally

PowerShell path:

```powershell
$env:STEAM_API_KEY="your-key-here"
.\server.ps1
```

Node path:

```powershell
$env:STEAM_API_KEY="your-key-here"
npm start
```

Then open:

```text
http://localhost:3000
```

## Known Environment Notes

In the original Codex desktop workspace, the WindowsApps `node.exe` shim was blocked and Python was not installed. The PowerShell server was added so the prototype can run without installing dependencies.

Network access to Steam Web API may require approval in restricted Codex environments.

## Suggested Next Step

Keep the next iteration small: improve successful-library testing with two known public Steam profiles, then polish error messaging and loading states. Preserve the MVP boundary until the basic comparison is reliable.
