// SEKME ELEMANLARI
const tabs = document.querySelectorAll(".tab");
const feedTitle = document.getElementById("feedTitle");
const feed = document.getElementById("feed");
const errorBox = document.getElementById("errorBox");

// TÜM KATEGORİLER İÇİN RSS ADRESLERİ
const RSS_SOURCES = {
  gundem: "https://www.hurriyet.com.tr/rss/gundem",
  spor: "https://www.trthaber.com/rss/spor.rss",
  teknoloji: "https://www.haberturk.com/rss/teknoloji.xml",
  magazin: "https://www.sozcu.com.tr/rss/magazin.xml",
  saglik: "https://www.trthaber.com/rss/saglik.rss",
  bilim: "https://www.ntv.com.tr/teknoloji.rss"
};

// YEDEK PLAN (API) — Şimdilik devre dışı
const API_KEY = "pub_ee04dcfcf6b54339b4bc667b529dea62";
const API_URL = `https://newsdata.io/api/1/news?country=tr&language=tr&category=top&apikey=${API_KEY}`;

// RSS ÇEKEN FONKSİYON
async function loadRss(category = "gundem") {
  feedTitle.textContent =
    category.charAt(0).toUpperCase() + category.slice(1);

  const rssUrl = RSS_SOURCES[category];
  feed.innerHTML = "";
  errorBox.style.display = "none";

  if (!rssUrl) {
    errorBox.textContent = "Bu kategori için RSS tanımlı değil.";
    errorBox.style.display = "block";
    return;
  }

  try {
    const res = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
        rssUrl
      )}`
    );
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      feed.innerHTML = "<p>Bu kategoride haber bulunamadı.</p>";
      return;
    }

    data.items.slice(0, 15).forEach((item) => {
      const card = document.createElement("div");
      card.className = "news-card";

      const img = item.enclosure && item.enclosure.link ? item.enclosure.link : "";
      const source = item.author || item.feed_title || "";
      const date = item.pubDate ? item.pubDate : "";

      card.innerHTML = `
        ${img ? `<img src="${img}" alt="">` : ""}
        <div class="news-content">
          <h3>${item.title}</h3>
          <p class="meta">${source} • ${date}</p>
          <p>${item.description ? item.description.slice(0, 140) + "..." : ""}</p>
          <a href="${item.link}" target="_blank">Habere git</a>
        </div>
      `;
      feed.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    errorBox.textContent = "RSS yüklenemedi (servis hatası)";
    errorBox.style.display = "block";
  }
}

// SEKME TIKLAMALARI
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const cat = tab.dataset.cat;
    loadRss(cat);
  });
});

// SAYFA AÇILINCA GÜNDEM
loadRss("gundem");
