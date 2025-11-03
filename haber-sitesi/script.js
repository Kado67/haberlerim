const tabs = document.querySelectorAll(".tab");
const feedTitle = document.getElementById("feedTitle");
const feed = document.getElementById("feed");
const searchInput = document.getElementById("q");
const searchBtn = document.getElementById("searchBtn");

// 🔑 Senin NewsData API key’in
const API_KEY = "pub_041412110a0644cfb63307b53c733b41";

// 📰 Kategoriye göre haberleri yükle
async function loadCategory(category = "top") {
  const trNames = {
    top: "Gündem",
    sports: "Spor",
    technology: "Teknoloji",
    entertainment: "Magazin",
    health: "Sağlık",
    science: "Bilim",
  };

  feedTitle.textContent = trNames[category] || "Haberler";

  const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=tr&language=tr&category=${category}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      feed.innerHTML = "<p>Bu kategoride haber bulunamadı.</p>";
      return;
    }

    feed.innerHTML = data.results
      .slice(0, 10)
      .map((item) => {
        const img = item.image_url
          ? `<div class="news-thumb"><img src="${item.image_url}" alt=""></div>`
          : `<div class="news-thumb"><div class="no-img"></div></div>`;
        return `
          <a class="news-card" href="${item.link}" target="_blank" rel="noopener">
            ${img}
            <div class="news-body">
              <h3>${item.title || "Başlık yok"}</h3>
              <div class="meta">
                ${item.source_id || ""} • ${item.pubDate || ""}
              </div>
            </div>
          </a>
        `;
      })
      .join("");
  } catch (err) {
    console.error(err);
    feed.innerHTML = "<p>Haberler yüklenemedi (servis hatası).</p>";
  }
}

// 🔍 Arama işlevi
searchBtn.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  if (!query) return;
  const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=tr&language=tr&q=${encodeURIComponent(
    query
  )}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    feedTitle.textContent = `"${query}" için sonuçlar`;
    feed.innerHTML = data.results
      .map(
        (item) => `
      <a class="news-card" href="${item.link}" target="_blank">
        <div class="news-thumb">
          <img src="${item.image_url || ""}" alt="">
        </div>
        <div class="news-body">
          <h3>${item.title}</h3>
          <div class="meta">${item.source_id || ""} • ${item.pubDate || ""}</div>
        </div>
      </a>`
      )
      .join("");
  } catch (e) {
    feed.innerHTML = "<p>Arama sırasında hata oluştu.</p>";
  }
});

// 🧭 Sekme tıklama olayları
tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    loadCategory(btn.dataset.cat);
  });
});

// Sayfa açılınca “Gündem” yüklensin
loadCategory("top");
