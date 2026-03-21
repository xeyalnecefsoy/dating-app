const sharp = require("sharp");
const path = require("path");

const ASSETS = path.join(__dirname, "..", "assets");
const SOURCE_LOGO = path.join(__dirname, "..", "..", "public", "logo.png");

async function main() {
  // Use the web logo as source (has the most complete version of the face)
  const logoBuffer = await sharp(SOURCE_LOGO)
    .resize(580, 580, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Foreground: transparent 1024x1024 with logo centered in safe zone (~57% of canvas)
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: logoBuffer, gravity: "centre" }])
    .png()
    .toFile(path.join(ASSETS, "android-icon-foreground.png"));

  console.log("android-icon-foreground.png OK");

  // Background: solid #000108 (matches web .dark --background eyedropped)
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 0, g: 1, b: 8, alpha: 255 },
    },
  })
    .png()
    .toFile(path.join(ASSETS, "android-icon-background.png"));

  console.log("android-icon-background.png OK");

  // Read the newly-created foreground for compositing
  const newFg = path.join(ASSETS, "android-icon-foreground.png");
  const fgForIcon = await sharp(newFg)
    .resize(750, 750, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Standard icon.png: logo on dark background
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 26, g: 26, b: 46, alpha: 255 },
    },
  })
    .composite([{ input: fgForIcon, gravity: "centre" }])
    .png()
    .toFile(path.join(ASSETS, "icon.png"));

  console.log("icon.png OK");

  // Splash icon
  const fgForSplash = await sharp(newFg)
    .resize(600, 600, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 26, g: 26, b: 46, alpha: 255 },
    },
  })
    .composite([{ input: fgForSplash, gravity: "centre" }])
    .png()
    .toFile(path.join(ASSETS, "splash-icon.png"));

  console.log("splash-icon.png OK");
  console.log("All icon assets regenerated with safe zone padding.");
}

main().catch(console.error);
