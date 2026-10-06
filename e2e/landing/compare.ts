/**
 * compare.ts
 * Diffs stable per-section and per-element crops in golden/ and current/.
 * Threshold: 0.1% of pixels per crop.
 * Writes annotated diff images to baseline/diff/.
 *
 * Run: pnpm test:visual:diff
 * Exit 0 → all clean. Exit 1 → one or more images exceed threshold.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT    = path.resolve(__dirname, "../..");
const GOLDEN  = path.join(ROOT, "baseline/golden");
const CURRENT = path.join(ROOT, "baseline/current");
const DIFF    = path.join(ROOT, "baseline/diff");

const THRESHOLD_RATIO = 0.001; // 0.1 %

fs.mkdirSync(DIFF, { recursive: true });

function readPng(p: string): { data: Buffer; width: number; height: number } {
  const img = PNG.sync.read(fs.readFileSync(p));
  return { data: img.data as unknown as Buffer, width: img.width, height: img.height };
}

function padToSize(
  src: Buffer, sw: number, sh: number, dw: number, dh: number
): Buffer {
  if (sw === dw && sh === dh) return src;
  const out = Buffer.alloc(dw * dh * 4, 0);
  for (let y = 0; y < Math.min(sh, dh); y++) {
    for (let x = 0; x < Math.min(sw, dw); x++) {
      const si = (y * sw + x) * 4;
      const di = (y * dw + x) * 4;
      out[di]     = src[si]!;
      out[di + 1] = src[si + 1]!;
      out[di + 2] = src[si + 2]!;
      out[di + 3] = src[si + 3]!;
    }
  }
  return out;
}

interface Row {
  file: string;
  diffPx: number;
  totalPx: number;
  pct: string;
  pass: boolean;
  note: string;
}

const suffixes = ["1440", "375"] as const;
const sections = ["overview", "workflow", "features", "dashboard", "cta", "footer"] as const;
const copyCrops = ["kicker", "h1", "lede", "actions", "metrics"] as const;
const goldenFiles = [
  ...suffixes.flatMap((suffix) => [
    `nav-${suffix}.png`,
    `hero-container-${suffix}.png`,
    ...copyCrops.map((crop) => `hero-copy-${crop}-${suffix}.png`),
    `hero-diagram-${suffix}.png`,
    `ticker-${suffix}.png`,
    ...sections.map((section) => `section-${section}-${suffix}.png`),
  ]),
  "nav-menu-open-375.png",
];

if (!fs.existsSync(GOLDEN) || goldenFiles.length === 0) {
  console.error(
    "\nNo baseline/golden/*.png found.\n" +
    "Run `pnpm test:visual:baseline` first to stamp the golden baseline.\n"
  );
  process.exit(1);
}

const rows: Row[] = [];
let anyFail = false;

for (const file of goldenFiles) {
  const gPath = path.join(GOLDEN, file);
  const cPath = path.join(CURRENT, file);

  if (!fs.existsSync(cPath)) {
    rows.push({
      file,
      diffPx: -1,
      totalPx: 0,
      pct: "N/A",
      pass: false,
      note: "MISSING in baseline/current/ — run `pnpm test:visual:capture` first",
    });
    anyFail = true;
    continue;
  }

  if (!fs.existsSync(gPath)) {
    rows.push({
      file,
      diffPx: -1,
      totalPx: 0,
      pct: "N/A",
      pass: false,
      note: "MISSING in baseline/golden/ — run `pnpm test:visual:baseline` to stamp the new crop",
    });
    anyFail = true;
    continue;
  }

  const g = readPng(gPath);
  const c = readPng(cPath);

  const W = Math.max(g.width,  c.width);
  const H = Math.max(g.height, c.height);

  const gd = padToSize(g.data, g.width, g.height, W, H);
  const cd = padToSize(c.data, c.width, c.height, W, H);

  const diffImg  = new PNG({ width: W, height: H });
  const diffPx   = pixelmatch(gd, cd, diffImg.data, W, H, {
    threshold: 0.1,
    includeAA: false,
  });
  const totalPx  = W * H;
  const ratio    = diffPx / totalPx;
  const pass     = ratio <= THRESHOLD_RATIO;
  if (!pass) anyFail = true;

  fs.writeFileSync(path.join(DIFF, file), PNG.sync.write(diffImg));

  rows.push({
    file,
    diffPx,
    totalPx,
    pct: (ratio * 100).toFixed(3) + "%",
    pass,
    note: pass
      ? "✓ within 0.1%"
      : `✗ ${(ratio * 100).toFixed(3)}% — baseline/diff/${file}`,
  });
}

// ── Report ────────────────────────────────────────────────────────────────────
const W1 = 44, W2 = 9, W3 = 16, W4 = 52;
const LINE = "─".repeat(W1 + W2 + W3 + W4);
const pad  = (s: string, n: number) => s.padEnd(n).slice(0, n);

console.log("\n" + LINE);
console.log(pad("File", W1) + pad("Diff%", W2) + pad("DiffPx/TotalPx", W3) + "Result");
console.log(LINE);

for (const r of rows) {
  const counts = r.totalPx > 0 ? `${r.diffPx}/${r.totalPx}` : "—";
  console.log(pad(r.file, W1) + pad(r.pct, W2) + pad(counts, W3) + r.note);
}

console.log(LINE);

const passed = rows.filter(r => r.pass).length;
const failed = rows.filter(r => !r.pass).length;
console.log(`\n${passed} passed, ${failed} failed  (threshold ≤ 0.1% of pixels)\n`);

if (anyFail) {
  console.log("Diff PNGs written to baseline/diff/ for review.\n");
  process.exit(1);
}
console.log("All diffs within threshold — landing is visually frozen.\n");
