# ELITE Online — GoDaddy Node.js Hosting

Una sola aplicación: sirve el sitio web (`public/`) y la API de leads
(`/api/*`) desde el mismo dominio.

## Requisitos de GoDaddy que cumple este paquete

- `package.json` en la **raíz** del zip, con `name`, `version` y `main` llenos.
- Script `build` definido (`"build": "echo build"` — no hay nada que compilar).
- Script `start` definido (`node app.js`), y `app.js` existe.
- El puerto se lee de `process.env.PORT` (nunca está fijo en el código).
- Todo lo necesario para arrancar está en `dependencies`.
- **Sin `node_modules`** dentro del zip: la plataforma lo instala.

## Variables de entorno (definir en el panel de GoDaddy)

| Variable | Valor | Obligatoria |
|---|---|---|
| `BREVO_API_KEY` | API key de Brevo (SMTP & API → API Keys) | Sí, para enviar correo |
| `LEAD_TO` | Correo(s) que reciben las solicitudes, separados por coma | Sí |
| `LEAD_FROM` | Remitente **verificado** en Brevo | Sí |
| `LEAD_FROM_NAME` | Nombre del remitente | No |
| `CORS_ORIGINS` | Dominios externos que consumen la API, separados por coma | No (vacío si todo va en el mismo dominio) |
| `PORT` | Lo inyecta GoDaddy — **no lo definas a mano** | No |

Sin las credenciales de Brevo la API responde `{"ok":true,"mock":true}` y
registra el lead en los logs: sirve para probar sin enviar correos.

## Verificación después del despliegue

- `https://tu-dominio/` → carga el sitio.
- `https://tu-dominio/api/health` → `{"ok":true,"mail":true}`.
  Si `mail` es `false`, faltan las variables de Brevo.
- Envía el formulario de contacto y revisa la bandeja de `LEAD_TO`.

## Nota de seguridad

Nunca subas `.env`, `.env.keys` ni la carpeta `certs/`. Las credenciales
van en el panel de variables de entorno del hosting.
