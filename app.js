/* =====================================================================
   ELITE Online — punto de arranque de la aplicación Node.
   Este es el "Application startup file" que pide el panel del hosting.
   Sirve el sitio estático (public/) y la API de leads (/api/*).
   ===================================================================== */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/* Carga opcional de un archivo .env (solo para desarrollo local).
   En producción las variables se definen en el panel del hosting. */
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

const { createApp } = await import("./server/src/index.js");

const app = createApp({ staticDir: path.join(rootDir, "public") });
const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`ELITE Online escuchando en el puerto ${port}`);
});
