# Steam Family Comparison Prototype

Barebones MVP for one question:

> If Player A and Player B were in the same Steam Family, what games would each one gain?

## Run

Set a Steam Web API key, then start the local server:

```powershell
$env:STEAM_API_KEY="your-key-here"
.\server.ps1
```

Open http://localhost:3000.

Optional Node path:

```powershell
$env:STEAM_API_KEY="your-key-here"
npm start
```

You can paste a Steam profile URL, Steam custom URL, or SteamID64 for each player.

## Caveats

Private Steam profiles cannot be compared. Some games may not be eligible for Steam Family Sharing; this prototype compares ownership only.
