// Butonlar ve alanlar
const tabs = document.querySelectorAll(".tab");
const feedTitle = document.getElementById("feedTitle");
const feed = document.getElementById("feed");
const searchInput = document.getElementById("q");
const searchBtn = document.getElementById("searchBtn");

// SENİN key'in
const API_KEY = "pub_041412110a0644cfb63307b53c733b41";

// Sekme adı → API isteği ayarı
// Böylece her sekme farklı haber getirir.
const CATEGORY_MAP = {
  gundem: {
    title: "Gündem",
    url: `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=tr&language=tr`
  },
  spor: {
    title: "Spor",
    // Türkiye spor haberleri az olduğu için q=spor da ekledim
    url: `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=tr&q=spor`
  },
  teknoloji: {
    title: "Teknoloji",
    url: `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=tr&q=teknoloji`
  },
  magazin: {
    title: "Magazin",
    url: `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=tr&q=magazin`
  },
  sağlık: {
    title: "Sağlık",
    url: `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=tr&q=sağlık`
  },
  bilim: {
    title: "Bilim",
    url: `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=tr&q=bilim`
  }
};

// Haberleri çeken fonksiyon
async function loadCategory(catKey = "gundem") {
  const config = CATEGORY_MAP[catKey];
  if (!config) return;

  feedTitle.textContent = config.title;

  try {
    const res = await fetch(config.url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      feed.innerHTML = "<p>Bu bölümde haber bulunamadı.</p>";
      return;
    }

    // 10 haber göster
    feed.innerHTML = data.results.slice(0, 10).map(item => {
      const img = item.image_url
        ? `<div class="news-img"><img src="${item.image_url}" alt=""></div>`
        : `<div class="news-img"></div>`;

      return `
        <a href="${item.link}" target="_blank" rel="noopener" class="news-card">
          ${img}
          <div class="news-content">
            <h3>${item.title || "Başlık yok"}</h3>
            <div class="meta">
              ${item.source_id || ""} • ${item.pubDate || ""}
            </div>
          </div>
        </a>
      `;
    }).join("");

  } catch (err) {
    console.error(err);
    feed.innerHTML = "<p>Haberler yüklenemedi.</p>";
  }
}

// Sekmelere tıklama
tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    // HTML'deki data-cat varsa onu al, yoksa yazıyı kullan
    const key = (btn.dataset.cat || btn.textContent.trim().toLowerCase()).replace("ı","i");

    tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    loadCategory(key);
  });
});

// Arama
searchBtn.addEventListener("click", async () => {
  const q = searchInput.value.trim();
  if (!q) return;

  const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=tr&q=${encodeURIComponent(q)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    feedTitle.textContent = `"${q}" araması`;
    if (!data.results) {
      feed.innerHTML = "<p>Sonuç bulunamadı.</p>";
      return;
    }

    feed.innerHTML = data.results.slice(0, 10).map(item => `
      <a href="${item.link}" target="_blank" class="news-card">
        <div class="news-img">
          ${item.image_url ? `<img src="${item.image_url}" alt="">` : ""}
        </div>
        <div class="news-content">
          <h3>${item.title}</h3>
          <div class="meta">${item.source_id || ""} • ${item.pubDate || ""}</div>
        </div>
      </a>
    `).join("");

  } catch (e) {
    feed.innerHTML = "<p>Arama sırasında hata oluştu.</p>";
  }
});

// Sayfa açılınca Gündem gelsin
loadCategory("gundem");
