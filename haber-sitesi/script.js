// 🔑 API anahtarını buraya koy
const NEWS_API_KEY = "pub_ee04dcfcf6b54339b4bc667b529dea62";

// DOM elemanları
const tabs = document.querySelectorAll(".tab");
const feedTitle = document.getElementById("feedTitle");
const feed = document.getElementById("feed");
const searchInput = document.getElementById("q");
const searchBtn = document.getElementById("searchBtn");

// Newsdata kategorilerini bizim butonlarla eşleştir
const API_CATEGORIES = {
  gundem: "top",        // genel
  spor: "sports",
  teknoloji: "technology",
  magazin: "entertainment",
  saglik: "health",
  bilim: "science"
};

// Aynı kategoriler için kullanacağımız RSS listesi
const RSS_SOURCES = {
  gundem: "https://www.trthaber.com/rss/gundem.rss",
  spor: "https://www.trthaber.com/rss/spor.rss",
  teknoloji: "https://www.trthaber.com/rss/bilim-teknoloji.rss",
  magazin: "https://www.trthaber.com/rss/kultur-sanat.rss",
  saglik: "https://www.trthaber.com/rss/yasam.rss",
  bilim: "https://www.trthaber.com/rss/bilim-teknoloji.rss"
};

// ekranda tutacağımız veri (arama için)
let currentItems = [];

// 1 saat = 3600000 ms
const ONE_HOUR = 60 * 60 * 1000;

// kategori yükle
async function loadCategory(category = "gundem") {
  // başlığı ayarla
  feedTitle.textContent =
    category.charAt(0).toUpperCase() + category.slice(1);

  // aktif sekme
  tabs.forEach((t) => t.classList.remove("active"));
  const activeTab = Array.from(tabs).find(
    (t) => t.dataset.cat === category
  );
  if (activeTab) activeTab.classList.add("active");

  feed.innerHTML = '<p style="padding:1rem;color:#fff;">Yükleniyor...</p>';

  // en son bu kategoride API ne zaman çağrılmış?
  const lsKey = "last_api_call_" + category;
  const lastCall = localStorage.getItem(lsKey);
  const now = Date.now();

  const canUseApi = !lastCall || now - Number(lastCall) > ONE_HOUR;

  if (canUseApi) {
    const ok = await loadFromAPI(category);
    if (ok) {
      // başarılıysa zamanı kaydet
      localStorage.setItem(lsKey, String(now));
      return;
    }
    // API başarısızsa RSS'e düş
  }

  // RSS'ten getir
  await loadFromRSS(category);
}

// API'den çek
async function loadFromAPI(category) {
  const apiCat = API_CATEGORIES[category];
  if (!apiCat) return false;

  const url = `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&category=${apiCat}&country=tr&language=tr`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API yanıtı hata");
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return false;
    }

    const items = data.results.map((item) => ({
      title: item.title || "Başlık yok",
      link: item.link || "#",
      desc: item.description || "",
      date: item.pubDate || "",
      source: item.source_id || ""
    }));

    currentItems = items;
    renderList(items);
    return true;
  } catch (err) {
    console.error("API hata:", err);
    return false;
  }
}

// RSS'ten çek
async function loadFromRSS(category) {
  const rssUrl = RSS_SOURCES[category];
  if (!rssUrl) {
    feed.innerHTML =
      '<p style="padding:1rem;color:#fff;">Bu kategori için RSS tanımlı değil.</p>';
    currentItems = [];
    return;
  }

  try {
    const resp = await fetch(
      "https://api.allorigins.win/get?url=" + encodeURIComponent(rssUrl)
    );
    const data = await resp.json();

    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, "text/xml");
    const items = xml.querySelectorAll("item");

    const parsed = [];
    items.forEach((item) => {
      parsed.push({
        title: item.querySelector("title")?.textContent || "Başlık yok",
        link: item.querySelector("link")?.textContent || "#",
        desc: item.querySelector("description")?.textContent || "",
        date: item.querySelector("pubDate")?.textContent || "",
        source:
          xml.querySelector("channel > title")?.textContent || "kaynak"
      });
    });

    currentItems = parsed;
    renderList(parsed);
  } catch (err) {
    console.error(err);
    feed.innerHTML =
      '<p style="padding:1rem;color:#fff;">RSS yüklenemedi (servis hatası)</p>';
    currentItems = [];
  }
}

// ekrana yaz
function renderList(list) {
  if (!list || list.length === 0) {
    feed.innerHTML =
      '<p style="padding:1rem;color:#fff;">Haber bulunamadı.</p>';
    return;
  }

  const html = list
    .slice(0, 20)
    .map((item) => {
      return `
      <article class="news-card">
        <h3>${item.title}</h3>
        <p class="meta">${item.source || ""} • ${item.date || ""}</p>
        <p class="desc">${(item.desc || "").slice(0, 160)}...</p>
        <a href="${item.link}" target="_blank" rel="noopener">Habere git</a>
      </article>
    `;
    })
    .join("");

  feed.innerHTML = html;
}

// arama
function doSearch() {
  const q = (searchInput.value || "").toLowerCase().trim();
  if (!q) {
    renderList(currentItems);
    return;
  }
  const filtered = currentItems.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q)
  );
  renderList(filtered);
}

// eventler
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const cat = tab.dataset.cat;
    loadCategory(cat);
  });
});

if (searchBtn) {
  searchBtn.addEventListener("click", doSearch);
}
if (searchInput) {
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") doSearch();
  });
}

// ilk açılış
loadCategory("gundem");
