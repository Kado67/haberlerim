/ ========== AYARLAR ==========
const NEWSDATA_API_KEY = "pub_ee04dcfcf6b54339b4bc667b529dea62";
const COUNTRY = "tr";
const LANGUAGE = "tr";

// ========== ELEMANLAR ==========
const feed = document.getElementById("feed");
const errBox = document.getElementById("err");
const feedTitle = document.getElementById("feedTitle");
const tabs = [...document.querySelectorAll(".tab")];
const q = document.getElementById("q");
const searchBtn = document.getElementById("searchBtn");
document.getElementById("y").textContent = new Date().getFullYear();

// ========== HABER ÇEK ==========
async function loadCategory(cat = "top") {
  feed.innerHTML = "<p>Yükleniyor...</p>";
  errBox.hidden = true;

  const url = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&country=${COUNTRY}&language=${LANGUAGE}&category=${cat}`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || !data.results.length) {
      feed.innerHTML = "<div class='error'>Bu kategoride haber bulunamadı.</div>";
      return;
    }

    feed.innerHTML = data.results.map(makeCard).join("");
  } catch (e) {
    console.error(e);
    errBox.textContent = "Haberler yüklenemedi. API anahtarını ve kota durumunu kontrol edin.";
    errBox.hidden = false;
    feed.innerHTML = "";
  }
}

function makeCard(a) {
  const img = a.image_url || "https://placehold.co/600x400?text=Haber";
  const title = a.title || "Başlık yok";
  const desc = a.description || "";
  return `
    <article class="card">
      <img src="${img}" alt="${title}">
      <div class="card-body">
        <h3>${title}</h3>
        <p>${desc}</p>
        <a href="${a.link}" target="_blank" rel="noopener">Habere git →</a>
      </div>
    </article>
  `;
}

// ========== OLAYLAR ==========
tabs.forEach(b => {
  b.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    b.classList.add("active");
    const cat = b.dataset.cat;
    feedTitle.textContent = b.textContent;
    loadCategory(cat);
  });
});

searchBtn.addEventListener("click", () => searchNews(q.value.trim()));
q.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchNews(q.value.trim());
  }
});

async function searchNews(query) {
  if (!query) return;
  feedTitle.textContent = `Arama: ${query}`;
  feed.innerHTML = "<p>Yükleniyor...</p>";

  const url = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&language=${LANGUAGE}&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || !data.results.length) {
      feed.innerHTML = "<div class='error'>Sonuç bulunamadı.</div>";
      return;
    }

    feed.innerHTML = data.results.map(makeCard).join("");
  } catch (e) {
    console.error(e);
    errBox.textContent = "Arama yapılamadı.";
    errBox.hidden = false;
  }
}

// İlk yükleme
loadCategory("top");
