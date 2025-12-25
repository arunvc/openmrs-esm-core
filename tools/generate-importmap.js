const fs = require("fs");
const path = require("path");

const spaDir = process.argv[2];
if (!spaDir) {
  console.error("Usage: node generate-importmap.js <spa-dir>");
  process.exit(1);
}

const imports = {};

for (const dir of fs.readdirSync(spaDir)) {
  if (!dir.startsWith("openmrs-esm-")) continue;

  const fullDir = path.join(spaDir, dir);
  if (!fs.statSync(fullDir).isDirectory()) continue;

  // Find main esm bundle (NOT chunk files)
  const jsFile = fs.readdirSync(fullDir).find(f =>
    f.startsWith("openmrs-esm-") &&
    f.endsWith(".js") &&
    !f.includes(".chunk") &&
    !f.includes("runtime")
  );

  if (!jsFile) continue;

  const pkgName =
    "@openmrs/" +
    jsFile
      .replace(/^openmrs-/, "")
      .replace(/\.js$/, "");

  imports[pkgName] = `./${dir}/${jsFile}`;
}

console.log(
  JSON.stringify(
    {
      imports
    },
    null,
    2
  )
);

