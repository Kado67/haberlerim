// Sekmeler
const tabs = document.querySelectorAll(".tab");
const feedTitle = document.getElementById("feedTitle");
const feed = document.getElementById("feed");
const errorBox = document.getElementById("errorBox");

// BURAYA SENİN NEWSDATA.IO API ANAHTARIN
const API_KEY = "pub_041412110a0644cfb63307b53c733b41";

// Newsdata kategorilerini bizim sekmelere bağla
// (senin sekmelerin: gundem, spor, teknoloji, magazin, sağlik, bilim)
const CATEGORY_MAP = {
  gundem: "top",
  spor: "sports",
  teknoloji: "technology",
  magazin: "entertainment",
  sağlik: "health",
  bilim: "science"
};

// haberleri ekrana basan fonksiyon
function renderNews(articles = []) {
  // hiç haber yoksa
  if (!articles.length) {
    feed.innerHTML = "<p>Bu kategoride haber bulunamadı.</p>";
    return;
  }

  feed.innerHTML = articles
    .map((item) => {
      const title = item.title || "Haber başlığı yok";
      const link = item.link || item.url || "#";
      const source = item.source_id || item.source || "";
      const date = item.pubDate || item.pub_date || "";
      const img = item.image_url || item.image || "";

      return `
        <a class="news-card" href="${link}" target="_blank" rel="noopener">
          <div class="news-thumb">
            ${
              img
                ? `<img src="${img}" alt="${title}" />`
                : `<div class="no-img"></div>`
            }
          </div>
          <div class="news-body">
            <h3>${title}</h3>
            <p class="meta">
              ${source ? source : ""} ${date ? " • " + date : ""}
            </p>
          </div>
        </a>
      `;
    })
    .join("");
}

// api'den haber çeken fonksiyon
async function loadCategory(cat = "gundem") {
  // kullanacağımız newsdata kategorisi
  const ndCat = CATEGORY_MAP[cat] || "top";
  const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=tr&country=tr&category=${ndCat}`;

  // başlığı değiştir
  if (feedTitle) {
    feedTitle.textContent =
      cat.charAt(0).toUpperCase() + cat.slice(1) + "";
  }

  // hata kutusunu sakla
  if (errorBox) errorBox.style.display = "none";

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "success") {
      throw new Error("API hata döndürdü");
    }

    const results = data.results || data.articles || [];
    renderNews(results);
  } catch (err) {
    console.error(err);
    if (errorBox) {
      errorBox.textContent = "Haberler yüklenemedi (API / servis hatası)";
      errorBox.style.display = "block";
    }
    feed.innerHTML = "";
  }
}

// sekme tıklamaları
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const cat = tab.dataset.cat; // data-cat="gundem" gibi
    loadCategory(cat);
  });
});

// sayfa açılınca ilk kategoriyi yükle
loadCategory("gundem");
