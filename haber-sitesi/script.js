// ======================
//  Haberlerim - script.js
// ======================

const API_KEY = "pub_ee04dcfcf6b54339b4bc667b529dea62";
const BASE_URL = "https://newsdata.io/api/1/news";

// DOM elemanları
const tabs = document.querySelectorAll("nav .tab");
const feed = document.getElementById("feed");
const feedTitle = document.getElementById("feedTitle");
const errBox = document.getElementById("err");
const searchInput = document.getElementById("q");
const searchBtn = document.getElementById("searchBtn");

// yıl
const ySpan = document.getElementById("y");
if (ySpan) ySpan.textContent = new Date().getFullYear();

// küçük yardımcılar
function setLoading() {
  if (feed) {
    feed.innerHTML = `<p style="padding:1rem;">Yükleniyor…</p>`;
  }
  if (errBox) {
    errBox.hidden = true;
    errBox.textContent = "";
  }
}

function showError(msg = "Haberler alınamadı.") {
  if (errBox) {
    errBox.hidden = false;
    errBox.textContent = msg;
  }
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("tr-TR");
}

function renderNews(list) {
  if (!feed) return;
  if (!list || !list.length) {
    feed.innerHTML = `<p style="padding:1rem;">Bu kategori için haber bulunamadı.</p>`;
    return;
  }

  const html = list
    .map((item) => {
      const img =
        item.image_url ||
        "https://via.placeholder.com/900x450?text=Haber+G%C3%B6rseli";
      return `
        <article class="news-card">
          <div class="news-thumb">
            <img src="${img}" alt="${item.title || ""}">
          </div>
          <div class="news-body">
            <h3>${item.title || "Başlık yok"}</h3>
            <p class="meta">
              ${(item.source_id || "").toUpperCase()} • ${formatDate(
        item.pubDate
      )}
            </p>
            <p class="desc">${item.description || ""}</p>
            <a class="read-more" href="${item.link}" target="_blank" rel="noopener">
              Habere git
            </a>
          </div>
        </article>
      `;
    })
    .join("");

  feed.innerHTML = html;
}

// asıl yükleyen fonksiyon
async function loadNews({ category = "top", query = "" } = {}) {
  setLoading();

  // başlık
  if (query) {
    feedTitle.textContent = `"${query}" sonuçları`;
  } else {
    // kategori adını Türkçe yaz
    const map = {
      top: "Gündem",
      sports: "Spor",
      technology: "Teknoloji",
      entertainment: "Magazin",
      health: "Sağlık",
      science: "Bilim",
    };
    feedTitle.textContent = map[category] || "Haberler";
  }

  // API adresi
  let url = `${BASE_URL}?apikey=${API_KEY}&country=tr&language=tr`;

  // arama varsa kategori göndermeyebiliriz, daha çok sonuç gelir
  if (query) {
    url += `&q=${encodeURIComponent(query)}`;
  } else if (category && category !== "top") {
    // top zaten varsayılan
    url += `&category=${category}`;
  } else {
    // gündem için de açıkça yazabiliriz
    url += `&category=top`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (data.status !== "success") throw new Error("API yanıt vermedi");
    renderNews(data.results);
  } catch (e) {
    console.error(e);
    showError("Haberler alınamadı. Biraz sonra tekrar deneyin.");
    if (feed) {
      feed.innerHTML = "";
    }
  }
}

// sekmeler
tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    // aktifliği ayarla
    tabs.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // arama kutusunu temizle
    if (searchInput) searchInput.value = "";

    const cat = btn.dataset.cat || "top";
    loadNews({ category: cat });
  });
});

// arama
if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", () => {
    const q = searchInput.value.trim();
    // aramada sekme seçimini kaldır
    tabs.forEach((b) => b.classList.remove("active"));
    loadNews({ query: q });
  });

  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      const q = searchInput.value.trim();
      tabs.forEach((b) => b.classList.remove("active"));
      loadNews({ query: q });
    }
  });
}

// sayfa açılınca ilk gündem
document.addEventListener("DOMContentLoaded", () => {
  loadNews({ category: "top" });
});
