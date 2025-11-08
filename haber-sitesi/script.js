// Otomatik kaynaklardan çekmeye çalışacağımız RSS adresleri
// rss2json ücretsiz servisle JSON'a çeviriyoruz
const RSS_SOURCES = {
  gundem: "https://www.trthaber.com/manset_articles.rss",
  ekonomi: "https://www.trthaber.com/ekonomi.rss",
  spor: "https://www.trthaber.com/spor.rss",
  teknoloji: "https://www.trthaber.com/bilim-teknik.rss",
  magazin: "https://www.trthaber.com/kultur-sanat.rss"
};

// Eğer RSS çekemezsek göstereceğimiz uzun yedek haberler
const FALLBACK_LONG = {
  gundem: "Türkiye’nin farklı şehirlerinde yürütülen ulaşım, altyapı ve dijital belediyecilik projeleri 2026 yılına kadar genişletilecek. Yerel yönetimler, özellikle toplu taşıma ve acil durum yönetimi alanlarında akıllı sistemlere yöneliyor. Bu sayede hem trafik yoğunluğu azaltılacak hem de vatandaşın belediye hizmetlerine erişimi hızlanacak. Uzmanlar, bu yatırımların aynı zamanda istihdam yaratacağını ve şehirlerin yaşam kalitesini artıracağını belirtiyor.",
  ekonomi: "Ekonomi çevreleri, fiyat istikrarı ve üretim odaklı büyümenin önümüzdeki dönemin en kritik başlığı olacağı görüşünde. Yatırımcıların özellikle dijitalleşme ve enerji verimliliği alanlarına ilgisi artıyor. Enflasyonda kademeli bir düşüş beklentisi olsa da bunun için mali disiplinin sürmesi ve ihracatçı sektörlerin desteklenmesi gerektiği vurgulanıyor. Analistler, kur tarafında sert hareketler beklemiyor.",
  spor: "Süper Lig’de bu sezon hem zirve yarışı hem de alt sıralar olağanüstü derecede çekişmeli geçiyor. Takımların geniş kadro kurması, genç oyuncuların daha fazla süre alması ve ekonomik disiplin çabaları futbolun kalitesini yükseltiyor. Kulüpler, maç günü gelirlerinin yanı sıra dijital platformlara ve lisanslı ürünlere yönelerek yeni gelir kalemleri oluşturmaya çalışıyor.",
  teknoloji: "Dijital dönüşüm ve yapay zekâ, hem kamu sektörünü hem de özel sektörü doğrudan etkiliyor. Bulut tabanlı çözümler, uzaktan çalışma altyapıları ve akıllı şehir uygulamaları artık daha ulaşılabilir. Bununla birlikte siber güvenlik tehditleri de arttığı için kurumların sadece teknik değil eğitim odaklı önlemler alması gerekiyor.",
  magazin: "Sanat ve eğlence dünyasında sosyal sorumluluk projelerine destek artıyor. Ünlü isimler eğitim, sağlık ve çevre temalı kampanyalarda yer alarak hem farkındalık oluşturuyor hem de bağışların artmasına katkı sunuyor. Dijital platformlar sayesinde hayranlarla doğrudan iletişim kurulması da bu projelerin daha geniş kitlelere ulaşmasını sağlıyor."
};

// Burada toplanan haberler tutulacak
let newsData = [];

// RSS'i JSON'a çeviren URL
const rssToJson = (rssUrl) =>
  "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(rssUrl);

// DOM elemanları
const newsList = document.getElementById("newsList");
const lastTitles = document.getElementById("lastTitles");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const themeToggle = document.getElementById("themeToggle");
const modal = document.getElementById("newsModal");
const closeModal = document.getElementById("closeModal");

// sayfa altındaki yılı yaz
document.getElementById("year").textContent = new Date().getFullYear();

// Tüm RSS kaynaklarını sırayla al
async function loadAllNews() {
  const collected = [];

  for (const [category, rssUrl] of Object.entries(RSS_SOURCES)) {
    try {
      const res = await fetch(rssToJson(rssUrl));
      const data = await res.json();

      if (data && data.items) {
        data.items.slice(0, 5).forEach((item) => {
          collected.push({
            id: collected.length + 1,
            title: item.title,
            category,
            date: new Date(item.pubDate || Date.now()).toLocaleDateString("tr-TR"),
            description: (item.description || "")
              .replace(/<[^>]*>?/gm, "")
              .slice(0, 220) + "...",
            content:
              (item.content || item.description || "").replace(/<[^>]*>?/gm, "") ||
              FALLBACK_LONG[category] ||
              ""
          });
        });
      }
    } catch (err) {
      // sessiz geçiyoruz, sonra fallback basarız
    }
  }

  if (collected.length === 0) {
    // Hiçbir RSS gelmediyse yedekleri bas
    newsData = Object.keys(FALLBACK_LONG).map((cat, i) => ({
      id: i + 1,
      title: cat === "gundem" ? "Gündemde Son Durum" :
             cat === "ekonomi" ? "Ekonomide Beklentiler" :
             cat === "spor" ? "Spor Gündemi" :
             cat === "teknoloji" ? "Teknolojide Yeni Dönem" :
             "Magazin Dünyasında Gelişmeler",
      category: cat,
      date: new Date().toLocaleDateString("tr-TR"),
      description: FALLBACK_LONG[cat].slice(0, 180) + "...",
      content: FALLBACK_LONG[cat]
    }));
  } else {
    newsData = collected;
  }

  renderNews("hepsi");
  renderLastTitles();
}

// Haberleri yazdır
function renderNews(category = "hepsi", search = "") {
  newsList.innerHTML = "";

  const filtered = newsData.filter((n) => {
    const catOk = category === "hepsi" ? true : n.category === category;
    const searchOk = n.title.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk;
  });

  if (filtered.length === 0) {
    newsList.innerHTML = "<p>Bu kriterlere uygun haber bulunamadı.</p>";
    return;
  }

  filtered.forEach((item) => {
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

  // detay tıklama
  document.querySelectorAll(".read-more").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.dataset.id;
      const news = newsData.find((n) => n.id == id);
      openModal(news);
    });
  });
}

// sağ taraftaki başlıklar
function renderLastTitles() {
  lastTitles.innerHTML = newsData
    .slice(0, 10)
    .map((n) => `<li>${n.title}</li>`)
    .join("");
}

// modal aç
function openModal(news) {
  document.getElementById("modalTitle").textContent = news.title;
  document.getElementById("modalMeta").textContent =
    `${news.category.toUpperCase()} • ${news.date}`;
  document.getElementById("modalText").textContent = news.content || news.description;
  modal.style.display = "flex";
}

// modal kapat
document.getElementById("closeModal").addEventListener("click", () => {
  modal.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// kategori tıklama
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderNews(btn.dataset.category, searchInput.value);
  });
});

// arama
searchBtn.addEventListener("click", () => {
  const activeCat =
    document.querySelector(".nav-btn.active")?.dataset.category || "hepsi";
  renderNews(activeCat, searchInput.value);
});
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

// tema
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// sayfa açılınca haberleri getir
loadAllNews();
