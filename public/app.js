const form = document.querySelector("#compare-form");
const languageSelect = document.querySelector("#language-select");
const compareButton = document.querySelector("#compare-button");
const statusEl = document.querySelector("#status");
const resultsEl = document.querySelector("#results");
const playerProfilesEl = document.querySelector("#player-profiles");
const winnerCardEl = document.querySelector("#winner-card");
const summaryEl = document.querySelector("#summary");
const listPanel = document.querySelector("#list-panel");
const shareButton = document.querySelector("#share-summary");
const shareStatusEl = document.querySelector("#share-status");
const cardTemplate = document.querySelector("#summary-card-template");
const rowTemplate = document.querySelector("#game-row-template");
const tabs = Array.from(document.querySelectorAll(".tab"));

const translations = {
  en: {
    appEyebrow: "Steam Family Comparison Prototype",
    appTitle: "See what each player would gain.",
    languageLabel: "Language",
    notice: "Some games may not be eligible for Steam Family Sharing. This prototype compares ownership only.",
    compareTitle: "Compare Libraries",
    player1Input: "Player 1 Steam Profile",
    player2Input: "Player 2 Steam Profile",
    profilePlaceholder: "Steam profile URL, custom URL, or SteamID64",
    compareButton: "Compare Libraries",
    shareButton: "Share Summary",
    tabDuplicates: "Duplicates",
    tabPlayer1Gains: "Player 1 gains",
    tabPlayer2Gains: "Player 2 gains",
    tabFullFamily: "Full Family Library",
    player1: "Player 1",
    player2: "Player 2",
    resolvingPlayer1: "Resolving Player 1 profile...",
    resolvingPlayer2: "Resolving Player 2 profile...",
    fetchingPlayer1: "Fetching Player 1 library...",
    fetchingPlayer2: "Fetching Player 2 library...",
    comparingLibraries: "Comparing libraries...",
    buildingResults: "Building results...",
    noPlaytime: "No Steam playtime",
    minPlayed: "{count} min played",
    hoursPlayed: "{count} hr played",
    unavailable: "{label}: unavailable",
    price: "Price",
    reviews: "Reviews",
    viewProfile: "View Steam profile",
    ownedGames: "{count} owned games",
    winnerEyebrow: "Family Value Winner",
    similarGames: "Both players gain a similar amount from this Steam Family.",
    gainsMore: "{name} gains more games from this Steam Family.",
    moneyUnavailable: "Monetary value is unavailable for this prototype version.",
    similarValue: "Both players contribute similar monetary value.",
    contributesExpensive: "{name} contributes more expensive games.",
    contributedGames: "{name}: {count} games contributed ({percent}%)",
    owns: "{name} owns",
    duplicateGames: "Duplicate games",
    fullFamilyLibrary: "Full family library",
    gains: "{name} gains",
    listDuplicatesTitle: "Duplicates",
    listDuplicatesSubtitle: "Games both players already own.",
    listGainsTitle: "{name} gains",
    listOnlyOwnsSubtitle: "Games only {name} owns today.",
    listFamilyTitle: "Full Family Library",
    listFamilySubtitle: "The full unique shared pool from both libraries.",
    countOfGames: "{visible} of {total} games",
    searchGames: "Search games",
    searchPlaceholder: "Type a game name",
    sortBy: "Sort by",
    sortNameAsc: "Name A-Z",
    sortNameDesc: "Name Z-A",
    sortPriceAsc: "Price ascending",
    sortPriceDesc: "Price descending",
    sortRatingDesc: "Reviews/rating descending",
    sortRatingAsc: "Reviews/rating ascending",
    sortPlaytimeDesc: "Most played",
    sortPlaytimeAsc: "Least played",
    noSearchMatches: "No games match this search.",
    noGamesInList: "No games in this list.",
    missingApiKey: "Missing Steam API key. Set STEAM_API_KEY and restart the app.",
    invalidProfile: "Could not resolve this Steam profile. Check the URL or Steam ID and try again.",
    privateLibrary: "This profile may be private or its game details are hidden.",
    emptyLibrary: "This user owns 0 visible games. Their library may be empty, private, or hidden.",
    steamRequestFailed: "Steam did not respond successfully. Try again in a minute.",
    steamFallbackError: "Steam API error. Try again in a minute.",
    zeroVisibleWarning: "One user owns 0 visible games. Results may be limited.",
    shareCopied: "Summary copied to clipboard.",
    shareTitle: "Steam Family comparison summary",
    summaryOwned: "{name}: {count} owned games",
    sharedDuplicates: "Shared duplicate games: {count}",
    summaryFullLibrary: "Full family library: {count} unique games",
    summaryGains: "{name} gains: {count} games"
  },
  es: {
    appEyebrow: "Prototipo de Comparador de Familias de Steam",
    appTitle: "Mira qué ganaría cada jugador.",
    languageLabel: "Idioma",
    notice: "Es posible que algunos juegos no sean compatibles con Steam Family Sharing. Este prototipo solo compara propiedad.",
    compareTitle: "Comparar bibliotecas",
    player1Input: "Perfil de Steam del jugador 1",
    player2Input: "Perfil de Steam del jugador 2",
    profilePlaceholder: "URL de perfil de Steam, URL personalizada o SteamID64",
    compareButton: "Comparar bibliotecas",
    shareButton: "Compartir resumen",
    tabDuplicates: "Duplicados",
    tabPlayer1Gains: "Jugador 1 gana",
    tabPlayer2Gains: "Jugador 2 gana",
    tabFullFamily: "Biblioteca familiar completa",
    player1: "Jugador 1",
    player2: "Jugador 2",
    resolvingPlayer1: "Resolviendo perfil del jugador 1...",
    resolvingPlayer2: "Resolviendo perfil del jugador 2...",
    fetchingPlayer1: "Obteniendo biblioteca del jugador 1...",
    fetchingPlayer2: "Obteniendo biblioteca del jugador 2...",
    comparingLibraries: "Comparando bibliotecas...",
    buildingResults: "Armando resultados...",
    noPlaytime: "Sin tiempo de juego en Steam",
    minPlayed: "{count} min jugados",
    hoursPlayed: "{count} h jugadas",
    unavailable: "{label}: no disponible",
    price: "Precio",
    reviews: "Reseñas",
    viewProfile: "Ver perfil de Steam",
    ownedGames: "{count} juegos propios",
    winnerEyebrow: "Ganador de valor familiar",
    similarGames: "Ambos jugadores ganan una cantidad similar con esta Familia de Steam.",
    gainsMore: "{name} gana más juegos con esta Familia de Steam.",
    moneyUnavailable: "El valor monetario no está disponible en esta versión del prototipo.",
    similarValue: "Ambos jugadores aportan un valor monetario similar.",
    contributesExpensive: "{name} aporta juegos más caros.",
    contributedGames: "{name}: {count} juegos aportados ({percent}%)",
    owns: "{name} tiene",
    duplicateGames: "Juegos duplicados",
    fullFamilyLibrary: "Biblioteca familiar completa",
    gains: "{name} gana",
    listDuplicatesTitle: "Duplicados",
    listDuplicatesSubtitle: "Juegos que ambos jugadores ya tienen.",
    listGainsTitle: "{name} gana",
    listOnlyOwnsSubtitle: "Juegos que hoy solo tiene {name}.",
    listFamilyTitle: "Biblioteca familiar completa",
    listFamilySubtitle: "La biblioteca única combinada de ambos jugadores.",
    countOfGames: "{visible} de {total} juegos",
    searchGames: "Buscar juegos",
    searchPlaceholder: "Escribe el nombre de un juego",
    sortBy: "Ordenar por",
    sortNameAsc: "Nombre A-Z",
    sortNameDesc: "Nombre Z-A",
    sortPriceAsc: "Precio ascendente",
    sortPriceDesc: "Precio descendente",
    sortRatingDesc: "Reseñas/valoración descendente",
    sortRatingAsc: "Reseñas/valoración ascendente",
    sortPlaytimeDesc: "Más jugados",
    sortPlaytimeAsc: "Menos jugados",
    noSearchMatches: "No hay juegos que coincidan con esta búsqueda.",
    noGamesInList: "No hay juegos en esta lista.",
    missingApiKey: "Falta la clave de Steam API. Define STEAM_API_KEY y reinicia la app.",
    invalidProfile: "No se pudo resolver este perfil de Steam. Revisa la URL o Steam ID e inténtalo de nuevo.",
    privateLibrary: "Este perfil puede ser privado o tener los detalles de juegos ocultos.",
    emptyLibrary: "Este usuario tiene 0 juegos visibles. Su biblioteca puede estar vacía, privada u oculta.",
    steamRequestFailed: "Steam no respondió correctamente. Inténtalo de nuevo en un minuto.",
    steamFallbackError: "Error de Steam API. Inténtalo de nuevo en un minuto.",
    zeroVisibleWarning: "Un usuario tiene 0 juegos visibles. Los resultados pueden ser limitados.",
    shareCopied: "Resumen copiado al portapapeles.",
    shareTitle: "Resumen de comparación de Familia de Steam",
    summaryOwned: "{name}: {count} juegos propios",
    sharedDuplicates: "Juegos duplicados compartidos: {count}",
    summaryFullLibrary: "Biblioteca familiar completa: {count} juegos únicos",
    summaryGains: "{name} gana: {count} juegos"
  }
};

