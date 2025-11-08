// daha çok haber ekledim ki boşluk olmasın
const newsData = [
  {
    id: 1,
    title: "Yeni Elektrikli Otobüs Hatları Yolda",
    category: "gundem",
    source: "Haberlerim",
    date: "08.11.2025",
    excerpt: "Belediye 50 yeni elektrikli araçla ulaşımı kolaylaştıracak.",
    content: "Belediye yetkilileri, şehir içi ulaşımda karbon ayak izini azaltmak için elektrikli otobüs filosunu genişleteceklerini açıkladı. 2026'ya kadar yeni duraklar da eklenecek ve vatandaşlar mobil uygulama üzerinden anlık takip yapabilecek."
  },
  {
    id: 2,
    title: "Ekonomide 2026 Beklentileri Açıklandı",
    category: "ekonomi",
    source: "Haberlerim",
    date: "08.11.2025",
    excerpt: "Uzmanlar enflasyonda kademeli gerileme bekliyor.",
    content: "Ekonomistler, 2026'da sıkı para politikalarının etkisinin daha net görüleceğini, bunun da fiyat istikrarına katkı sunacağını belirtiyor. İç talep ve ihracattaki dengelenme büyüme kalitesini artırabilir."
  },
  {
    id: 3,
    title: "Süper Lig’de Derbi Heyecanı",
    category: "spor",
    source: "Haberlerim Spor",
    date: "07.11.2025",
    excerpt: "Hafta sonu iki ezeli rakip karşı karşıya geliyor.",
    content: "Karşılaşma öncesi her iki takımda da eksikler bulunmuyor. Taraftarların stadyuma erken gelmesi istendi, şehir genelinde güvenlik önlemleri artırıldı."
  },
  {
    id: 4,
    title: "Yapay Zekâ Haberciliği Dönüştürüyor",
    category: "teknoloji",
    source: "TeknoHaber",
    date: "07.11.2025",
    excerpt: "Otomatik özetleme ve doğrulama sistemleri yaygınlaşıyor.",
    content: "Haber merkezlerinde kullanılan yeni yapay zekâ araçları, metinleri anlık olarak özetleyip editörlere sunuyor. Uzmanlar, insan kontrolünün hâlâ şart olduğunu vurguluyor."
  },
  {
    id: 5,
    title: "Ünlü Oyuncudan Anlamlı Bağış",
    category: "magazin",
    source: "Magazin Masası",
    date: "07.11.2025",
    excerpt: "Çocuk hastaneleri için bağış kampanyası başlatıldı.",
    content: "Ünlü oyuncu, sosyal medya hesabında yaptığı canlı yayında kampanyayı duyurdu ve kısa sürede binlerce kişi destek verdi."
  },
  {
    id: 6,
    title: "Konut Kiralarında Yerel Düzenleme Gündemde",
    category: "gundem",
    source: "Haberlerim",
    date: "06.11.2025",
    excerpt: "Büyükşehirlerde tavan kira uygulaması tartışılıyor.",
    content: "Bazı büyükşehir belediyeleri, kiraların belirli bir seviyeyi aşmaması için merkezi yönetimle ortak çalışma yürütüyor. Hedef, öğrenciler ve dar gelirli aileler için daha erişilebilir kiralar."
  },
  {
    id: 7,
    title: "Döviz Kurlarında Sınırlı Dalgalanma",
    category: "ekonomi",
    source: "Piyasa",
    date: "06.11.2025",
    excerpt: "Piyasalar merkez bankası kararını bekliyor.",
    content: "Analistler, kurda sert hareketler beklemiyor. Önümüzdeki hafta açıklanacak para politikası metni yön konusunda belirleyici olacak."
  },
  {
    id: 8,
    title: "Yeni Nesil Öğrenci Kartı Tanıtıldı",
    category: "teknoloji",
    source: "Eğitim Teknoloji",
    date: "05.11.2025",
    excerpt: "Temassız geçiş ve dijital kimlik bir arada olacak.",
    content: "Üniversite öğrencileri artık aynı kartla kütüphane giriş, ulaşım ve kampüs etkinliklerine katılabilecek. Kartlar mobil cüzdanlara da eklenebilecek."
  }
];

const newsList = document.getElementById("newsList");
const lastTitles = document.getElementById("lastTitles");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// haberleri yazdır
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
      <div class="news-meta">${item.source} • ${item.date}</div>
      <p>${item.excerpt}</p>
      <a href="#" class="read-more" data-id="${item.id}">Habere git</a>
    `;
    newsList.appendChild(el);
  });

  // detay linkleri
  document.querySelectorAll(".read-more").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const id = link.dataset.id;
      const news = newsData.find(n => n.id == id);
      openModal(news);
    });
  });
}

// son başlıkları yazdır
function renderLastTitles() {
  lastTitles.innerHTML = newsData
    .slice(0, 8)
    .map(n => `<li>${n.title}</li>`)
    .join("");
}

// kategori tıklama
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderNews(btn.dataset.category, searchInput.value);
  });
});

// arama
searchBtn.addEventListener("click", () => {
  const activeCat = document.querySelector(".nav-btn.active")?.dataset.category || "hepsi";
  renderNews(activeCat, searchInput.value);
});
searchInput.addEventListener("keyup", e => {
  if (e.key === "Enter") searchBtn.click();
});

// tema
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// modal
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

// yıl
document.getElementById("year").textContent = new Date().getFullYear();

// ilk yükleme
renderNews("hepsi");
renderLastTitles();
