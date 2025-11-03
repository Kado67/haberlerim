// Elemanlar
const tabs = document.querySelectorAll(".tab");
const feedTitle = document.getElementById("feedTitle");
const feed = document.getElementById("feed");
const searchInput = document.getElementById("q");
const searchBtn = document.getElementById("searchBtn");

// Senin API key
const API_KEY = "pub_041412110a0644cfb63307b53c733b41";

// Her sekmenin arama kelimesi
const CATEGORY_QUERY = {
  gundem: { title: "Gündem", q: null },           // sadece TR genel
  spor: { title: "Spor", q: "spor" },
  teknoloji: { title: "Teknoloji", q: "teknoloji" },
  magazin: { title: "Magazin", q: "magazin" },
  sağlık: { title: "Sağlık", q: "sağlık" },
  saglik: { title: "Sağlık", q: "sağlık" },        // ihtiyaten
  bilim: { title: "Bilim", q: "bilim" },
};

// Haberleri ekrana bas
function renderNews(list, titleText) {
  feedTitle.textContent = titleText;
  feed.innerHTML = list
    .slice(0, 12)
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

// Güvenli fetch
async function fetchSafe(url) {
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}

// Sekme yükleyici
async function loadCategory(key = "gundem") {
  key = key.toLowerCase().replace("ı", "i"); // teknoloji / saglik için
  const cfg = CATEGORY_QUERY[key];
  if (!cfg) return;

  feedTitle.textContent = cfg.title;
  feed.innerHTML = "<p style='margin:10px 14px'>Yükleniyor...</p>";

  try {
    let results;

    if (cfg.q) {
      // önce TR + kelime
      const urlTr = `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=tr&q=${encodeURIComponent(
        cfg.q
      )}`;
      results = await fetchSafe(urlTr);

      // TR boşsa dilsiz aynı kelime
      if (!results || results.length === 0) {
        const urlAny = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=${encodeURIComponent(
          cfg.q
        )}`;
        results = await fetchSafe(urlAny);
      }
    } else {
      // gündem
      const urlTr = `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=tr&language=tr`;
      results = await fetchSafe(urlTr);
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

// Sekme tıklama
tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key =
      (btn.dataset.cat || btn.textContent.trim().toLowerCase()).replace("ı", "i");
    tabs.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    loadCategory(key);
  });
});

// Arama
searchBtn.addEventListener("click", async () => {
  const q = searchInput.value.trim();
  if (!q) return;

  feedTitle.textContent = `"${q}" araması`;
  feed.innerHTML = "<p style='margin:10px 14px'>Yükleniyor...</p>";

  try {
    let results = await fetchSafe(
      `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=tr&q=${encodeURIComponent(
        q
      )}`
    );

    if (!results || results.length === 0) {
      results = await fetchSafe(
        `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=${encodeURIComponent(q)}`
      );
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

// açılış
loadCategory("gundem");
