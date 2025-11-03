// Sekmeler
const tabs = document.querySelectorAll(".tab");
const feedTitle = document.getElementById("feedTitle");
const feed = document.getElementById("feed");
const errorBox = document.getElementById("error");
const rssList = document.getElementById("rss-haberler");

// Burada senin Newsdata.io'dan çektiğin kategori haberlerini yükleyen fonksiyon vardı
// ismi farklıysa aşağıyı kendi ismine göre düzeltirsin
async function yukKategorisi(kategori) {
  try {
    // BURAYI sen daha önce nasıl yaptınsa öyle bırakabilirsin.
    // Şimdilik boş bırakalım ki hata vermesin.
    console.log("API'den kategori yüklenecek:", kategori);
  } catch (e) {
    console.error(e);
    if (errorBox) {
      errorBox.textContent = "Arama yapılamadı.";
      errorBox.hidden = false;
    }
  }
}

// 1) KATEGORİ → RSS ADRESİ TABLOSU
const RSS_KAYNAKLARI = {
  gundem: "https://www.trthaber.com/rss/gundem.rss",
  spor: "https://www.trthaber.com/rss/spor.rss",
  teknoloji: "https://www.trthaber.com/rss/bilim-teknoloji.rss",
  magazin: "https://www.trthaber.com/rss/kultur-sanat.rss",
  saglik: "https://www.trthaber.com/rss/saglik.rss",
  bilim: "https://www.trthaber.com/rss/bilim-teknoloji.rss",
};

// 2) RSS GETİREN FONKSİYON
async function getRssNews(kategori = "gundem") {
  // Hangi RSS?
  const rssUrl = RSS_KAYNAKLARI[kategori] || RSS_KAYNAKLARI["gundem"];

  // rss2json servisiyle RSS → JSON
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
    rssUrl
  )}`;

  if (!rssList) return;

  // önce temizle
  rssList.innerHTML = "<p style='color:#fff'>RSS yükleniyor...</p>";

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.status !== "ok") {
      rssList.innerHTML =
        "<p style='color:#ff6'>RSS yüklenemedi (servis hatası)</p>";
      return;
    }

    // başlık
    rssList.innerHTML = "<h2>📰 RSS Haberleri</h2>";

    // ilk 6 haberi göster
    data.items.slice(0, 6).forEach((item) => {
      const div = document.createElement("div");
      div.style.borderBottom = "1px solid #444";
      div.style.padding = "10px 0";

      div.innerHTML = `
        <h3 style="margin:0 0 4px 0">
          <a href="${item.link}" target="_blank" style="color:#fff;text-decoration:none">
            ${item.title}
          </a>
        </h3>
        <small style="color:#aaa">${new Date(
          item.pubDate
        ).toLocaleString("tr-TR")}</small>
      `;
      rssList.appendChild(div);
    });
  } catch (err) {
    console.error("RSS yüklenemedi:", err);
    rssList.innerHTML =
      "<p style='color:#ff6'>RSS yüklenemedi (internet ya da kaynak hatası)</p>";
  }
}

// 3) SEKME TIKLAMA – hem kendi API’ni çağır, hem RSS’i
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    // aktif sekme değiştir
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const kategori = tab.dataset.cat; // data-cat="gundem" gibi

    // senin haber API’in
    yukKategorisi(kategori);

    // RSS kısmı
    getRssNews(kategori);
  });
});

// 4) SAYFA AÇILIR AÇILMAZ İLK YÜKLEME
yukKategorisi("gundem");
getRssNews("gundem");
