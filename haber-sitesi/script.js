// =========================
//  HABERLERİ ÇEKEN JS
//  provider: newsdata.io
//  api key: KENDİ VERDİĞİN
// =========================

const API_KEY = "pub_ee04dcfcf6b54339b4bc667b529dea62";
const BASE_URL = "https://newsdata.io/api/1/news";

// HTML elemanları
const tabs = document.querySelectorAll(".tab");
const feed = document.getElementById("feed");
const feedTitle = document.getElementById("feedTitle");
const searchInput = document.getElementById("q");
const searchBtn = document.getElementById("searchBtn");

// senin buton isimlerini newsdata kategorilerine çeviriyoruz
const CATEGORY_MAP = {
  gundem: "top",          // genel / top
  spor: "sports",
  teknoloji: "technology",
  magazin: "entertainment",
  saglik: "health",
  bilim: "science"
};

// küçük yardımcılar
function setLoading() {
  if (feed) feed.innerHTML = `<p style="padding:1rem;">Yükleniyor...</p>`;
}

function setTitle(txt) {
  if (feedTitle) feedTitle.textContent = txt;
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("tr-TR");
}

function renderArticles(list) {
  if (!feed) return;

  if (!list || !list.length) {
    feed.innerHTML = `<p style="padding:1rem;">Haber bulunamadı.</p>`;
    return;
  }

  const html = list
    .map((item) => {
      const img =
        item.image_url ||
        "https://via.placeholder.com/360x200?text=Haber"; // resim yoksa
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
            <a class="read-more" href="${item.link}" target="_blank" rel="noopener">Habere git</a>
          </div>
        </article>
      `;
    })
    .join("");

  feed.innerHTML = html;
}

// kategoriye göre çek
async function loadCategory(cat = "gundem") {
  setLoading();
  setTitle(cat.charAt(0).toUpperCase() + cat.slice(1));

  const newsCat = CATEGORY_MAP[cat] || "top";

  // newsdata.io kuyruk
  let url = `${BASE_URL}?apikey=${API_KEY}&country=tr&language=tr`;
  if (newsCat) {
    url += `&category=${newsCat}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();

    if (data.status !== "success") {
      throw new Error("API başarısız");
    }

    renderArticles(data.results);
  } catch (err) {
    console.error(err);
    if (feed)
      feed.innerHTML =
        `<p style="padding:1rem;color:#d00;">Haberler alınamadı. Daha sonra tekrar deneyin.</p>`;
  }
}

// arama
async function doSearch(q) {
  q = q.trim();
  if (!q) {
    // boşsa aktif sekmeyi tekrar yükle
    const active = document.querySelector(".tab.active");
    const currentCat = active ? active.dataset.cat : "gundem";
    loadCategory(currentCat);
    return;
  }

  setLoading();
  setTitle(`"${q}" araması`);

  let url = `${BASE_URL}?apikey=${API_KEY}&country=tr&language=tr&q=${encodeURIComponent(
    q
  )}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (data.status !== "success") throw new Error("API başarısız");
    renderArticles(data.results);
  } catch (err) {
    console.error(err);
    if (feed)
      feed.innerHTML =
        `<p style="padding:1rem;color:#d00;">Arama yapılamadı.</p>`;
  }
}

// sekme tıklama
tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const cat = btn.dataset.cat;
    loadCategory(cat);
  });
});

// arama butonu
if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", () => doSearch(searchInput.value));
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") doSearch(searchInput.value);
  });
}

// sayfa açılınca ilk yükleme
document.addEventListener("DOMContentLoaded", () => {
  // ilk sekmeyi aktif yap
  const first = document.querySelector(".tab[data-cat='gundem']") || tabs[0];
  if (first) first.classList.add("active");
  loadCategory("gundem");
});
