const newsData = [
  {
    id: 1,
    title: "Ekonomide 2026 Beklentileri Açıklandı",
    category: "ekonomi",
    source: "Haberlerim",
    date: "08.11.2025",
    excerpt: "Uzmanlar 2026 yılında enflasyonda kademeli bir düşüş bekliyor.",
    content: "Küresel ekonomide dengelenme süreci devam ederken Türkiye'de büyümenin sürdürülebilir seviyede kalması hedefleniyor. Enerji fiyatlarındaki düşüş ve dijital dönüşüm yatırımları, 2026'da ekonomiye ivme kazandıracak."
  },
  {
    id: 2,
    title: "Yeni Elektrikli Otobüs Hatları Yolda",
    category: "gundem",
    source: "Haberlerim",
    date: "08.11.2025",
    excerpt: "Belediye 50 yeni elektrikli araçla ulaşımı kolaylaştıracak.",
    content: "Belediye Başkanı yaptığı açıklamada, çevre dostu ulaşım için 2026 yılına kadar 50 yeni elektrikli otobüs hattının hizmete alınacağını belirtti. Bu adım, karbon salınımını yılda 15 bin ton azaltacak."
  },
  {
    id: 3,
    title: "Süper Lig’de Derbi Heyecanı",
    category: "spor",
    source: "Haberlerim Spor",
    date: "07.11.2025",
    excerpt: "Hafta sonu oynanacak derbi öncesi taraftarlar heyecanlı.",
    content: "Ligin zirvesini yakından ilgilendiren mücadelede iki ezeli rakip karşı karşıya geliyor. Güvenlik önlemleri artırılırken, biletler satışa çıktığı anda tükendi."
  },
  {
    id: 4,
    title: "Yapay Zekâ Haberciliği Dönüştürüyor",
    category: "teknoloji",
    source: "TeknoHaber",
    date: "07.11.2025",
    excerpt: "Yeni nesil haber sistemleri haberciliği dijitalleştiriyor.",
    content: "Yapay zekâ algoritmaları artık haber başlıklarını ve özetlerini otomatik üretebiliyor. Uzmanlara göre, insan denetimiyle desteklenen bu sistem, habercilikte doğruluk oranını artıracak."
  },
  {
    id: 5,
    title: "Ünlü Oyuncudan Anlamlı Bağış",
    category: "magazin",
    source: "Magazin Masası",
    date: "07.11.2025",
    excerpt: "Çocuk hastaneleri için destek kampanyası başlatıldı.",
    content: "Ünlü oyuncu, çocuk sağlığı için yürütülen kampanyaya 2 milyon TL bağışta bulundu. Sosyal medyada büyük takdir topladı."
  }
];

const newsList = document.getElementById("newsList");
const lastTitles = document.getElementById("lastTitles");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// Haberleri listele
function renderNews(category = "", search = "") {
  newsList.innerHTML = "";
  const filtered = newsData.filter(n =>
    (category ? n.category === category : true) &&
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  filtered.forEach(item => {
    const card = document.createElement("article");
    card.className = "news-card";
    card.innerHTML = `
      <h2>${item.title}</h2>
      <div class="news-meta">${item.source} • ${item.date}</div>
      <p>${item.excerpt}</p>
      <a href="#" data-id="${item.id}" class="readMore">Habere git</a>
    `;
    newsList.appendChild(card);
  });

  // Detay açma
  document.querySelectorAll(".readMore").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const news = newsData.find(n => n.id == link.dataset.id);
      openModal(news);
    });
  });
}

// Modal aç/kapat
const modal = document.getElementById("newsModal");
const closeModal = document.getElementById("closeModal");

function openModal(news) {
  document.getElementById("modalTitle").textContent = news.title;
  document.getElementById("modalMeta").textContent = `${news.source} • ${news.date}`;
  document.getElementById("modalText").textContent = news.content;
  modal.style.display = "flex";
}
closeModal.onclick = () => (modal.style.display = "none");
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

// Kategoriler
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderNews(btn.dataset.category, searchInput.value);
  });
});

// Arama
searchBtn.addEventListener("click", () => {
  const active = document.querySelector(".nav-btn.active")?.dataset.category;
  renderNews(active, searchInput.value);
});
searchInput.addEventListener("keyup", e => e.key === "Enter" && searchBtn.click());

// Tema
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// Yıl ve başlat
document.getElementById("year").textContent = new Date().getFullYear();
renderNews("gundem");
lastTitles.innerHTML = newsData.map(n => `<li>${n.title}</li>`).join("");
