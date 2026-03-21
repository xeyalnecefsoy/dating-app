/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const iconsFile = path.join(repoRoot, "lib", "icons.ts");

function readText(p) {
  return fs.readFileSync(p, "utf8");
}

function walk(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function parseExportNames(source) {
  const m = source.match(/export\s*\{([\s\S]*?)\}\s*from\s*["'][^"']+["'];/);
  if (!m) return new Set();
  const body = m[1];
  return new Set(
    body
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

function parseIconImports(source) {
  const out = new Set();
  // Keep the match inside a single import statement (do not cross semicolons)
  const importRegex = /import\s*\{([^;]*?)\}\s*from\s*["'](?:\.\.\/)+lib\/icons["'];/g;
  let match;
  while ((match = importRegex.exec(source))) {
    const body = match[1];
    for (const raw of body.split(",")) {
      const part = raw.trim();
      if (!part) continue;
      const left = part.split(/\s+as\s+/i)[0]?.trim();
      if (left) out.add(left);
    }
  }
  return out;
}

function main() {
  const exported = parseExportNames(readText(iconsFile));
  if (exported.size === 0) {
    console.error(`[check:icons] Could not parse exports from ${iconsFile}`);
    process.exit(2);
  }

  const targets = [
    path.join(repoRoot, "app"),
    path.join(repoRoot, "components"),
    path.join(repoRoot, "lib"),
  ].filter((p) => fs.existsSync(p));

  const files = targets.flatMap((dir) =>
    walk(dir).filter((f) => /\.(ts|tsx|js|jsx)$/.test(f))
  );

  const missingByFile = new Map();
  for (const f of files) {
    const src = readText(f);
    const imported = parseIconImports(src);
    if (imported.size === 0) continue;

    const missing = [...imported].filter((name) => !exported.has(name));
    if (missing.length) missingByFile.set(f, missing);
  }

  if (missingByFile.size) {
    console.error("[check:icons] Missing icon exports detected:");
    for (const [file, missing] of missingByFile.entries()) {
      console.error(`- ${path.relative(repoRoot, file)}: ${missing.join(", ")}`);
    }
    process.exit(1);
  }

  console.log("[check:icons] OK");
}

main();

