const newsData = [
  {
    id: 1,
    title: "Ekonomide 2026 beklentileri açıklandı",
    category: "ekonomi",
    source: "Haberlerim",
    date: "08.11.2025",
    excerpt: "Uzmanlar 2026 yılında enflasyonda kademeli bir düşüş bekliyor.",
    link: "#"
  },
  {
    id: 2,
    title: "Yeni elektrikli otobüs hatları yolda",
    category: "gundem",
    source: "Haberlerim",
    date: "08.11.2025",
    excerpt: "Belediye 50 yeni elektrikli araçla ulaşımı kolaylaştıracak.",
    link: "#"
  },
  {
    id: 3,
    title: "Süper Lig’de derbi heyecanı",
    category: "spor",
    source: "Haberlerim Spor",
    date: "07.11.2025",
    excerpt: "Hafta sonu oynanacak derbi öncesi taraftarlar heyecanlı.",
    link: "#"
  },
  {
    id: 4,
    title: "Yapay zekâ haberciliği dönüştürüyor",
    category: "teknoloji",
    source: "TeknoHaber",
    date: "07.11.2025",
    excerpt: "Yeni nesil haber üretim sistemleri devreye alındı.",
    link: "#"
  },
  {
    id: 5,
    title: "Ünlü oyuncudan anlamlı bağış",
    category: "magazin",
    source: "Magazin Masası",
    date: "07.11.2025",
    excerpt: "Çocuk hastaneleri için destek kampanyası başlatıldı.",
    link: "#"
  }
];

const newsList = document.getElementById("newsList");
const lastTitles = document.getElementById("lastTitles");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// Haberleri listele
function renderNews(filterCategory = "", searchText = "") {
  newsList.innerHTML = "";
  const filtered = newsData.filter(item => {
    const cat = filterCategory ? item.category === filterCategory : true;
    const search = item.title.toLowerCase().includes(searchText.toLowerCase());
    return cat && search;
  });

  if (filtered.length === 0) {
    newsList.innerHTML = "<p>Bu kategoride haber bulunamadı.</p>";
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("article");
    card.className = "news-card";
    card.innerHTML = `
      <h2>${item.title}</h2>
      <div class="news-meta">${item.source} • ${item.date}</div>
      <p>${item.excerpt}</p>
      <a href="${item.link}">Habere git</a>
    `;
    newsList.appendChild(card);
  });
}

// Son başlıklar
function renderLastTitles() {
  lastTitles.innerHTML = "";
  newsData.slice(0, 5).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.title;
    lastTitles.appendChild(li);
  });
}

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
  const activeCat = document.querySelector(".nav-btn.active")?.dataset.category;
  renderNews(activeCat, searchInput.value);
});

searchInput.addEventListener("keyup", e => {
  if (e.key === "Enter") searchBtn.click();
});

// Tema
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// Yıl
document.getElementById("year").textContent = new Date().getFullYear();

// Başlat
renderNews("gundem");
renderLastTitles();
