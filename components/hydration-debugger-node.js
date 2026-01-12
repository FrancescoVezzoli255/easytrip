const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const EXTENSIONS = [".js", ".jsx", ".ts", ".tsx"];

// Pattern client-side per potenziali hydration error
const BAD_PATTERNS = [
  { regex: /new Date\(/, reason: "Uso di new Date() nel render" },
  { regex: /Math\.random\(/, reason: "Math.random causa HTML non deterministico" },
  { regex: /\.toLocaleString\(/, reason: "toLocaleString dipende da locale/timezone" },
  { regex: /window\./, reason: "Uso di window (client-only)" },
  { regex: /document\./, reason: "Uso di document (client-only)" },
  { regex: /localStorage\./, reason: "Uso di localStorage (client-only)" },
  { regex: /react-datepicker/, reason: "react-datepicker NON è SSR-safe" },
];

let problems = [];

const IGNORED_DIRS = ["node_modules", ".next", "public", "tests", "cypress"];
const IGNORED_PATHS = ["api/route", "hydration-debugger"]; // ignoriamo API routes

function findComponentName(lines, idx) {
  for (let i = idx; i >= 0; i--) {
    const line = lines[i].trim();
    const match = line.match(/function\s+(\w+)\s*\(/) || line.match(/const\s+(\w+)\s*=\s*\(\)\s*=>/);
    if (match) return match[1];
  }
  return null;
}

function isInsideUseEffect(lines, idx) {
  // cerca le parentesi graffe aperte indietro per vedere se siamo dentro useEffect
  for (let i = idx; i >= 0; i--) {
    const line = lines[i].trim();
    if (/useEffect\s*\(/.test(line)) return true;
    if (/^\}/.test(line)) return false; // siamo usciti da un blocco
  }
  return false;
}

function scanFile(filePath) {
  if (IGNORED_PATHS.some(p => filePath.includes(p))) return;

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  lines.forEach((line, i) => {
    BAD_PATTERNS.forEach(({ regex, reason }) => {
      if (regex.test(line) && !isInsideUseEffect(lines, i)) {
        const component = findComponentName(lines, i);
        problems.push({
          file: filePath,
          line: i + 1,
          code: line.trim(),
          reason,
          component: component || "Sconosciuto",
        });
      }
    });

    // dynamic senza ssr:false
    if (line.includes("dynamic(") && !content.includes("ssr: false")) {
      const component = findComponentName(lines, i);
      problems.push({
        file: filePath,
        line: i + 1,
        code: line.trim(),
        reason: "dynamic() senza { ssr:false }",
        component: component || "Sconosciuto",
      });
    }
  });
}

function walk(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (IGNORED_DIRS.includes(file)) return;

    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      walk(fullPath);
    } else if (EXTENSIONS.includes(path.extname(fullPath))) {
      scanFile(fullPath);
    }
  });
}

// Esegui scansione
console.log("🔍 Scansione client-side per veri hydration errors...\n");
walk(ROOT);

// Raggruppa per componente
const grouped = {};
problems.forEach((p) => {
  if (!grouped[p.component]) grouped[p.component] = [];
  grouped[p.component].push(p);
});

// Stampa risultati
if (problems.length === 0) {
  console.log("✅ Nessun vero problema di hydration trovato lato client.");
  process.exit(0);
}

Object.keys(grouped).forEach((component) => {
  console.log(`\n🛠️ Componente: ${component}`);
  grouped[component].forEach((p, i) => {
    console.log(`  ❌ [${i + 1}] File: ${p.file}`);
    console.log(`      Linea: ${p.line}`);
    console.log(`      Motivo: ${p.reason}`);
    console.log(`      Codice: ${p.code}`);
  });
});

console.log(`\n⚠️ Trovati ${problems.length} veri hydration errors lato client.`);
