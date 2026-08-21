// ============================================================
// お題ガチャ - フロントエンド制御
// サーバー側の /api/* エンドポイントと通信して画面を更新する
// ============================================================

const state = {
  currentCategory: "すべて",
  addCategory: null,
  favoritedTexts: new Set(), // "text|category" のキーで保持
};

// ---------------- ユーティリティ ----------------

function el(id) {
  return document.getElementById(id);
}

function showToast(message) {
  const toast = el("toast");
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => { toast.hidden = true; }, 2200);
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "通信に失敗しました");
  }
  return data;
}

function favKey(text, category) {
  return `${text}|${category}`;
}

// ---------------- タブ切り替え ----------------

function setupTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("is-active"));
      el(`panel-${btn.dataset.tab}`).classList.add("is-active");

      if (btn.dataset.tab === "history") loadHistory();
      if (btn.dataset.tab === "favorites") loadFavorites();
    });
  });
}

// ---------------- カテゴリ選択（ガチャ） ----------------

function setupCategorySelect() {
  const container = el("category-select");
  container.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    container.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    state.currentCategory = chip.dataset.category;
  });
}

// ---------------- ガチャを回す ----------------

function setupGacha() {
  const btn = el("gacha-btn");
  const machine = document.querySelector(".machine");
  const drop = el("capsule-drop");

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    machine.classList.add("is-spinning");
    drop.classList.remove("is-dropping");
    void drop.offsetWidth; // reflow でアニメーション再トリガー
    drop.classList.add("is-dropping");

    el("gacha-empty").hidden = true;

    try {
      // 演出のための短い待ち時間
      const [data] = await Promise.all([
        api("/api/gacha", {
          method: "POST",
          body: JSON.stringify({ category: state.currentCategory }),
        }),
        new Promise((r) => setTimeout(r, 550)),
      ]);
      renderResult(data);
    } catch (err) {
      el("result-card").hidden = true;
      el("gacha-empty").hidden = false;
      el("gacha-empty").textContent = err.message;
    } finally {
      btn.disabled = false;
      machine.classList.remove("is-spinning");
    }
  });
}

function renderResult(data) {
  const card = el("result-card");
  card.hidden = false;
  card.classList.remove("pop-again");
  void card.offsetWidth;

  el("result-category").textContent = data.category;
  el("result-category").style.background = data.color;
  el("result-text").textContent = data.text;
  el("result-time").textContent = data.drawn_at_label + " に登場";

  const favBtn = el("fav-btn");
  favBtn.dataset.text = data.text;
  favBtn.dataset.category = data.category;
  favBtn.dataset.promptId = data.prompt_id;
  updateFavButtonState(favBtn);
}

function updateFavButtonState(favBtn) {
  const key = favKey(favBtn.dataset.text, favBtn.dataset.category);
  const isFav = state.favoritedTexts.has(key);
  favBtn.classList.toggle("is-favorited", isFav);
  favBtn.querySelector(".fav-label").textContent = isFav ? "お気に入り済み" : "お気に入りに追加";
}

function setupFavButton() {
  el("fav-btn").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    const key = favKey(btn.dataset.text, btn.dataset.category);
    if (state.favoritedTexts.has(key)) {
      showToast("すでにお気に入りに追加されています");
      return;
    }
    try {
      await api("/api/favorites", {
        method: "POST",
        body: JSON.stringify({
          text: btn.dataset.text,
          category: btn.dataset.category,
          prompt_id: Number(btn.dataset.promptId) || null,
        }),
      });
      state.favoritedTexts.add(key);
      updateFavButtonState(btn);
      showToast("お気に入りに追加しました");
    } catch (err) {
      showToast(err.message);
    }
  });
}

// ---------------- 履歴 ----------------

async function loadHistory() {
  const list = el("history-list");
  try {
    const items = await api("/api/history");
    el("history-empty").hidden = items.length > 0;
    list.innerHTML = items.map((item) => `
      <li class="list-item">
        <span class="list-item-dot" style="background:${item.color}"></span>
        <div class="list-item-body">
          <div class="list-item-meta">
            <span>${item.drawn_at_label}</span>
            <span>${item.category}</span>
          </div>
          <div class="list-item-text">${escapeHtml(item.text)}</div>
        </div>
      </li>
    `).join("");
  } catch (err) {
    showToast(err.message);
  }
}

// ---------------- お気に入り ----------------

async function loadFavorites() {
  const list = el("favorite-list");
  try {
    const items = await api("/api/favorites");
    el("favorites-empty").hidden = items.length > 0;

    state.favoritedTexts = new Set(items.map((i) => favKey(i.text, i.category)));
    const currentFavBtn = el("fav-btn");
    if (currentFavBtn.dataset.text) updateFavButtonState(currentFavBtn);

    list.innerHTML = items.map((item) => `
      <li class="list-item">
        <span class="list-item-dot" style="background:${item.color}"></span>
        <div class="list-item-body">
          <div class="list-item-meta">
            <span>${item.added_at_label}</span>
            <span>${item.category}</span>
          </div>
          <div class="list-item-text">${escapeHtml(item.text)}</div>
        </div>
        <button class="remove-fav-btn" data-id="${item.id}" title="お気に入りから削除">✕</button>
      </li>
    `).join("");
  } catch (err) {
    showToast(err.message);
  }
}

function setupFavoriteListRemoval() {
  el("favorite-list").addEventListener("click", async (e) => {
    const btn = e.target.closest(".remove-fav-btn");
    if (!btn) return;
    try {
      await api(`/api/favorites/${btn.dataset.id}`, { method: "DELETE" });
      await loadFavorites();
      showToast("お気に入りから削除しました");
    } catch (err) {
      showToast(err.message);
    }
  });
}

// ---------------- お題を追加 ----------------

function setupAddForm() {
  const textarea = el("add-text");
  const charCount = el("char-count");
  textarea.addEventListener("input", () => {
    charCount.textContent = textarea.value.length;
  });

  const categorySelect = el("add-category-select");
  categorySelect.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    categorySelect.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    state.addCategory = chip.dataset.category;
  });

  el("add-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = el("add-message");
    message.hidden = true;

    const text = textarea.value.trim();
    if (!text) {
      showFormMessage("お題を入力してください", true);
      return;
    }
    if (!state.addCategory) {
      showFormMessage("カテゴリを選んでください", true);
      return;
    }

    const submitBtn = e.target.querySelector(".submit-btn");
    submitBtn.disabled = true;
    try {
      await api("/api/prompts", {
        method: "POST",
        body: JSON.stringify({ text, category: state.addCategory }),
      });
      showFormMessage("お題を追加しました！ガチャに登場するようになります。", false);
      textarea.value = "";
      charCount.textContent = "0";
      categorySelect.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
      state.addCategory = null;
    } catch (err) {
      showFormMessage(err.message, true);
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function showFormMessage(text, isError) {
  const message = el("add-message");
  message.hidden = false;
  message.textContent = text;
  message.className = "form-message " + (isError ? "is-error" : "is-success");
}

// ---------------- XSS対策 ----------------

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------------- 初期化 ----------------

async function init() {
  setupTabs();
  setupCategorySelect();
  setupGacha();
  setupFavButton();
  setupFavoriteListRemoval();
  setupAddForm();

  try {
    const favorites = await api("/api/favorites");
    state.favoritedTexts = new Set(favorites.map((i) => favKey(i.text, i.category)));
  } catch (err) {
    // 初期読み込み失敗は致命的ではないので握りつぶす
  }
}

document.addEventListener("DOMContentLoaded", init);
