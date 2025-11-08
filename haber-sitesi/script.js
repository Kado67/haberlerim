// 1) RSS kaynakları (tarayıcıdan direkt deneyeceğiz)
const RSS_SOURCES = {
  gundem: "https://api.rss2json.com/v1/api.json?rss_url=https://www.trthaber.com/manset_articles.rss",
  ekonomi: "https://api.rss2json.com/v1/api.json?rss_url=https://www.trthaber.com/ekonomi.rss",
  spor: "https://api.rss2json.com/v1/api.json?rss_url=https://www.trthaber.com/spor.rss",
  teknoloji: "https://api.rss2json.com/v1/api.json?rss_url=https://www.trthaber.com/bilim-teknik.rss",
  magazin: "https://api.rss2json.com/v1/api.json?rss_url=https://www.trthaber.com/kultur-sanat.rss"
};

// 2) RSS çalışmazsa kullanılacak yedek haberler
const FALLBACK_NEWS = [
  {
    title: "Dijital belediyecilik projeleri 2026'ya kadar yaygınlaşacak",
    category: "gundem",
    date: new Date().toLocaleDateString("tr-TR"),
    description: "Belediyeler e-ruhsat, e-vergi ve çevrimiçi randevu sistemlerini tek çatı altında topluyor.",
    content: "Belediyelerin dijital dönüşüm hamlesiyle vatandaşın temel hizmetlere 7/24 erişimi hedefleniyor. Uygulamalar sayesinde işlemler dakikalar içinde tamamlanabilecek."
  },
  {
    title: "Ekonomide orta vadede kademeli toparlanma beklentisi",
    category: "ekonomi",
    date: new Date().toLocaleDateString("tr-TR"),
    description: "Uzmanlar enflasyonda gevşeme ve yatırım iştahında artış öngörüyor.",
    content: "Bütçe disiplininin korunması ve ihracatçı sektörlerin desteklenmesiyle büyümenin kalitesinin yükseleceği ifade ediliyor."
  },
  {
    title: "Süper Lig'de zirve yarışı kızışıyor",
    category: "spor",
    date: new Date().toLocaleDateString("tr-TR"),
    description: "Bu hafta alınacak sonuçlar liderliği etkileyebilir.",
    content: "Takımların geniş kadroları ve genç oyuncuların performansı lig kalitesini yukarı taşıyor."
  },
  {
    title: "Yapay zekâ destekli çözümler yaygınlaşıyor",
    category: "teknoloji",
    date: new Date().toLocaleDateString("tr-TR"),
    description: "KOBİ'ler de bulut ve otomasyon sistemlerine ilgi gösteriyor.",
    content: "Siber güvenlik ve veri koruma ise dijitalleşen tüm kurumlar için öncelik olmaya devam ediyor."
  },
  {
    title: "Ünlü isimlerden sosyal sorumluluk kampanyalarına destek",
    category: "magazin",
    date: new Date().toLocaleDateString("tr-TR"),
    description: "Eğitim ve sağlık odaklı projeler kısa sürede ilgi topladı.",
    content: "Dijital platformlar sayesinde kampanyalara katılımın daha kolay olduğu vurgulanıyor."
  }
];

let newsData = [];

const newsList = document.getElementById("newsList");
const lastTitles = document.getElementById("lastTitles");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const themeToggle = document.getElementById("themeToggle");
const modal = document.getElementById("newsModal");
const closeModal = document.getElementById("closeModal");

// footer yılı
document.getElementById("year").textContent = new Date().getFullYear();

// Tüm RSS'leri çekmeyi dener
async function loadAllNews() {
  const collected = [];

  for (const [cat, url] of Object.entries(RSS_SOURCES)) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.items) {
        data.items.slice(0, 6).forEach(item => {
          collected.push({
            id: collected.length + 1,
            title: item.title,
            category: cat,
            date: new Date(item.pubDate || Date.now()).toLocaleDateString("tr-TR"),
            description: (item.description || "").replace(/<[^>]*>?/gm, "").slice(0, 220) + "...",
            content: (item.content || item.description || "").replace(/<[^>]*>?/gm, "")
          });
        });
      }
    } catch (err) {
      // bu kategori gelmezse geçiyoruz
    }
  }

  if (collected.length === 0) {
    // hiçbiri gelmediyse fallback'i kullan
    newsData = FALLBACK_NEWS.map((n, i) => ({
      id: i + 1,
      title: n.title,
      category: n.category,
      date: n.date,
      description: n.description,
      content: n.content
    }));
  } else {
    newsData = collected;
  }

  renderNews("hepsi");
  renderLastTitles();
}

// Haberleri listeye bas
function renderNews(category = "hepsi", search = "") {
  newsList.innerHTML = "";

  const filtered = newsData.filter(n => {
    const c = category === "hepsi" ? true : n.category === category;
    const s = n.title.toLowerCase().includes(search.toLowerCase());
    return c && s;
  });

  if (filtered.length === 0) {
    newsList.innerHTML = "<p>Bu kriterlere uygun haber bulunamadı.</p>";
    return;
  }

  filtered.forEach(item => {
    const el = document.createElement("article");
    el.className = "news-card";
    el.innerHTML = `
      <h2>${item.title}</h2>
      <div class="news-meta">${item.category.toUpperCase()} • ${item.date}</div>
      <p>${item.description}</p>
      <a href="#" class="read-more" data-id="${item.id}">Habere git</a>
    `;
    newsList.appendChild(el);
  });

  // modal açma
  document.querySelectorAll(".read-more").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const id = link.dataset.id;
      const news = newsData.find(n => n.id == id);
      openModal(news);
    });
  });
}

// Son başlıklar
function renderLastTitles() {
  lastTitles.innerHTML = newsData
    .slice(0, 10)
    .map(n => `<li>${n.title}</li>`)
    .join("");
}

// Modal
function openModal(news) {
  document.getElementById("modalTitle").textContent = news.title;
  document.getElementById("modalMeta").textContent = `${news.category.toUpperCase()} • ${news.date}`;
  document.getElementById("modalText").textContent = news.content || news.description;
  modal.style.display = "flex";
}
closeModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

// Kategori tıklama
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderNews(btn.dataset.category, searchInput.value);
  });
});

// Arama
searchBtn.addEventListener("click", () => {
  const active = document.querySelector(".nav-btn.active")?.dataset.category || "hepsi";
  renderNews(active, searchInput.value);
});
searchInput.addEventListener("keyup", e => {
  if (e.key === "Enter") searchBtn.click();
});

// Tema
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// Sayfa açılınca
loadAllNews();
