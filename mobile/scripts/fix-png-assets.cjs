/**
 * Converts asset files that have .png extension but JPEG content to real PNG.
 * Run from mobile folder: node scripts/fix-png-assets.cjs
 */
const fs = require("fs");
const path = require("path");

const assetsDir = path.join(__dirname, "..", "assets");
const files = [
  "icon.png",
  "splash-icon.png",
  "android-icon-foreground.png",
  "android-icon-background.png",
];

async function main() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.error("Run: npm install sharp --save-dev");
    process.exit(1);
  }
  for (const file of files) {
    const p = path.join(assetsDir, file);
    if (!fs.existsSync(p)) {
      console.warn("Skip (not found):", file);
      continue;
    }
    const buf = fs.readFileSync(p);
    const out = await sharp(buf).png().toBuffer();
    fs.writeFileSync(p, out);
    console.log("Converted:", file);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
