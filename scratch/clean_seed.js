const fs = require("fs");
const path = require("path");

const seedPath = path.join(__dirname, "../supabase_seed.sql");

if (!fs.existsSync(seedPath)) {
  console.error("Seed file not found at " + seedPath);
  process.exit(1);
}

let content = fs.readFileSync(seedPath, "utf8");

// Replace HTML entities
// &quot; -> " (safe in SQL single quotes)
// &#039; -> '' (escaped single quote in SQL)
// &amp; -> &
// &lt; -> <
// &gt; -> >
const cleaned = content
  .replace(/&quot;/g, '"')
  .replace(/&#039;/g, "''")
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");

fs.writeFileSync(seedPath, cleaned, "utf8");
console.log("Successfully cleaned HTML entities in supabase_seed.sql!");
