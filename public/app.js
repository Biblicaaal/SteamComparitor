const form = document.querySelector("#compare-form");
const compareButton = document.querySelector("#compare-button");
const statusEl = document.querySelector("#status");
const resultsEl = document.querySelector("#results");
const summaryEl = document.querySelector("#summary");
const listPanel = document.querySelector("#list-panel");
const cardTemplate = document.querySelector("#summary-card-template");
const rowTemplate = document.querySelector("#game-row-template");
const tabs = Array.from(document.querySelectorAll(".tab"));

let currentComparison = null;
let activeList = "both";

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

function formatNumber(value) {
  return new Intl.NumberFormat().format(value);
}

function iconUrl(game) {
  if (!game.img_icon_url) {
    return "";
  }
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`;
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

  const sortByName = (a, b) => a.name.localeCompare(b.name);
  return {
    player1,
    player2,
    both: both.sort(sortByName),
    only1: only1.sort(sortByName),
    only2: only2.sort(sortByName),
    combined: combined.sort(sortByName)
  };
}

function renderSummary(comparison) {
  const cards = [
    ["Player 1 owns", comparison.player1.games.length],
    ["Player 2 owns", comparison.player2.games.length],
    ["Shared games", comparison.both.length],
    ["Unique family library", comparison.combined.length],
    ["Player 1 gains", comparison.only2.length],
    ["Player 2 gains", comparison.only1.length]
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
  const metadata = {
    both: {
      title: "Games both players own",
      subtitle: "Overlap that does not add new family value.",
      games: comparison.both
    },
    only1: {
      title: "Games only Player 1 owns",
      subtitle: "These are the games Player 2 would gain.",
      games: comparison.only1
    },
    only2: {
      title: "Games only Player 2 owns",
      subtitle: "These are the games Player 1 would gain.",
      games: comparison.only2
    },
    combined: {
      title: "Combined unique family library",
      subtitle: "The full shared pool from both libraries.",
      games: comparison.combined
    }
  };
  return metadata[key];
}

function renderList(key) {
  if (!currentComparison) {
    return;
  }

  const { title, subtitle, games } = listMetadata(key, currentComparison);
  listPanel.innerHTML = "";

  const header = document.createElement("div");
  header.className = "list-header";
  header.innerHTML = `
    <div>
      <h3>${title}</h3>
      <p>${subtitle}</p>
    </div>
    <strong>${formatNumber(games.length)} games</strong>
  `;
  listPanel.append(header);

  if (!games.length) {
    const empty = document.createElement("p");
    empty.className = "empty-list";
    empty.textContent = "No games in this list.";
    listPanel.append(empty);
    return;
  }

  const list = document.createElement("div");
  list.className = "game-list";

  for (const game of games) {
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
    row.querySelector("span").textContent = `App ${game.appid}`;
    list.append(row);
  }

  listPanel.append(list);
}

function setActiveList(key) {
  activeList = key;
  for (const tab of tabs) {
    tab.classList.toggle("active", tab.dataset.list === key);
  }
  renderList(key);
}

async function compare(player1, player2) {
  const response = await fetch("/api/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player1, player2 })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Steam API error. Try again in a minute.");
  }
  return data;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const player1 = formData.get("player1");
  const player2 = formData.get("player2");

  compareButton.disabled = true;
  resultsEl.classList.add("hidden");
  setStatus("Fetching libraries...");

  try {
    const data = await compare(player1, player2);
    currentComparison = compareLibraries(data.player1, data.player2);
    renderSummary(currentComparison);
    clearStatus();
    resultsEl.classList.remove("hidden");
    setActiveList(activeList);
  } catch (error) {
    currentComparison = null;
    resultsEl.classList.add("hidden");
    setStatus(error.message, "error");
  } finally {
    compareButton.disabled = false;
  }
});

for (const tab of tabs) {
  tab.addEventListener("click", () => setActiveList(tab.dataset.list));
}
