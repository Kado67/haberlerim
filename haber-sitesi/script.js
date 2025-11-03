// SEKME BUTONLARI
const tabs = document.querySelectorAll(".tab, nav button, .categories button");
const feedTitle = document.getElementById("feedTitle");
const feed = document.getElementById("feed");
const searchInput = document.getElementById("q");
const searchBtn = document.getElementById("searchBtn");

// 1) HER KATEGORİYE BİR RSS
const RSS_SOURCES = {
  gundem: "https://www.trthaber.com/rss/gundem.rss",
  spor: "https://www.trthaber.com/rss/spor.rss",
  teknoloji: "https://www.haberturk.com/rss/teknoloji.xml",
  magazin: "https://www.sozcu.com.tr/rss/magazin.xml",
  saglik: "https://www.trthaber.com/rss/saglik.rss",
  bilim: "https://www.ntv.com.tr/bilim-teknoloji.rss"
};

// 2) RSS İNDİREN FONKSİYON
async function loadCategory(category = "gundem") {
  const rssUrl = RSS_SOURCES[category];
  feed.innerHTML = "Yükleniyor...";
  feedTitle.textContent = categoryName(category);

  if (!rssUrl) {
    feed.innerHTML = "<p>Bu kategori için RSS tanımlı değil.</p>";
    return;
  }

  try {
    // Ücretsiz, keysiz rss2json kullanımı
    const apiUrl =
      "https://api.rss2json.com/v1/api.json?rss_url=" +
      encodeURIComponent(rssUrl);

    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      feed.innerHTML = "<p>Bu kategori için haber alınamadı.</p>";
      return;
    }

    // İlk 10 haberi göster
    const items = data.items.slice(0, 10);

    feed.innerHTML = items
      .map((item) => createNewsCard(item))
      .join("");
  } catch (err) {
    console.error(err);
    feed.innerHTML = "<p>RSS yüklenemedi (servis hatası)</p>";
  }
}

// 3) HABER KARTI HTML’İ
function createNewsCard(item) {
  const img =
    item.enclosure && item.enclosure.link
      ? item.enclosure.link
      : item.thumbnail
      ? item.thumbnail
      : "";

  const pub = item.pubDate ? formatDate(item.pubDate) : "";

  return `
    <article class="news-card">
      ${img ? `<img src="${img}" alt="">` : ""}
      <div class="news-body">
        <h3>${item.title}</h3>
        <p class="meta">${item.author || item.source || ""} • ${pub}</p>
        ${
          item.description
            ? `<p class="desc">${item.description.slice(0, 140)}...</p>`
            : ""
        }
        <a href="${item.link}" target="_blank">Habere git</a>
      </div>
    </article>
  `;
}

// 4) SEKME TIKLAMA
tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    const cat =
      btn.dataset.cat ||
      btn.getAttribute("data-cat") ||
      btn.textContent.toLowerCase();

    // aktif class
    tabs.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    loadCategory(cat);
  });
});

// 5) ARAMA (RSS içinden basit arama)
searchBtn?.addEventListener("click", () => {
  const q = (searchInput?.value || "").toLowerCase();
  if (!q) return;
  // basit çözüm: mevcut listeden filtrele
  const cards = feed.querySelectorAll(".news-card");
  cards.forEach((card) => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(q) ? "" : "none";
  });
});

// ARAÇLAR
function categoryName(key) {
  const map = {
    gundem: "Gündem",
    spor: "Spor",
    teknoloji: "Teknoloji",
    magazin: "Magazin",
    saglik: "Sağlık",
    bilim: "Bilim"
  };
  return map[key] || key;
}

function formatDate(d) {
  try {
    const date = new Date(d);
    return date.toLocaleString("tr-TR");
  } catch {
    return d;
  }
}

// SAYFA AÇILINCA GÜNDEMİ YÜKLE
loadCategory("gundem");
