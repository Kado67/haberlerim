// Haber verileri
const newsData = [
  {
    id: 1,
    title: "Yeni Elektrikli Otobüs Hatları Yolda",
    category: "gundem",
    source: "Haberlerim",
    date: "08.11.2025",
    excerpt: "Belediye 50 yeni elektrikli araçla ulaşımı kolaylaştıracak.",
    content: "Belediyeden yapılan açıklamada, 2026 yılı içerisinde 50 yeni elektrikli otobüs hattının devreye alınacağı belirtildi. Proje, hem şehir içi ulaşımı hızlandırmayı hem de karbon salınımını azaltmayı hedefliyor. Yetkililer, durakların da akıllı sistemlerle güncelleneceğini ve mobil uygulama üzerinden anlık otobüs takip imkanı sunulacağını söyledi."
  },
  {
    id: 2,
    title: "Ekonomide 2026 Beklentileri Açıklandı",
    category: "ekonomi",
    source: "Haberlerim",
    date: "08.11.2025",
    excerpt: "Uzmanlar enflasyonda kademeli gerileme bekliyor.",
    content: "Ekonomi yönetiminden alınan sinyaller, 2026 yılı içerisinde fiyat artış hızının düşeceği ve büyüme kalitesinin artacağı yönünde. Analistler, enerji maliyetlerindeki düşüş ve ihracattaki toparlanmanın büyümeyi destekleyeceğini vurguluyor. Dijitalleşme ve yeşil dönüşüm yatırımları da büyümeye katkı sunacak."
  },
  {
    id: 3,
    title: "Süper Lig’de Derbi Heyecanı",
    category: "spor",
    source: "Haberlerim Spor",
    date: "07.11.2025",
    excerpt: "Hafta sonu oynanacak maçta iki ezeli rakip karşı karşıya geliyor.",
    content: "Derbi öncesi her iki takımda da moraller yüksek. Teknik direktörler temkinli açıklamalar yaparken, maçın yüksek tempoda geçmesi bekleniyor. Güvenlik önlemleri artırıldı ve tüm biletler tükendi."
  },
  {
    id: 4,
    title: "Yapay Zekâ Haberciliği Dönüştürüyor",
    category: "teknoloji",
    source: "TeknoHaber",
    date: "07.11.2025",
    excerpt: "Otomatik özetleme ve doğrulama sistemleri yaygınlaşıyor.",
    content: "Yeni nesil yapay zekâ çözümleri, haber odalarında ilk taslakları oluşturup editörlere sunuyor. Bu sayede haber üretim süresi kısalırken, yanlış bilgiye karşı ek kontrol katmanları ekleniyor. Uzmanlar, insan editörün öneminin devam edeceğini vurguluyor."
  },
  {
    id: 5,
    title: "Ünlü Oyuncudan Anlamlı Bağış",
    category: "magazin",
    source: "Magazin Masası",
    date: "07.11.2025",
    excerpt: "Çocuk hastaneleri için destek kampanyası başlatıldı.",
    content: "Ünlü oyuncu sosyal medya hesabından yaptığı paylaşımda çocukların nitelikli sağlık hizmetine ulaşması için bir bağış kampanyası başlattığını duyurdu. Kısa sürede binlerce kişi kampanyaya destek verdi."
  }
];

const newsList = document.getElementById("newsList");
const lastTitles = document.getElementById("lastTitles");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// Haberleri yaz
function renderNews(category = "gundem", search = "") {
  newsList.innerHTML = "";
  const filtered = newsData.filter(n => {
    const cMatch = category ? n.category === category : true;
    const sMatch = n.title.toLowerCase().includes(search.toLowerCase());
    return cMatch && sMatch;
  });

  if (filtered.length === 0) {
    newsList.innerHTML = "<p>Bu kriterlere uygun haber bulunamadı.</p>";
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("article");
    card.className = "news-card";
    card.innerHTML = `
      <h2>${item.title}</h2>
      <div class="news-meta">${item.source} • ${item.date}</div>
      <p>${item.excerpt}</p>
      <a href="#" class="read-more" data-id="${item.id}">Habere git</a>
    `;
    newsList.appendChild(card);
  });

  // detay açma
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
    .map(n => `<li>${n.title}</li>`)
    .join("");
}

// Kategori butonları
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderNews(btn.dataset.category, searchInput.value);
  });
});

// Arama
searchBtn.addEventListener("click", () => {
  const active = document.querySelector(".nav-btn.active")?.dataset.category || "";
  renderNews(active, searchInput.value);
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

// Modal
const modal = document.getElementById("newsModal");
const closeModal = document.getElementById("closeModal");

function openModal(news) {
  document.getElementById("modalTitle").textContent = news.title;
  document.getElementById("modalMeta").textContent = `${news.source} • ${news.date}`;
  document.getElementById("modalText").textContent = news.content;
  modal.style.display = "flex";
}
closeModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

// Yıl
document.getElementById("year").textContent = new Date().getFullYear();

// İlk yükleme
renderNews("gundem");
renderLastTitles();
