/* Validación de la solicitud del formulario (espejo de la validación del front). */

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const s = (v) => (typeof v === "string" ? v.trim() : "");

export function validateLead(body = {}) {
  const data = {
    name: s(body.name),
    email: s(body.email),
    phone: s(body.phone),
    type: s(body.type),
    service: s(body.service),
    message: s(body.message),
  };

  const errors = [];
  if (data.name.length < 2) errors.push("name");
  if (data.phone.replace(/\D/g, "").length < 7) errors.push("phone");
  if (!emailRe.test(data.email)) errors.push("email");
  if (!["Hogar", "Empresa"].includes(data.type)) errors.push("type");

  // Recorta longitudes para evitar payloads abusivos.
  data.message = data.message.slice(0, 2000);
  data.service = data.service.slice(0, 120);

  return { ok: errors.length === 0, errors, data };
}
