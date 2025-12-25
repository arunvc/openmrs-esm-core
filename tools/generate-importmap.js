const fs = require("fs");
const path = require("path");

const spaDir = process.argv[2];
if (!spaDir) {
  console.error("Usage: node generate-importmap.js <spa-dir>");
  process.exit(1);
}

const imports = {};

for (const dir of fs.readdirSync(spaDir)) {
  const fullDir = path.join(spaDir, dir);
  if (!fs.statSync(fullDir).isDirectory()) continue;

  let distDir = fullDir;
  let jsFiles = fs.readdirSync(distDir);

  // ✅ Case 1: locally-built packages → esm-login-app/dist/*
  if (fs.existsSync(path.join(fullDir, "dist"))) {
    distDir = path.join(fullDir, "dist");
    jsFiles = fs.readdirSync(distDir);
  }

  // Find the main OpenMRS ESM entry file
  const jsFile = jsFiles.find(f =>
    f.startsWith("openmrs-esm-") &&
    f.endsWith(".js") &&
    !f.includes(".chunk") &&
    !f.includes("runtime")
  );

  if (!jsFile) continue;

  // Resolve package name correctly
  const pkgName =
    "@openmrs/" +
    jsFile
      .replace(/^openmrs-/, "")
      .replace(/\.js$/, "");

  // Build correct relative path
  const relativePath =
    distDir === fullDir
      ? `./${dir}/${jsFile}`
      : `./${dir}/dist/${jsFile}`;

  imports[pkgName] = relativePath;
}

console.log(
  JSON.stringify(
    { imports },
    null,
    2
  )
);

