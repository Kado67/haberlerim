// Kategoriler
const tabs = document.querySelectorAll(".tab");
const feedTitle = document.getElementById("feedTitle");
const feed = document.getElementById("feed");
const searchInput = document.getElementById("q");
const searchBtn = document.getElementById("searchBtn");

// Her kategoriye bir RSS tanımlıyoruz
const RSS_SOURCES = {
  gundem: "https://www.trthaber.com/rss/gundem.rss",
  spor: "https://www.trthaber.com/rss/spor.rss",
  teknoloji: "https://www.trthaber.com/rss/bilim-teknoloji.rss",
  magazin: "https://www.trthaber.com/rss/kultur-sanat.rss",
  saglik: "https://www.trthaber.com/rss/yasam.rss",
  bilim: "https://www.trthaber.com/rss/bilim-teknoloji.rss"
};

// Ekranda tutacağımız son haberler (arama için)
let currentItems = [];

// RSS çekme fonksiyonu
async function loadCategory(category = "gundem") {
  // Sekme aktifliği
  tabs.forEach((t) => t.classList.remove("active"));
  const activeTab = Array.from(tabs).find(
    (t) => t.dataset.cat === category
  );
  if (activeTab) activeTab.classList.add("active");

  // Başlık
  feedTitle.textContent =
    category.charAt(0).toUpperCase() + category.slice(1);

  // RSS var mı?
  const rssUrl = RSS_SOURCES[category];
  if (!rssUrl) {
    feed.innerHTML =
      '<p style="padding:1rem;color:#fff;">Bu kategori için RSS tanımlı değil.</p>';
    currentItems = [];
    return;
  }

  // Yükleniyor göster
  feed.innerHTML =
    '<p style="padding:1rem;color:#fff;">Yükleniyor...</p>';

  try {
    // allorigins ile CORS sorununu aşarak RSS çekiyoruz
    const resp = await fetch(
      "https://api.allorigins.win/get?url=" + encodeURIComponent(rssUrl)
    );
    const data = await resp.json();

    // XML parse
    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, "text/xml");
    const items = xml.querySelectorAll("item");

    const parsed = [];
    items.forEach((item) => {
      parsed.push({
        title: item.querySelector("title")?.textContent || "Başlık yok",
        link: item.querySelector("link")?.textContent || "#",
        desc:
          item.querySelector("description")?.textContent ||
          "",
        date: item.querySelector("pubDate")?.textContent || "",
        source:
          xml.querySelector("channel > title")?.textContent ||
          "kaynak"
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

// Listeyi ekrana basma
function renderList(list) {
  if (!list || list.length === 0) {
    feed.innerHTML =
      '<p style="padding:1rem;color:#fff;">Haber bulunamadı.</p>';
    return;
  }

  const html = list
    .slice(0, 20) // çok uzamasın
    .map((item) => {
      const dateText = item.date ? item.date : "";
      const sourceText = item.source ? item.source : "";
      return `
        <article class="news-card">
          <h3>${item.title}</h3>
          <p class="meta">${sourceText} • ${dateText}</p>
          <p class="desc">${item.desc.slice(0, 150)}...</p>
          <a href="${item.link}" target="_blank" rel="noopener">Habere git</a>
        </article>
      `;
    })
    .join("");

  feed.innerHTML = html;
}

// Sekmelere tıklama
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const cat = tab.dataset.cat;
    loadCategory(cat);
  });
});

// Arama
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

if (searchBtn) {
  searchBtn.addEventListener("click", doSearch);
}
if (searchInput) {
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") doSearch();
  });
}

// Sayfa açılınca Gündem gelsin
loadCategory("gundem");
