const fs = require("fs");
const path = require("path");

const dist = path.join(__dirname, "..", "dist");
const required = ["index.html", "styles.css", "app.js"];

if (!fs.existsSync(dist)) {
  console.error("dist/ folder chybí.");
  process.exit(1);
}

for (const file of required) {
  if (!fs.existsSync(path.join(dist, file))) {
    console.error(`Chybí povinný asset: dist/${file}`);
    process.exit(1);
  }
}

console.log("Render static build check passed.");
