// KATEGORİ → RSS ADRESLERİ
const RSS_SOURCES = {
  gundem: [
    "https://www.trthaber.com/rss/gundem.rss",
    "https://www.cnnturk.com/feed/rss/category/news"
  ],
  spor: [
    "https://www.trthaber.com/rss/spor.rss",
    "https://www.cnnturk.com/feed/rss/category/spor"
  ],
  teknoloji: [
    "https://www.trthaber.com/rss/bilim-teknoloji.rss"
  ],
  magazin: [
    "https://www.trthaber.com/rss/kultur-sanat.rss"
  ],
  saglik: [
    "https://www.trthaber.com/rss/saglik.rss"
  ],
  bilim: [
    "https://www.trthaber.com/rss/bilim-teknoloji.rss"
  ]
};

// İngilizce gelenleri Türkçeye çevir (emin olmak için)
const CATEGORY_MAP = {
  news: "gundem",
  agenda: "gundem",
  sports: "spor",
  sport: "spor",
  technology: "teknoloji",
  tech: "teknoloji",
  magazine: "magazin",
  health: "saglik",
  science: "bilim"
};

const tabs = document.querySelectorAll("[data-cat]");
const feedTitle = document.getElementById("feedTitle");
const feed = document.getElementById("feed");
const errorBox = document.getElementById("error") || null;

// basit bir yardımcı: hata göster
function showError(msg) {
  if (!errorBox) return;
  errorBox.textContent = msg;
  errorBox.style.display = "block";
}
function hideError() {
  if (!errorBox) return;
  errorBox.style.display = "none";
}

// RSS'i çekip listeye basan ana fonksiyon
async function loadCategory(cat) {
  hideError();

  // İngilizce isim geldiyse çevir
  const realCat = CATEGORY_MAP[cat] || cat;

  // bu kategori için kayıtlı RSS yoksa
  if (!RSS_SOURCES[realCat] || RSS_SOURCES[realCat].length === 0) {
    feedTitle.textContent = capitalize(realCat);
    feed.innerHTML = `<p>Bu kategori için RSS tanımlı değil.</p>`;
    return;
  }

  feedTitle.textContent = capitalize(realCat);
  feed.innerHTML = `<p style="opacity:.6">Yükleniyor...</p>`;

  const urls = RSS_SOURCES[realCat];

  // sırayla dene: ilk çalışanı kullan
  let data = null;
  for (let rssUrl of urls) {
    try {
      // açık bir JSON dönüştürücü kullanıyoruz
      const resp = await fetch(
        "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(rssUrl)
      );
      if (!resp.ok) continue;
      const json = await resp.json();
      if (json && json.items && json.items.length > 0) {
        data = json;
        break;
      }
    } catch (e) {
      // sıradaki url'yi dene
      continue;
    }
  }

  if (!data) {
    feed.innerHTML = "";
    showError("Haberler alınamadı (RSS ulaşılamıyor).");
    return;
  }

  // listeyi çiz
  feed.innerHTML = data.items
    .slice(0, 10) // en fazla 10 haber
    .map(item => {
      const pub = item.pubDate ? item.pubDate.split(" ")[0] : "";
      const img =
        item.thumbnail && item.thumbnail.length
          ? item.thumbnail
          : "";
      return `
        <article class="news-card">
          ${img ? `<img src="${img}" alt="" class="news-img" />` : ""}
          <div class="news-body">
            <h3>${item.title}</h3>
            <p class="meta">${item.author || data.feed.title} • ${pub}</p>
            <p class="desc">${(item.description || "").slice(0, 140)}...</p>
            <a href="${item.link}" target="_blank" class="read-more">Habere git</a>
          </div>
        </article>
      `;
    })
    .join("");
}

// baş harf büyütme
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// sekmelere tıklandığında
tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const cat = btn.dataset.cat;
    loadCategory(cat);
  });
});

// ilk açılışta GÜNDEM
loadCategory("gundem");
