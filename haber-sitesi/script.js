// ====== 1. API (Newsdata.io) ======
const NEWSDATA_KEY = "pub_ee04dcfcf6b54339b4bc667b529dea62";

// ====== 2. API (GNews.io) ======
const GNEWS_KEY = "730d91fc9dfc2aca690268baf8062441";

// kategori eşleştirmeleri
const NEWSDATA_CATS = {
  gundem: "top",
  spor: "sports",
  teknoloji: "technology",
  magazin: "entertainment",
  saglik: "health",
  bilim: "science"
};

const GNEWS_CATS = {
  gundem: "general",
  spor: "sports",
  teknoloji: "technology",
  magazin: "entertainment",
  saglik: "health",
  bilim: "science"
};

// HTML elemanları
const tabs = document.querySelectorAll(".tab");
const feedTitle = document.getElementById("feedTitle");
const feed = document.getElementById("feed");
const searchInput = document.getElementById("q");
const searchBtn = document.getElementById("searchBtn");
let currentItems = [];

// haber kartı oluştur
function renderList(list) {
  if (!list || list.length === 0) {
    feed.innerHTML = '<p style="padding:1rem;color:#fff;">Haber bulunamadı.</p>';
    return;
  }
  feed.innerHTML = list.map(item => `
    <article class="news-card">
      ${item.image ? `<img src="${item.image}" class="thumb" />` : ""}
      <div class="news-body">
        <h3>${item.title}</h3>
        <p class="meta">${item.source || ""} • ${item.date || ""}</p>
        <p class="desc">${(item.desc || "").slice(0, 140)}...</p>
        <a href="${item.link}" target="_blank" rel="noopener">Habere git</a>
      </div>
    </article>
  `).join("");
}

// NewsData API'den veri çek
async function fetchFromNewsdata(category = "gundem") {
  const ndCat = NEWSDATA_CATS[category] || "top";
  const url = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_KEY}&category=${ndCat}&country=tr&language=tr`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("NewsData hatası");
  const data = await res.json();
  if (!data.results) throw new Error("NewsData boş");
  return data.results.map(i => ({
    title: i.title,
    link: i.link,
    desc: i.description,
    date: i.pubDate,
    source: i.source_id,
    image: i.image_url
  }));
}

// GNews API'den veri çek
async function fetchFromGnews(category = "gundem") {
  const gCat = GNEWS_CATS[category] || "general";
  const url = `https://gnews.io/api/v4/top-headlines?category=${gCat}&lang=tr&max=20&apikey=${GNEWS_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("GNews hatası");
  const data = await res.json();
  if (!data.articles) throw new Error("GNews boş");
  return data.articles.map(i => ({
    title: i.title,
    link: i.url,
    desc: i.description,
    date: i.publishedAt,
    source: i.source && i.source.name ? i.source.name : "",
    image: i.image
  }));
}

// Ana kategori yükleme
async function loadCategory(category = "gundem") {
  feedTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
  tabs.forEach(t => t.classList.remove("active"));
  const tab = Array.from(tabs).find(t => t.dataset.cat === category);
  if (tab) tab.classList.add("active");

  feed.innerHTML = '<p style="padding:1rem;color:#fff;">Yükleniyor...</p>';
  currentItems = [];

  // Önce NewsData dene
  try {
    const items = await fetchFromNewsdata(category);
    currentItems = items;
    renderList(items);
    return;
  } catch (e) {
    console.warn("NewsData olmadı:", e.message);
  }

  // GNews'e düş
  try {
    const items = await fetchFromGnews(category);
    currentItems = items;
    renderList(items);
    return;
  } catch (e) {
    console.warn("GNews de olmadı:", e.message);
  }

  // Olmazsa hata göster
  feed.innerHTML = '<p style="padding:1rem;color:#fff;">Hiçbir API’den haber alınamadı.</p>';
}

// Arama
function doSearch() {
  const q = (searchInput.value || "").toLowerCase().trim();
  if (!q) {
    renderList(currentItems);
    return;
  }
  const filtered = currentItems.filter(item =>
    (item.title || "").toLowerCase().includes(q) ||
    (item.desc || "").toLowerCase().includes(q)
  );
  renderList(filtered);
}

// Eventler
tabs.forEach(tab => tab.addEventListener("click", () => loadCategory(tab.dataset.cat)));
if (searchBtn) searchBtn.addEventListener("click", doSearch);
if (searchInput) searchInput.addEventListener("keyup", e => { if (e.key === "Enter") doSearch(); });

// İlk yükleme
loadCategory("gundem");
