const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

const BASE_URL = "http://1004house.co.kr/web-gine/";
const ARTICLES_URL = `${BASE_URL}get_articles.php`;
const PUBLIC_IMAGES_DIR = path.join(__dirname, "../public/images");

async function main() {
  console.log("Starting Webzine articles download and image resizing...");

  // 1. Ensure public/images directory exists
  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
    console.log(`Created directory: ${PUBLIC_IMAGES_DIR}`);
  }

  // 2. Fetch articles data
  let articles = [];
  try {
    const response = await fetch(ARTICLES_URL);
    articles = await response.json();
    console.log(`Successfully fetched ${articles.length} articles.`);
  } catch (err) {
    console.error("Failed to fetch articles:", err);
    process.exit(1);
  }

  const sqlStatements = [];
  sqlStatements.push(`-- ====================================================================`);
  sqlStatements.push(`-- 1004 BOGUMZARI WEBZINE REAL ARTICLE SEED DATA`);
  sqlStatements.push(`-- Generated automatically via scratch/import_and_resize.js`);
  sqlStatements.push(`-- ====================================================================`);
  sqlStatements.push(``);
  sqlStatements.push(`-- Clear existing posts to prevent duplicates`);
  sqlStatements.push(`DELETE FROM public.posts;`);
  sqlStatements.push(``);
  sqlStatements.push(`INSERT INTO public.posts (id, title, excerpt, content, cover_image, is_published, published_at, created_at)`);
  sqlStatements.push(`VALUES`);

  const values = [];

  // 3. Process each article
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`\nProcessing article ${i + 1}/${articles.length}: "${article.title}"`);

    // Parse images array
    let originalImages = [];
    if (article.image) {
      try {
        originalImages = JSON.parse(article.image);
      } catch (e) {
        if (typeof article.image === "string" && article.image.trim() !== "") {
          originalImages = [article.image.trim()];
        }
      }
    }

    const localImagePaths = [];

    // Download and resize each image
    for (let j = 0; j < originalImages.length; j++) {
      const imgPath = originalImages[j];
      const filename = path.basename(imgPath);
      // Construct original image URL
      const originalUrl = `${BASE_URL}${imgPath.replace(/\\/g, "/")}`;
      const localOutputPath = path.join(PUBLIC_IMAGES_DIR, filename);

      console.log(`  Downloading image ${j + 1}/${originalImages.length}: ${originalUrl}`);

      try {
        // Load image using Jimp
        const image = await Jimp.read(originalUrl);
        // Resize to maximum width of 640px while maintaining aspect ratio
        // set quality to 70% to make it extremely lightweight
        await image
          .resize(640, Jimp.AUTO)
          .quality(70)
          .writeAsync(localOutputPath);
        
        console.log(`  Resized and saved to: public/images/${filename}`);
        localImagePaths.push(`/images/${filename}`);
      } catch (imgErr) {
        console.error(`  Failed to process image ${originalUrl}:`, imgErr.message);
        // If image process fails, fallback to keeping the original URL so the page doesn't break
        localImagePaths.push(originalUrl);
      }
    }

    // Prepare fields for SQL injection
    // Escape single quotes for SQL insertion
    const cleanTitle = article.title.replace(/'/g, "''");
    const cleanExcerpt = (article.excerpt || "").replace(/'/g, "''");
    
    // Check if content has HTML or simple text. Escape single quotes in HTML too.
    const cleanContent = article.content.replace(/'/g, "''");
    
    // Store all resized local image paths as a JSON string in cover_image column
    const coverImageJson = JSON.stringify(localImagePaths).replace(/'/g, "''");

    const uuid = `gen_random_uuid()`;
    const dateTimestamp = `${article.date} 00:00:00+09`;

    values.push(`(
  ${uuid},
  '${cleanTitle}',
  '${cleanExcerpt}',
  '${cleanContent}',
  '${coverImageJson}',
  true,
  '${dateTimestamp}',
  '${dateTimestamp}'
)`);
  }

  sqlStatements.push(values.join(",\n") + ";");
  sqlStatements.push(``);
  console.log("\nFinished downloading and resizing all images!");

  // Write SQL output to supabase_seed.sql
  const sqlFile = path.join(__dirname, "../supabase_seed.sql");
  fs.writeFileSync(sqlFile, sqlStatements.join("\n"), "utf8");
  console.log(`Generated seed SQL at: ${sqlFile}`);
}

main().catch((err) => {
  console.error("Unhandled error in main execution:", err);
});