const progressStepKeys = [
  "resolvingPlayer1",
  "resolvingPlayer2",
  "fetchingPlayer1",
  "fetchingPlayer2",
  "comparingLibraries",
  "buildingResults"
];

const sortOptions = [
  ["name-asc", "sortNameAsc"],
  ["name-desc", "sortNameDesc"],
  ["price-asc", "sortPriceAsc"],
  ["price-desc", "sortPriceDesc"],
  ["rating-desc", "sortRatingDesc"],
  ["rating-asc", "sortRatingAsc"],
  ["playtime-desc", "sortPlaytimeDesc"],
  ["playtime-asc", "sortPlaytimeAsc"]
];

let currentComparison = null;
let activeList = "both";
let activeSearch = "";
let activeSort = "name-asc";
let progressTimer = null;
let currentLanguage = localStorage.getItem("steamComparatorLanguage") || "en";

function t(key, values = {}) {
  const template = translations[currentLanguage]?.[key] || translations.en[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  if (languageSelect) {
    languageSelect.value = currentLanguage;
  }
  if (currentComparison) {
    renderAllResults(currentComparison);
  } else {
    updateTabLabels();
  }
}

function setStatus(message, type = "info") {
  statusEl.textContent = message;
  statusEl.classList.remove("hidden", "error");
  if (type === "error") {
    statusEl.classList.add("error");
  }
}

function clearStatus() {
  statusEl.textContent = "";
  statusEl.classList.add("hidden");
  statusEl.classList.remove("error");
}

function startProgress() {
  let index = 0;
  setStatus(t(progressStepKeys[index]));
  progressTimer = window.setInterval(() => {
    index = Math.min(index + 1, progressStepKeys.length - 1);
    setStatus(t(progressStepKeys[index]));
    if (index === progressStepKeys.length - 1) {
      window.clearInterval(progressTimer);
    }
  }, 800);
}

function stopProgress() {
  if (progressTimer) {
    window.clearInterval(progressTimer);
    progressTimer = null;
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat(currentLanguage).format(value || 0);
}

function formatMinutes(minutes) {
  if (!minutes) {
    return t("noPlaytime");
  }
  const hours = minutes / 60;
  if (hours < 1) {
    return t("minPlayed", { count: formatNumber(minutes) });
  }
  return t("hoursPlayed", { count: formatNumber(Math.round(hours)) });
}

function formatUnavailable(label) {
  return t("unavailable", { label });
}

function iconUrl(game) {
  if (!game.img_icon_url) {
    return "";
  }
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`;
}

function playerName(player, fallback) {
  return player?.profile?.personaname || player?.personaName || fallback;
}

function profileUrl(player) {
  return player?.profile?.profileurl || `https://steamcommunity.com/profiles/${player.steamid}`;
}

function avatarUrl(player) {
  return player?.profile?.avatarfull || player?.profile?.avatarmedium || player?.profile?.avatar || "";
}

function totalGames(player) {
  return player?.game_count ?? player?.games?.length ?? 0;
}

function compareLibraries(player1, player2) {
  const p1Games = new Map(player1.games.map((game) => [game.appid, game]));
  const p2Games = new Map(player2.games.map((game) => [game.appid, game]));
  const combinedIds = new Set([...p1Games.keys(), ...p2Games.keys()]);

  const both = [];
  const only1 = [];
  const only2 = [];
  const combined = [];

  for (const appid of combinedIds) {
    const p1Game = p1Games.get(appid);
    const p2Game = p2Games.get(appid);
    const game = p1Game || p2Game;

    combined.push(game);
    if (p1Game && p2Game) {
      both.push(game);
    } else if (p1Game) {
      only1.push(game);
    } else {
      only2.push(game);
    }
  }

  return {
    player1,
    player2,
    both,
    only1,
    only2,
    combined
  };
}

function renderPlayerProfiles(comparison) {
  const players = [
    [comparison.player1, t("player1")],
    [comparison.player2, t("player2")]
  ];

  playerProfilesEl.innerHTML = "";
  for (const [player, fallback] of players) {
    const article = document.createElement("article");
    article.className = "player-card";

    const avatar = document.createElement("div");
    avatar.className = "player-avatar";
    const imageSource = avatarUrl(player);
    if (imageSource) {
      const img = document.createElement("img");
      img.src = imageSource;
      img.alt = "";
      avatar.append(img);
    } else {
      avatar.textContent = fallback.slice(-1);
    }

    const body = document.createElement("div");
    const name = document.createElement("h3");
    name.textContent = playerName(player, fallback);
    const link = document.createElement("a");
    link.href = profileUrl(player);
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = t("viewProfile");
    const count = document.createElement("p");
    count.textContent = t("ownedGames", { count: formatNumber(totalGames(player)) });
    body.append(name, link, count);
    article.append(avatar, body);
    playerProfilesEl.append(article);
  }
}

function contributionTone(percent) {
  if (percent < 35) {
    return "low";
  }
  if (percent > 65) {
    return "high";
  }
  return "even";
}

function gameValueTotal(games) {
  let known = 0;
  let total = 0;
  for (const game of games) {
    if (typeof game.price === "number") {
      known += 1;
      total += game.price;
    }
  }
  return { known, total };
}

function winnerConclusion(comparison) {
  const p1Name = playerName(comparison.player1, t("player1"));
  const p2Name = playerName(comparison.player2, t("player2"));
  const p1Gains = comparison.only2.length;
  const p2Gains = comparison.only1.length;
  const totalGain = p1Gains + p2Gains;
  const difference = Math.abs(p1Gains - p2Gains);
  const similarThreshold = Math.max(3, Math.round(totalGain * 0.1));

  let gamesConclusion = t("similarGames");
  if (difference > similarThreshold) {
    gamesConclusion = p1Gains > p2Gains
      ? t("gainsMore", { name: p1Name })
      : t("gainsMore", { name: p2Name });
  }

  const p1Contribution = comparison.only1.length;
  const p2Contribution = comparison.only2.length;
  const contributionTotal = p1Contribution + p2Contribution;
  const p1Percent = contributionTotal ? Math.round((p1Contribution / contributionTotal) * 100) : 50;
  const p2Percent = 100 - p1Percent;

  const p1Value = gameValueTotal(comparison.only1);
  const p2Value = gameValueTotal(comparison.only2);
  let valueConclusion = t("moneyUnavailable");
  if (p1Value.known || p2Value.known) {
    const valueDiff = Math.abs(p1Value.total - p2Value.total);
    const valueThreshold = Math.max(5, (p1Value.total + p2Value.total) * 0.1);
    if (valueDiff <= valueThreshold) {
      valueConclusion = t("similarValue");
    } else {
      valueConclusion = p1Value.total > p2Value.total
        ? t("contributesExpensive", { name: p1Name })
        : t("contributesExpensive", { name: p2Name });
    }
  }

  return {
    gamesConclusion,
    valueConclusion,
    p1Contribution,
    p2Contribution,
    p1Percent,
    p2Percent,
    p1Name,
    p2Name
  };
}

function renderWinner(comparison) {
  const winner = winnerConclusion(comparison);
  winnerCardEl.innerHTML = "";

  const heading = document.createElement("div");
  heading.className = "winner-heading";
  const textWrap = document.createElement("div");
  const title = document.createElement("p");
  title.className = "eyebrow";
  title.textContent = t("winnerEyebrow");
  const main = document.createElement("h2");
  main.textContent = winner.gamesConclusion;
  const value = document.createElement("p");
  value.textContent = winner.valueConclusion;
  textWrap.append(title, main, value);
  heading.append(textWrap);

  const bar = document.createElement("div");
  bar.className = "contribution-bar";
  const p1Segment = document.createElement("span");
  p1Segment.className = `contribution-segment ${contributionTone(winner.p1Percent)}`;
  p1Segment.style.width = `${Math.max(winner.p1Percent, 2)}%`;
  const p2Segment = document.createElement("span");
  p2Segment.className = `contribution-segment ${contributionTone(winner.p2Percent)}`;
  p2Segment.style.width = `${Math.max(winner.p2Percent, 2)}%`;
  bar.append(p1Segment, p2Segment);

  const labels = document.createElement("div");
  labels.className = "contribution-labels";
  const p1Label = document.createElement("span");
  p1Label.textContent = t("contributedGames", {
    name: winner.p1Name,
    count: formatNumber(winner.p1Contribution),
    percent: winner.p1Percent
  });
  const p2Label = document.createElement("span");
  p2Label.textContent = t("contributedGames", {
    name: winner.p2Name,
    count: formatNumber(winner.p2Contribution),
    percent: winner.p2Percent
  });
  labels.append(p1Label, p2Label);

  winnerCardEl.append(heading, bar, labels);
}

function renderSummary(comparison) {
  const p1Name = playerName(comparison.player1, t("player1"));
  const p2Name = playerName(comparison.player2, t("player2"));
  const cards = [
    [t("owns", { name: p1Name }), totalGames(comparison.player1)],
    [t("owns", { name: p2Name }), totalGames(comparison.player2)],
    [t("duplicateGames"), comparison.both.length],
    [t("fullFamilyLibrary"), comparison.combined.length],
    [t("gains", { name: p1Name }), comparison.only2.length],
    [t("gains", { name: p2Name }), comparison.only1.length]
  ];

  summaryEl.innerHTML = "";
  for (const [label, value] of cards) {
    const card = cardTemplate.content.cloneNode(true);
    card.querySelector("p").textContent = label;
    card.querySelector("strong").textContent = formatNumber(value);
    summaryEl.append(card);
  }
}

function listMetadata(key, comparison) {
  const p1Name = playerName(comparison.player1, t("player1"));
  const p2Name = playerName(comparison.player2, t("player2"));
  const metadata = {
    both: {
      title: t("listDuplicatesTitle"),
      subtitle: t("listDuplicatesSubtitle"),
      games: comparison.both
    },
    only1: {
      title: t("listGainsTitle", { name: p2Name }),
      subtitle: t("listOnlyOwnsSubtitle", { name: p1Name }),
      games: comparison.only1
    },
    only2: {
      title: t("listGainsTitle", { name: p1Name }),
      subtitle: t("listOnlyOwnsSubtitle", { name: p2Name }),
      games: comparison.only2
    },
    combined: {
      title: t("listFamilyTitle"),
      subtitle: t("listFamilySubtitle"),
      games: comparison.combined
    }
  };
  return metadata[key];
}

function sortValue(game, key) {
  if (key.startsWith("price")) {
    return typeof game.price === "number" ? game.price : null;
  }
  if (key.startsWith("rating")) {
    return typeof game.rating === "number" ? game.rating : null;
  }
  if (key.startsWith("playtime")) {
    return game.playtime_forever || 0;
  }
  return game.name || "";
}

function visibleGames(games) {
  const query = activeSearch.trim().toLowerCase();
  const filtered = query
    ? games.filter((game) => (game.name || "").toLowerCase().includes(query))
    : [...games];

  filtered.sort((a, b) => {
    if (activeSort === "name-asc") {
      return (a.name || "").localeCompare(b.name || "");
    }
    if (activeSort === "name-desc") {
      return (b.name || "").localeCompare(a.name || "");
    }

    const aValue = sortValue(a, activeSort);
    const bValue = sortValue(b, activeSort);
    if (aValue === null && bValue === null) {
      return (a.name || "").localeCompare(b.name || "");
    }
    if (aValue === null) {
      return 1;
    }
    if (bValue === null) {
      return -1;
    }
    if (activeSort.endsWith("asc")) {
      return aValue - bValue || (a.name || "").localeCompare(b.name || "");
    }
    return bValue - aValue || (a.name || "").localeCompare(b.name || "");
  });

  return filtered;
}

function renderList(key) {
  if (!currentComparison) {
    return;
  }

  const { title, subtitle, games } = listMetadata(key, currentComparison);
  const filteredGames = visibleGames(games);
  listPanel.innerHTML = "";

  const header = document.createElement("div");
  header.className = "list-header";
  const text = document.createElement("div");
  const heading = document.createElement("h3");
  heading.textContent = title;
  const sub = document.createElement("p");
  sub.textContent = subtitle;
  text.append(heading, sub);
  const count = document.createElement("strong");
  count.textContent = t("countOfGames", {
    visible: formatNumber(filteredGames.length),
    total: formatNumber(games.length)
  });
  header.append(text, count);
  listPanel.append(header);

  const controls = document.createElement("div");
  controls.className = "list-controls";

  const searchLabel = document.createElement("label");
  searchLabel.className = "search-control";
  const searchText = document.createElement("span");
  searchText.textContent = t("searchGames");
  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.placeholder = t("searchPlaceholder");
  searchInput.value = activeSearch;
  searchInput.addEventListener("input", () => {
    activeSearch = searchInput.value;
    renderList(activeList);
  });
  searchLabel.append(searchText, searchInput);

  const sortLabel = document.createElement("label");
  sortLabel.className = "sort-control";
  const sortText = document.createElement("span");
  sortText.textContent = t("sortBy");
  const sortSelect = document.createElement("select");
  for (const [value, labelKey] of sortOptions) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = t(labelKey);
    option.selected = activeSort === value;
    sortSelect.append(option);
  }
  sortSelect.addEventListener("change", () => {
    activeSort = sortSelect.value;
    renderList(activeList);
  });
  sortLabel.append(sortText, sortSelect);
  controls.append(searchLabel, sortLabel);
  listPanel.append(controls);
  if (activeSearch) {
    searchInput.focus();
    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
  }

  if (!filteredGames.length) {
    const empty = document.createElement("p");
    empty.className = "empty-list";
    empty.textContent = activeSearch ? t("noSearchMatches") : t("noGamesInList");
    listPanel.append(empty);
    return;
  }

  const list = document.createElement("div");
  list.className = "game-list";

  for (const game of filteredGames) {
    const row = rowTemplate.content.cloneNode(true);
    const image = row.querySelector("img");
    const imageSource = iconUrl(game);
    image.alt = "";
    if (imageSource) {
      image.src = imageSource;
    } else {
      image.removeAttribute("src");
    }
    row.querySelector("strong").textContent = game.name;
    row.querySelector("span").textContent = [
      `App ${game.appid}`,
      formatMinutes(game.playtime_forever),
      formatUnavailable(t("price")),
      formatUnavailable(t("reviews"))
    ].join(" | ");
    list.append(row);
  }

  listPanel.append(list);
}

function updateTabLabels(comparison = null) {
  const p1Name = comparison ? playerName(comparison.player1, t("player1")) : t("player1");
  const p2Name = comparison ? playerName(comparison.player2, t("player2")) : t("player2");
  const labels = {
    both: t("tabDuplicates"),
    only1: t("gains", { name: p2Name }),
    only2: t("gains", { name: p1Name }),
    combined: t("tabFullFamily")
  };
  for (const tab of tabs) {
    tab.textContent = labels[tab.dataset.list];
  }
}

function setActiveList(key) {
  activeList = key;
  activeSearch = "";
  for (const tab of tabs) {
    tab.classList.toggle("active", tab.dataset.list === key);
  }
  renderList(key);
}

function cleanErrorMessage(data, fallback) {
  const code = data?.error?.code;
  const message = data?.error?.message || fallback;
  const messages = {
    missing_api_key: t("missingApiKey"),
    invalid_profile: t("invalidProfile"),
    vanity_unresolved: t("invalidProfile"),
    private_library: t("privateLibrary"),
    empty_library: t("emptyLibrary"),
    steam_request_failed: t("steamRequestFailed")
  };
  return messages[code] || message || t("steamFallbackError");
}

async function compare(player1, player2) {
  const response = await fetch("/api/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player1, player2 })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(cleanErrorMessage(data, t("steamFallbackError")));
  }
  return data;
}

function shareSummaryText(comparison) {
  const winner = winnerConclusion(comparison);
  const p1Name = playerName(comparison.player1, t("player1"));
  const p2Name = playerName(comparison.player2, t("player2"));
  return [
    t("shareTitle"),
    t("summaryOwned", { name: p1Name, count: formatNumber(totalGames(comparison.player1)) }),
    t("summaryOwned", { name: p2Name, count: formatNumber(totalGames(comparison.player2)) }),
    t("sharedDuplicates", { count: formatNumber(comparison.both.length) }),
    t("summaryFullLibrary", { count: formatNumber(comparison.combined.length) }),
    t("summaryGains", { name: p1Name, count: formatNumber(comparison.only2.length) }),
    t("summaryGains", { name: p2Name, count: formatNumber(comparison.only1.length) }),
    winner.gamesConclusion,
    winner.valueConclusion
  ].join("\n");
}

async function copyShareSummary() {
  if (!currentComparison) {
    return;
  }

  const text = shareSummaryText(currentComparison);
  try {
    await navigator.clipboard.writeText(text);
    shareStatusEl.textContent = t("shareCopied");
  } catch {
    shareStatusEl.textContent = text;
  }
}

function renderAllResults(comparison) {
  renderPlayerProfiles(comparison);
  renderWinner(comparison);
  renderSummary(comparison);
  updateTabLabels(comparison);
  renderList(activeList);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const player1 = formData.get("player1");
  const player2 = formData.get("player2");

  compareButton.disabled = true;
  shareStatusEl.textContent = "";
  resultsEl.classList.add("hidden");
  startProgress();

  try {
    const data = await compare(player1, player2);
    setStatus(t("comparingLibraries"));
    currentComparison = compareLibraries(data.player1, data.player2);
    if (!currentComparison.player1.games.length || !currentComparison.player2.games.length) {
      setStatus(t("zeroVisibleWarning"));
    } else {
      clearStatus();
    }
    resultsEl.classList.remove("hidden");
    renderAllResults(currentComparison);
  } catch (error) {
    currentComparison = null;
    resultsEl.classList.add("hidden");
    setStatus(error.message, "error");
  } finally {
    stopProgress();
    compareButton.disabled = false;
  }
});

for (const tab of tabs) {
  tab.addEventListener("click", () => setActiveList(tab.dataset.list));
}

shareButton.addEventListener("click", copyShareSummary);

languageSelect.addEventListener("change", () => {
  currentLanguage = languageSelect.value;
  localStorage.setItem("steamComparatorLanguage", currentLanguage);
  shareStatusEl.textContent = "";
  applyLanguage();
});

applyLanguage();
