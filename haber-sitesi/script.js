// butonlar
const tabs = document.querySelectorAll(".tab");
const feedTitle = document.getElementById("feedTitle");
const feed = document.getElementById("feed");
const searchInput = document.getElementById("q");
const searchBtn = document.getElementById("searchBtn");

// senin key
const API_KEY = "pub_041412110a0644cfb63307b53c733b41";

/*
  Her sekmenin 2 adresi var:
  1) primary: Türkçe dene
  2) fallback: aynı kategori ama dili serbest bırak
*/
const CATEGORY_MAP = {
  gundem: {
    title: "Gündem",
    primary: `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=tr&language=tr`,
    fallback: null
  },
  spor: {
    title: "Spor",
    primary: `https://newsdata.io/api/1/news?apikey=${API_KEY}&category=sports&language=tr`,
    fallback: `https://newsdata.io/api/1/news?apikey=${API_KEY}&category=sports`
  },
  teknoloji: {
    title: "Teknoloji",
    primary: `https://newsdata.io/api/1/news?apikey=${API_KEY}&category=technology&language=tr`,
    fallback: `https://newsdata.io/api/1/news?apikey=${API_KEY}&category=technology`
  },
  magazin: {
    title: "Magazin",
    // entertainment çoğu zaman magazin gibi
    primary: `https://newsdata.io/api/1/news?apikey=${API_KEY}&category=entertainment&language=tr`,
    fallback: `https://newsdata.io/api/1/news?apikey=${API_KEY}&category=entertainment`
  },
  sağlık: {
    title: "Sağlık",
    primary: `https://newsdata.io/api/1/news?apikey=${API_KEY}&category=health&language=tr`,
    fallback: `https://newsdata.io/api/1/news?apikey=${API_KEY}&category=health`
  },
  bilim: {
    title: "Bilim",
    primary: `https://newsdata.io/api/1/news?apikey=${API_KEY}&category=science&language=tr`,
    fallback: `https://newsdata.io/api/1/news?apikey=${API_KEY}&category=science`
  }
};

// Haber basan fonksiyon
function renderNews(list, titleText) {
  feedTitle.textContent = titleText;
  feed.innerHTML = list
    .slice(0, 10)
    .map((item) => {
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
    })
    .join("");
}

// Bir URL’den güvenli haber çek
async function fetchSafe(url) {
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}

// Sekme yükleyici
async function loadCategory(key = "gundem") {
  // türkçe İ / ı saçmalığını düzelt
  key = key.toLowerCase().replace("ı", "i");

  const cfg = CATEGORY_MAP[key];
  if (!cfg) return;

  feedTitle.textContent = cfg.title;
  feed.innerHTML = "<p style='margin:10px 14px'>Yükleniyor...</p>";

  try {
    // önce türkçe olanı dene
    let results = await fetchSafe(cfg.primary);

    // boşsa fallback’e geç
    if ((!results || results.length === 0) && cfg.fallback) {
      results = await fetchSafe(cfg.fallback);
    }

    if (!results || results.length === 0) {
      feed.innerHTML = "<p style='margin:10px 14px'>Bu kategoride haber bulunamadı.</p>";
      return;
    }

    renderNews(results, cfg.title);
  } catch (err) {
    console.error(err);
    feed.innerHTML = "<p style='margin:10px 14px'>Haberler yüklenemedi.</p>";
  }
}

// Sekmelere tıklama
tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = (btn.dataset.cat || btn.textContent.trim().toLowerCase()).replace("ı", "i");
    tabs.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    loadCategory(key);
  });
});

// Arama
searchBtn.addEventListener("click", async () => {
  const q = searchInput.value.trim();
  if (!q) return;

  const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=${encodeURIComponent(
    q
  )}&language=tr`;

  feedTitle.textContent = `"${q}" araması`;
  feed.innerHTML = "<p style='margin:10px 14px'>Yükleniyor...</p>";

  try {
    let results = await fetchSafe(url);

    // türkçe yoksa dilsiz dene
    if (!results || results.length === 0) {
      const url2 = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=${encodeURIComponent(
        q
      )}`;
      results = await fetchSafe(url2);
    }

    if (!results || results.length === 0) {
      feed.innerHTML = "<p style='margin:10px 14px'>Sonuç bulunamadı.</p>";
      return;
    }

    renderNews(results, `"${q}" araması`);
  } catch (e) {
    feed.innerHTML = "<p style='margin:10px 14px'>Arama sırasında hata oluştu.</p>";
  }
});

// açılışta gündem
loadCategory("gundem");
