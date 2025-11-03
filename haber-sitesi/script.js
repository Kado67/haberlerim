// 🔑 KENDİ API KEY'İNİ BURAYA YAZ
const NEWS_API_KEY = "pub_ee04dcfcf6b54339b4bc667b529dea62";

// DOM elemanları
const tabs = document.querySelectorAll(".tab");
const feedTitle = document.getElementById("feedTitle");
const feed = document.getElementById("feed");
const searchInput = document.getElementById("q");
const searchBtn = document.getElementById("searchBtn");

// buton isimlerini Newsdata kategorisine çeviriyoruz
const API_CATEGORIES = {
  gundem: "top",
  spor: "sports",
  teknoloji: "technology",
  magazin: "entertainment",
  saglik: "health",
  bilim: "science",
};

// ekranda tutacağımız liste (arama için)
let currentItems = [];

// kategori yükle
async function loadCategory(category = "gundem") {
  // başlık
  feedTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);

  // aktif sekme
  tabs.forEach((t) => t.classList.remove("active"));
  const activeTab = Array.from(tabs).find((t) => t.dataset.cat === category);
  if (activeTab) activeTab.classList.add("active");

  // yükleniyor
  feed.innerHTML = '<p style="padding:1rem;color:#fff;">Yükleniyor...</p>';

  const apiCat = API_CATEGORIES[category] || "top";
  const url = `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&category=${apiCat}&country=tr&language=tr`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API yanıt vermedi");
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      feed.innerHTML =
        '<p style="padding:1rem;color:#fff;">Bu kategori için haber bulunamadı.</p>';
      currentItems = [];
      return;
    }

    // sonuçları basit objeye çevir
    const items = data.results.map((item) => ({
      title: item.title || "Başlık yok",
      link: item.link || "#",
      desc: item.description || "",
      date: item.pubDate || "",
      source: item.source_id || "",
      image: item.image_url || "",
    }));

    currentItems = items;
    renderList(items);
  } catch (err) {
    console.error(err);
    feed.innerHTML =
      '<p style="padding:1rem;color:#fff;">Haberler alınamadı (API hatası)</p>';
    currentItems = [];
  }
}

// listeyi ekrana yaz
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
        ${
          item.image
            ? `<img src="${item.image}" alt="" class="thumb" />`
            : ""
        }
        <div class="news-body">
          <h3>${item.title}</h3>
          <p class="meta">${item.source || ""} • ${item.date || ""}</p>
          <p class="desc">${(item.desc || "").slice(0, 140)}...</p>
          <a href="${item.link}" target="_blank" rel="noopener">Habere git</a>
        </div>
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

// sekme tıklama
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const cat = tab.dataset.cat;
    loadCategory(cat);
  });
});

// arama tıklama
if (searchBtn) {
  searchBtn.addEventListener("click", doSearch);
}
if (searchInput) {
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") doSearch();
  });
}

// sayfa açılınca gündem
loadCategory("gundem");

