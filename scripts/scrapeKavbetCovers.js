// scripts/scrapeKavbetCovers.js
//
// Kavbet sitesindeki TUM oyun gorsellerini indirir.
// .GameThumbailWrapper img.ListGameImage class'ini hedef alir.
//
// Kurulum (bir kez):
//   npm init -y
//   npm install puppeteer
//
// Kullanim:
//   node scrapeKavbetCovers.js
//
// Gorsel klasoru: covers/

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const OUTPUT_DIR = path.join(__dirname, "covers");
const BASE_URL = "https://www.kavbet955.com";
const DELAY_MS = 100;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Dosya indir
const downloadFile = (url, dest) =>
  new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) return resolve("exists");
    const file = fs.createWriteStream(dest);
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://www.kavbet955.com/",
        },
      }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          if (fs.existsSync(dest)) fs.unlinkSync(dest);
          const loc = res.headers.location;
          const next = loc.startsWith("http") ? loc : `${BASE_URL}${loc}`;
          return downloadFile(next, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          if (fs.existsSync(dest)) fs.unlinkSync(dest);
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve("downloaded")));
      })
      .on("error", (err) => {
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(err);
      });
  });

// Sayfadaki tum .GameThumbailWrapper img src'lerini topla + scroll yap
async function scrapeImages(page, url) {
  console.log(`\nAciliyor: ${url}`);
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(2000);

  const results = new Map(); // src -> alt

  let scrolls = 0;
  let lastCount = 0;
  let noChangeCount = 0;

  // Scroll yaparak tum lazy-load gorsellerini yukle
  while (noChangeCount < 4) {
    // Mevcut gorselleri topla
    const imgs = await page.evaluate(() => {
      const wrappers = document.querySelectorAll(".GameThumbailWrapper");
      return Array.from(wrappers).map((w) => {
        const img = w.querySelector("img");
        return img
          ? {
              src: img.getAttribute("src") || img.getAttribute("data-src") || "",
              alt: img.getAttribute("alt") || "",
            }
          : null;
      }).filter(Boolean);
    });

    imgs.forEach((img) => {
      if (img.src && img.src !== "" && !img.src.startsWith("data:")) {
        results.set(img.src, img.alt);
      }
    });

    // Asagi kaydir
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 3));
    await sleep(700);

    const newCount = results.size;
    if (newCount === lastCount) {
      noChangeCount++;
    } else {
      noChangeCount = 0;
      lastCount = newCount;
    }
    scrolls++;

    // Max 60 scroll
    if (scrolls > 60) break;
  }

  console.log(`  ${results.size} oyun gorseli bulundu`);
  return results;
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Gorsel klasoru: ${OUTPUT_DIR}`);

  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch (e) {
    console.error("Puppeteer yuklu degil. Once su komutu calistir:");
    console.error("  npm init -y && npm install puppeteer");
    process.exit(1);
  }

  console.log("Tarayici aciliyor...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--lang=tr-TR",
    ],
    defaultViewport: { width: 1440, height: 900 },
  });

  const allImages = new Map(); // src -> alt

  const KAVBET_PAGES = [
    `${BASE_URL}/casino`,
    `${BASE_URL}/casino/slots`,
    `${BASE_URL}/casino/live-casino`,
    `${BASE_URL}/casino/table-games`,
    `${BASE_URL}/casino/jackpot`,
    `${BASE_URL}/casino/new-games`,
    `${BASE_URL}/casino/popular`,
  ];

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    for (const pageUrl of KAVBET_PAGES) {
      try {
        const imgs = await scrapeImages(page, pageUrl);
        imgs.forEach((alt, src) => allImages.set(src, alt));
        console.log(`  Toplam birikim: ${allImages.size}`);
      } catch (e) {
        console.error(`  Hata (${pageUrl}): ${e.message}`);
      }
      await sleep(1500);
    }
  } finally {
    await browser.close();
  }

  console.log(`\nToplam ${allImages.size} benzersiz gorsel URL'si bulundu`);
  console.log("Indiriliyor...\n");

  let ok = 0, skip = 0, fail = 0;

  for (const [src, alt] of allImages) {
    // Tam URL olustur
    const fullUrl = src.startsWith("http") ? src : `${BASE_URL}${src}`;

    // Dosya adini al — URL'nin son kismindaki hash/filename
    const filename = src
      .replace(/\?.*$/, "")
      .split("/")
      .pop()
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    if (!filename || filename === "") {
      skip++;
      continue;
    }

    const dest = path.join(OUTPUT_DIR, filename);

    try {
      const r = await downloadFile(fullUrl, dest);
      if (r === "exists") {
        skip++;
      } else {
        ok++;
        if (ok % 50 === 0) console.log(`[${ok}] indirildi...`);
      }
    } catch (e) {
      fail++;
      if (fail <= 10) {
        console.error(`[FAIL] ${alt || filename}: ${e.message}`);
      }
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nBitti!`);
  console.log(`  Indirildi  : ${ok}`);
  console.log(`  Atlandi    : ${skip} (zaten mevcut)`);
  console.log(`  Basarisiz  : ${fail}`);
  console.log(`  Klasor     : ${OUTPUT_DIR}`);
}

main().catch(console.error);
