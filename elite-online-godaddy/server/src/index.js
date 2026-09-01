/* =====================================================================
   ELITE Online — sitio estático + API de captura de leads (Brevo)
   ---------------------------------------------------------------------
   Exporta createApp() para que el arranque (app.js) decida el puerto y
   la carpeta estática. Las variables de entorno se definen en el panel
   del hosting (o en un .env local durante el desarrollo).
   ===================================================================== */
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import fs from "node:fs";
import path from "node:path";
import { validateLead } from "./validate.js";
import { sendLeadEmail, mailerConfigured } from "./mailer.js";

// Escapa texto para insertarlo de forma segura en el HTML del correo.
const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

export function createApp({ staticDir } = {}) {
  const app = express();

  app.set("trust proxy", 1); // detrás del proxy del hosting: respeta X-Forwarded-For
  app.disable("x-powered-by");
  app.use(express.json({ limit: "12kb" }));

  /* ----------------------------- CORS ------------------------------- */
  /* El sitio se sirve desde el mismo origen que la API, así que CORS solo
     hace falta si algún otro dominio consume /api/contact. */
  const allowed = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    "/api",
    cors({
      origin(origin, cb) {
        // Sin Origin (curl, health checks) o mismo origen → permitido.
        if (!origin || allowed.length === 0 || allowed.includes(origin)) {
          return cb(null, true);
        }
        return cb(new Error("Origen no permitido por CORS"));
      },
      methods: ["GET", "POST"],
    })
  );

  /* --------------------------- Rate limit --------------------------- */
  const contactLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5, // 5 envíos por minuto por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: "Demasiadas solicitudes, intenta en un minuto." },
  });

  /* ------------------------------ API ------------------------------- */
  app.get("/api/health", (req, res) => {
    res.json({ ok: true, mail: mailerConfigured() });
  });

  app.post("/api/contact", contactLimiter, async (req, res) => {
    // Honeypot anti-spam: el campo "company" está oculto en el formulario.
    // Si llega relleno, es un bot → respondemos "ok" sin crear nada.
    if (req.body && typeof req.body.company === "string" && req.body.company.trim() !== "") {
      return res.json({ ok: true });
    }

    const { ok, errors, data } = validateLead(req.body);
    if (!ok) return res.status(400).json({ ok: false, errors });

    const subject = `Nueva solicitud web — ${data.service || "General"} — ${data.name}`;
    const text = [
      `Nombre: ${data.name}`,
      `Teléfono: ${data.phone}`,
      `Correo: ${data.email}`,
      `Tipo de cliente: ${data.type}`,
      `Servicio de interés: ${data.service || "—"}`,
      "",
      "Mensaje:",
      data.message || "—",
    ].join("\n");
    const html =
      `<h2 style="font-family:Arial,sans-serif">Nueva solicitud desde el sitio web</h2>` +
      `<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">` +
      `<tr><td><b>Nombre</b></td><td>${esc(data.name)}</td></tr>` +
      `<tr><td><b>Teléfono</b></td><td>${esc(data.phone)}</td></tr>` +
      `<tr><td><b>Correo</b></td><td>${esc(data.email)}</td></tr>` +
      `<tr><td><b>Tipo de cliente</b></td><td>${esc(data.type)}</td></tr>` +
      `<tr><td><b>Servicio</b></td><td>${esc(data.service || "—")}</td></tr>` +
      `</table>` +
      `<p style="font-family:Arial,sans-serif;font-size:14px"><b>Mensaje:</b><br>${esc(data.message || "—").replace(/\n/g, "<br>")}</p>`;

    try {
      if (!mailerConfigured()) {
        // Modo prueba: sin credenciales de Brevo, registramos en consola y devolvemos ok.
        console.log("[MOCK] Brevo no configurado — solicitud recibida:\n" + text);
        return res.json({ ok: true, mock: true });
      }
      const id = await sendLeadEmail({
        subject,
        text,
        html,
        replyTo: data.email,
        replyToName: data.name,
      });
      console.log("Correo de lead enviado, messageId =", id);
      return res.json({ ok: true, id });
    } catch (err) {
      console.error("Error enviando el correo del lead:", err.message);
      return res.status(502).json({ ok: false, error: "No se pudo registrar la solicitud." });
    }
  });

  // Cualquier otra ruta bajo /api no existe: responde JSON, nunca HTML.
  app.use("/api", (req, res) => {
    res.status(404).json({ ok: false, error: "Ruta no encontrada." });
  });

  /* ------------------------- Sitio estático ------------------------- */
  if (staticDir && fs.existsSync(staticDir)) {
    app.use(
      express.static(staticDir, {
        extensions: ["html"],
        maxAge: "1h",
        setHeaders(res, filePath) {
          // Los HTML siempre frescos; los assets con hash pueden cachearse más.
          if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-cache");
        },
      })
    );

    const notFoundPage = path.join(staticDir, "404.html");
    app.use((req, res) => {
      if (fs.existsSync(notFoundPage)) return res.status(404).sendFile(notFoundPage);
      return res.status(404).type("text/plain").send("Página no encontrada");
    });
  }

  /* ------------------------ Errores no previstos -------------------- */
  app.use((err, req, res, next) => {
    console.error("Error no controlado:", err.message);
    if (res.headersSent) return next(err);
    const isApi = req.path.startsWith("/api");
    if (isApi) return res.status(500).json({ ok: false, error: "Error interno." });
    return res.status(500).type("text/plain").send("Error interno del servidor");
  });

  return app;
}
