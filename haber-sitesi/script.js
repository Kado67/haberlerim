// ====== AYARLAR ======
const API_KEY = "pub_ee04dcfcf6b54339b4bc667b529dea62"; // senin yeni anahtarın
const BASE_URL = "https://gnews.io/api/v4";

// GNews topic isimlerine çeviri
const TOPIC_MAP = {
  gundem: "nation",       // Türkiye / ülke haberleri
  spor: "sports",
  teknoloji: "technology",
  magazin: "entertainment",
  saglik: "health",
  bilim: "science"
};

// ====== DOM ELEMANLARI ======
const tabs = document.querySelectorAll(".tab");
const feed = document.getElementById("feed");
const feedTitle = document.getElementById("feedTitle");
const searchInput = document.getElementById("q");
const searchBtn = document.getElementById("searchBtn");
const errorBox = document.getElementById("error");

// güvenlik: bu elemanlar yoksa sessizce çık
if (!feed || !feedTitle) {
  console.warn("Gerekli DOM elemanları bulunamadı.");
}

// küçük yardımcılar
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("tr-TR");
}

function showError(msg) {
  if (errorBox) {
    errorBox.textContent = msg;
    errorBox.style.display = "block";
  } else {
    console.error(msg);
  }
}

function clearError() {
  if (errorBox) {
    errorBox.textContent = "";
    errorBox.style.display = "none";
  }
}

// haberleri ekrana bas
function renderArticles(articles) {
  if (!feed) return;

  if (!articles || articles.length === 0) {
    feed.innerHTML = `<p class="no-news">Bu kategori için haber bulunamadı.</p>`;
    return;
  }

  const html = articles
    .map((a) => {
      const img = a.image
        ? a.image
        : "https://via.placeholder.com/400x220?text=Haber";
      return `
      <article class="news-card">
        <div class="news-thumb">
          <img src="${img}" alt="${a.title || ""}">
        </div>
        <div class="news-content">
          <h3>${a.title || "Başlık yok"}</h3>
          <p class="meta">
            ${a.source && a.source.name ? a.source.name : ""} • ${formatDate(
        a.publishedAt
      )}
          </p>
          <p class="desc">${a.description || ""}</p>
          <a class="read-more" href="${a.url}" target="_blank" rel="noopener">
            Habere git
          </a>
        </div>
      </article>
      `;
    })
    .join("");

  feed.innerHTML = html;
}

// kategoriye göre haber çek
async function loadCategory(catKey = "gundem") {
  clearError();
  if (feed) feed.innerHTML = `<p class="loading">Yükleniyor...</p>`;

  const topic = TOPIC_MAP[catKey] || "nation";
  if (feedTitle) {
    // ilk harf büyük
    feedTitle.textContent =
      catKey.charAt(0).toUpperCase() + catKey.slice(1).toLowerCase();
  }

  const url = `${BASE_URL}/top-headlines?token=${API_KEY}&topic=${topic}&lang=tr&max=20`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("API hatası: " + res.status);
    }
    const data = await res.json();
    renderArticles(data.articles);
  } catch (err) {
    console.error(err);
    showError("Haberler alınamadı. Biraz sonra tekrar deneyin.");
    if (feed) feed.innerHTML = "";
  }
}

// arama yap
async function doSearch(q) {
  q = q.trim();
  if (!q) {
    // boşsa aktif kategoriyi tekrar yükle
    const active = document.querySelector(".tab.active");
    const cat = active ? active.dataset.cat : "gundem";
    loadCategory(cat);
    return;
  }

  clearError();
  if (feed) feed.innerHTML = `<p class="loading">Aranıyor...</p>`;
  if (feedTitle) feedTitle.textContent = `"${q}" için sonuçlar`;

  const url = `${BASE_URL}/search?q=${encodeURIComponent(
    q
  )}&token=${API_KEY}&lang=tr&max=20`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("API hatası: " + res.status);
    }
    const data = await res.json();
    renderArticles(data.articles);
  } catch (err) {
    console.error(err);
    showError("Arama yapılamadı.");
    if (feed) feed.innerHTML = "";
  }
}

// ==== ETKİNLİKLER ====

// kategoriye tıklama
tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const cat = btn.dataset.cat; // gundem, spor ...
    loadCategory(cat);
  });
});

// arama butonu
if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", () => {
    doSearch(searchInput.value);
  });

  // enter ile arama
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      doSearch(searchInput.value);
    }
  });
}

// sayfa açılınca ilk haberleri getir
document.addEventListener("DOMContentLoaded", () => {
  loadCategory("gundem");
});
