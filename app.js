/* =====================================================================
   ELITE Online — punto de arranque de la aplicación Node.
   ===================================================================== */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./server/src/index.js";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Carga opcional de variables de entorno locales
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!key || process.env[key] !== undefined) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile(path.join(rootDir, ".env"));

const app = createApp({ staticDir: path.join(rootDir, "public") });
const port = Number(process.env.PORT) || 3000;

// Escuchar en 0.0.0.0 para que el proxy de GoDaddy lo detecte
app.listen(port, "0.0.0.0", () => {
  console.log(`ELITE Online escuchando en el puerto ${port}`);
});
