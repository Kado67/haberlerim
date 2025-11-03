// SEKME ELEMANLARI
const tabs = document.querySelectorAll(".tab");
const feedTitle = document.getElementById("feedTitle");
const feed = document.getElementById("feed");
const errorBox = document.getElementById("errorBox");

// 1) TÜM KATEGORİLER İÇİN RSS ADRESLERİ
const RSS_SOURCES = {
  gundem: "https://www.trthaber.com/rss/gundem.rss",
  spor: "https://www.trthaber.com/rss/spor.rss",
  teknoloji: "https://www.haberturk.com/rss/teknoloji.xml",
  magazin: "https://www.sozcu.com.tr/rss/magazin.xml",
  saglik: "https://www.trthaber.com/rss/saglik.rss",
  bilim: "https://www.ntv.com.tr/teknoloji.rss"
};

// 2) SADECE GÜNDEMDE KULLANACAĞIMIZ API AYARLARI
const API_KEY = "pub_ee04dcfcf6b54339b4bc667b529dea62"; // senin yeni anahtarın
const API_URL =
  "https://newsdata.io/api/1/news?country=tr&language=tr&category=top&apikey=" +
  API_KEY;
const API_STORAGE_KEY = "gundem_api_cache"; // localStorage anahtarı

// RSS ÇEKEN FONKSİYON
async function loadRss(category = "gundem") {
  // başlığı değiştir
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
    // rss2json ücretsiz bir geçit, telefonu da çalıştırır
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

    // GÜNDEM İSE: önce API’den 2 tane ekleyelim (varsa)
    if (category === "gundem") {
      await maybeAddApiNewsFirst();
    }

    // sonra RSS haberlerini listele
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

// 3) API’Yİ GÜNDE 1 KEZ VE 2 HABER ÇALIŞTIRMA
async function maybeAddApiNewsFirst() {
  try {
    // daha önce çektik mi?
    const saved = localStorage.getItem(API_STORAGE_KEY);
    const today = new Date().toISOString().slice(0, 10); // 2025-11-03

    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today && parsed.items && parsed.items.length) {
        // ayni gün -> kaydedileni kullan
        appendApiItems(parsed.items);
        return;
      }
    }

    // bugün için ilk kez çekeceğiz
    const res = await fetch(API_URL);
    const data = await res.json();

    if (data && data.results && data.results.length) {
      const onlyTwo = data.results.slice(0, 2); // sadece 2 haber
      // ekrana bas
      appendApiItems(onlyTwo);
      // kaydet
      localStorage.setItem(
        API_STORAGE_KEY,
        JSON.stringify({ date: today, items: onlyTwo })
      );
    }
  } catch (e) {
    console.warn("API haberleri eklenemedi:", e);
  }
}

// API’den gelen 2 haberi yazar
function appendApiItems(items) {
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "news-card";

    const img = item.image_url || "";
    const source = item.source_id || "";
    const date = item.pubDate || item.pub_date || "";

    card.innerHTML = `
      ${img ? `<img src="${img}" alt="">` : ""}
      <div class="news-content">
        <h3>${item.title}</h3>
        <p class="meta">${source} • ${date}</p>
        <p>${item.description ? item.description.slice(0, 140) + "..." : ""}</p>
        <a href="${item.link}" target="_blank">Habere git</a>
      </div>
    `;
    // RSS’tan önce gözüksün diye en başa ekleyebiliriz
    feed.appendChild(card);
  });
}

// SEKME TIKLAMALARI
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const cat = tab.dataset.cat; // data-cat="spor" gibi
    loadRss(cat);
  });
});

// SAYFA AÇILINCA GÜNDEM
loadRss("gundem");
