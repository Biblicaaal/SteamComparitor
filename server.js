const http = require("http");
const fs = require("fs");
const path = require("path");

loadDotEnv(path.join(__dirname, ".env"));

const PORT = Number(process.env.PORT || 3000);
const STEAM_API_KEY = process.env.STEAM_API_KEY || "";
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendError(res, status, code, message) {
  sendJson(res, status, { error: { code, message } });
}

function normalizeSteamInput(rawInput) {
  const input = String(rawInput || "").trim();

  if (/^\d{17}$/.test(input)) {
    return { type: "steamid", value: input };
  }

  let url;
  try {
    url = new URL(input.includes("://") ? input : `https://${input}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host !== "steamcommunity.com") {
    return null;
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] === "profiles" && /^\d{17}$/.test(parts[1] || "")) {
    return { type: "steamid", value: parts[1] };
  }

  if (parts[0] === "id" && parts[1]) {
    return { type: "vanity", value: decodeURIComponent(parts[1]) };
  }

  return null;
}

async function callSteamApi(method, params, version = "v0001") {
  const url = new URL(`https://api.steampowered.com/${method}/${version}/`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Steam API returned ${response.status}: ${text.slice(0, 200)}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Steam API returned an invalid JSON response.");
  }
}

async function resolveSteamId(input) {
  const parsed = normalizeSteamInput(input);

  if (!parsed) {
    const error = new Error("Enter a Steam profile URL, custom URL, or SteamID64.");
    error.publicMessage = "Could not resolve this Steam profile. Check the URL or Steam ID and try again.";
    error.code = "invalid_profile";
    error.status = 400;
    throw error;
  }

  if (parsed.type === "steamid") {
    return parsed.value;
  }

  const data = await callSteamApi("ISteamUser/ResolveVanityURL", {
    key: STEAM_API_KEY,
    vanityurl: parsed.value
  });

  if (data?.response?.success !== 1 || !data.response.steamid) {
    const error = new Error(`Could not resolve vanity URL "${parsed.value}".`);
    error.publicMessage = "Could not resolve this Steam profile. Check the URL or Steam ID and try again.";
    error.code = "vanity_unresolved";
    error.status = 404;
    throw error;
  }

  return data.response.steamid;
}

function normalizeGame(game) {
  return {
    appid: game.appid,
    name: game.name || `App ${game.appid}`,
    img_icon_url: game.img_icon_url || "",
    playtime_forever: game.playtime_forever || 0,
    price: null,
    rating: null,
    review_count: null
  };
}

function normalizeProfile(player, steamid) {
  if (!player) {
    return {
      steamid,
      personaname: null,
      avatar: "",
      avatarmedium: "",
      avatarfull: "",
      profileurl: `https://steamcommunity.com/profiles/${steamid}`
    };
  }

  return {
    steamid,
    personaname: player.personaname || null,
    avatar: player.avatar || "",
    avatarmedium: player.avatarmedium || "",
    avatarfull: player.avatarfull || "",
    profileurl: player.profileurl || `https://steamcommunity.com/profiles/${steamid}`
  };
}

async function fetchProfile(steamid) {
  try {
    const data = await callSteamApi("ISteamUser/GetPlayerSummaries", {
      key: STEAM_API_KEY,
      steamids: steamid
    }, "v0002");
    return normalizeProfile(data?.response?.players?.[0], steamid);
  } catch {
    return normalizeProfile(null, steamid);
  }
}

async function fetchLibrary(input) {
  const steamid = await resolveSteamId(input);
  const [data, profile] = await Promise.all([
    callSteamApi("IPlayerService/GetOwnedGames", {
      key: STEAM_API_KEY,
      steamid,
      include_appinfo: 1,
      include_played_free_games: 1
    }),
    fetchProfile(steamid)
  ]);

  const games = data?.response?.games;
  if (!Array.isArray(games)) {
    const error = new Error(`Game library unavailable for ${steamid}.`);
    error.publicMessage = "This profile may be private or its game details are hidden.";
    error.code = "private_library";
    error.status = 403;
    throw error;
  }

  return {
    steamid,
    profile,
    game_count: data.response.game_count || games.length,
    games: games.map(normalizeGame).sort((a, b) => a.name.localeCompare(b.name))
  };
}

async function handleCompare(req, res) {
  if (!STEAM_API_KEY) {
    sendError(res, 500, "missing_api_key", "Missing Steam API key. Set STEAM_API_KEY and restart the app.");
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 4096) {
      req.destroy();
    }
  });

  req.on("end", async () => {
    try {
      const payload = JSON.parse(body || "{}");
      const player1Input = String(payload.player1 || "").trim();
      const player2Input = String(payload.player2 || "").trim();

      if (!player1Input || !player2Input) {
        sendError(res, 400, "missing_input", "Enter both Steam profiles before comparing.");
        return;
      }

      const [player1, player2] = await Promise.all([
        fetchLibrary(player1Input),
        fetchLibrary(player2Input)
      ]);

      sendJson(res, 200, { player1, player2 });
    } catch (error) {
      const message = error.publicMessage || "Steam API error. Try again in a minute.";
      sendError(res, error.status || 502, error.code || "steam_request_failed", message);
    }
  });
}

function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const requestedPath = path.normalize(path.join(PUBLIC_DIR, pathname));

  if (!requestedPath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(requestedPath, (error, contents) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const extension = path.extname(requestedPath);
    res.writeHead(200, { "Content-Type": MIME_TYPES[extension] || "application/octet-stream" });
    res.end(contents);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      steamApiKeyConfigured: Boolean(STEAM_API_KEY)
    });
    return;
  }

  if (req.method === "POST" && req.url === "/api/compare") {
    handleCompare(req, res);
    return;
  }

  if (req.method === "GET") {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`Steam Family Comparison Prototype running on port ${PORT}`);
  console.log(`Steam API key configured: ${STEAM_API_KEY ? "yes" : "no"}`);
});
