// SEKME VE ALANLAR
const tabs = document.querySelectorAll(".tab");
const feedTitle = document.getElementById("feedTitle");
const feedBox = document.getElementById("feed");
const errorBox = document.getElementById("errorBox");

// 1) SADECE GÜNDEM API'DEN
const NEWSDATA_API_KEY = "pub_ee04dcfcf6b54339b4bc667b529dea62";
const GUNDEM_URL =
  `https://newsdata.io/api/1/latest?apikey=${NEWSDATA_API_KEY}&country=tr&language=tr&category=top`;

// 2) DİĞERLERİ RSS'TEN (rss2json ile)
const RSS_SOURCES = {
  spor: "https://www.trthaber.com/rss/spor.rss",
  teknoloji: "https://www.trthaber.com/rss/bilim-teknik.rss",
  magazin: "https://www.trthaber.com/rss/kultur-sanat.rss",
  saglik: "https://www.trthaber.com/rss/saglik.rss",
  bilim: "https://www.trthaber.com/rss/bilim-teknik.rss"
  // istersen buraya başka kaynaklar da ekleyebiliriz
};

// EKRANI TEMİZLE
function clearFeed() {
  feedBox.innerHTML = "";
  if (errorBox) {
    errorBox.textContent = "";
    errorBox.style.display = "none";
  }
}

// HABER KARTI ÇİZ
function renderItems(items, from = "api") {
  clearFeed();

  if (!items || items.length === 0) {
    feedBox.innerHTML = "<p>Bu kategoride haber bulunamadı.</p>";
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "news-card";

    const imgUrl =
      item.image_url ||
      item.enclosure?.link ||
      item.thumbnail ||
      "";

    card.innerHTML = `
      ${imgUrl ? `<img class="news-img" src="${imgUrl}" alt="">` : ""}
      <div class="news-content">
        <h3>${item.title || item?.title?.rendered || "Başlık yok"}</h3>
        <p class="meta">
          ${(item.source_id || item.author || "kaynak")} • ${(item.pubDate || item.published_at || item.pubDate?.split(" ")[0] || "")}
        </p>
        <p class="desc">${item.description ? item.description.slice(0, 140) + "..." : ""}</p>
        <a class="read-more" href="${item.link || item.url}" target="_blank" rel="noopener noreferrer">Habere git</a>
      </div>
    `;
    feedBox.appendChild(card);
  });
}

// GÜNDEMİ API'DEN ÇEK
async function loadGundem() {
  try {
    feedTitle.textContent = "Gündem";
    clearFeed();
    const res = await fetch(GUNDEM_URL);
    const data = await res.json();
    // newsdata.io sonuçları data.results içinde
    renderItems(data.results || []);
  } catch (err) {
    console.error(err);
    if (errorBox) {
      errorBox.textContent = "Gündem yüklenemedi (API hatası)";
      errorBox.style.display = "block";
    }
  }
}

// RSS ÇEKEN FONKSİYON
async function loadRss(categoryKey) {
  const rssUrl = RSS_SOURCES[categoryKey];
  if (!rssUrl) {
    feedBox.innerHTML = "<p>Bu kategori için RSS tanımlı değil.</p>";
    return;
  }

  // rss2json servisi ile CORS’u aş
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  try {
    clearFeed();
    const res = await fetch(apiUrl);
    const data = await res.json();

    // rss2json verileri data.items içinde
    const items = (data.items || []).map((it) => ({
      title: it.title,
      link: it.link,
      description: it.description,
      pubDate: it.pubDate,
      image_url: it.enclosure ? it.enclosure.link : "",
      source_id: data.feed ? data.feed.title : ""
    }));

    renderItems(items);
  } catch (err) {
    console.error(err);
    if (errorBox) {
      errorBox.textContent = "RSS yüklenemedi (servis hatası)";
      errorBox.style.display = "block";
    }
  }
}

// SEKME TIKLAMALARI
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    // aktif sekmeyi değiştir
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    // data-cat Türkçe karakter olabilir, normalize edelim
    const cat = (tab.dataset.cat || "").toLowerCase();

    if (cat === "gündem" || cat === "gundem") {
      feedTitle.textContent = "Gündem";
      loadGundem(); // SADECE BURADA API
    } else {
      // diğerleri RSS
      feedTitle.textContent = tab.textContent.trim();
      // türkçe karakterleri key'e uyduralım
      const key = cat
        .replace("ğ", "g")
        .replace("ü", "u")
        .replace("ş", "s")
        .replace("ı", "i")
        .replace("ö", "o")
        .replace("ç", "c");
      loadRss(key);
    }
  });
});

// SAYFA AÇILINCA ÖNCE GÜNDEM
loadGundem();
