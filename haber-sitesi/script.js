// Sekmeler
const tabs = document.querySelectorAll(".tab");
const feedTitle = document.getElementById("feedTitle");
const feedContainer = document.getElementById("feed");
const errorBox = document.getElementById("errorBox");

// KATEGORİ → NEWSDATA.IO QUERY
const CATEGORY_QUERY = {
  gundem: "gündem",
  spor: "spor",
  teknoloji: "teknoloji",
  magazin: "magazin",
  sağlık: "sağlık",
  bilim: "bilim"
};

// 🔑 Senin API Anahtarın
const API_KEY = "pub_041412110a0644cfb63307b53c733b41";

// Haberleri yükleyen fonksiyon
async function loadNews(category = "gundem") {
  feedContainer.innerHTML = "Yükleniyor...";
  if (errorBox) {
    errorBox.textContent = "";
    errorBox.style.display = "none";
  }

  const query = CATEGORY_QUERY[category] || "gündem";
  const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=tr&q=${encodeURIComponent(
    query
  )}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data || data.status !== "success" || !data.results) {
      throw new Error("API döndü ama sonuç yok");
    }

    if (feedTitle) {
      feedTitle.textContent =
        category === "gundem" ? "Gündem" : category.toUpperCase();
    }

    feedContainer.innerHTML = data.results
      .slice(0, 8)
      .map(item => {
        const title = item.title || "Başlık yok";
        const link = item.link || "#";
        const source = item.source_id ? ` (${item.source_id})` : "";
        const date = item.pubDate
          ? new Date(item.pubDate).toLocaleString("tr-TR")
          : "";
        return `
          <div style="border-bottom:1px solid #444; padding:10px 0;">
            <h3 style="margin:0 0 4px 0;">
              <a href="${link}" target="_blank" style="color:#fff; text-decoration:none;">${title}</a>
            </h3>
            <small style="color:#aaa;">${date}${source}</small>
          </div>
        `;
      })
      .join("");

    if (feedContainer.innerHTML.trim() === "") {
      feedContainer.innerHTML = "Bu kategoride haber bulunamadı.";
    }
  } catch (err) {
    console.error("Newsdata hatası:", err);
    feedContainer.innerHTML = "";
    if (errorBox) {
      errorBox.textContent = "Haberler yüklenemedi (servis hatası)";
      errorBox.style.display = "block";
    } else {
      feedContainer.innerHTML = "Haberler yüklenemedi.";
    }
  }
}

// Sekme tıklama
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const cat = tab.getAttribute("data-cat");
    loadNews(cat);
  });
});

// İlk açılışta gündem haberlerini yükle
loadNews("gundem");
