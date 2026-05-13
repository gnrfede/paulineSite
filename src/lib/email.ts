import nodemailer from "nodemailer";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: true, minVersion: "TLSv1.2" },
    connectionTimeout: 10_000,
    socketTimeout: 10_000,
  });
}

const FROM = () =>
  process.env.SMTP_FROM ?? `Pauline Studio <${process.env.SMTP_USER}>`;

function fmtDate(date: string) {
  return format(parseISO(date), "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── Email al admin: nueva solicitud de turno ───────────────────────────────

export interface AdminNotificationEmailData {
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  serviceNames: string[];
  date: string;
  timeSlot: string;
  notes?: string | null;
}

export async function sendAdminNotificationEmail(
  data: AdminNotificationEmailData
): Promise<void> {
  const { bookingId, name, email, phone, serviceNames, date, timeSlot, notes } = data;
  const formattedDate = fmtDate(date);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pauline-studio.vercel.app";
  const adminUrl = `${appUrl}/admin/dashboard/turnos`;

  const notesRow = notes
    ? `<tr><td style="padding:6px 0;font-size:14px;color:#777;font-family:sans-serif;vertical-align:top">Notas</td><td style="padding:6px 0;font-size:14px;color:#333;font-family:sans-serif">${escapeHtml(notes)}</td></tr>`
    : "";

  const html = WRAP(`
    ${HEADER("Nueva solicitud de turno")}
    <tr><td style="padding:36px 40px">
      <p style="margin:0 0 20px;font-size:17px;color:#333">Nuevo turno solicitado</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF9F7;border-radius:8px">
        <tr><td style="padding:20px 24px">
          <p style="margin:0 0 12px;font-size:11px;font-family:sans-serif;letter-spacing:1px;text-transform:uppercase;color:#999">Datos del cliente</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#777;font-family:sans-serif;width:90px">Nombre</td>
              <td style="padding:6px 0;font-size:14px;color:#333;font-family:sans-serif"><strong>${escapeHtml(name)}</strong></td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#777;font-family:sans-serif">Email</td>
              <td style="padding:6px 0;font-size:14px;color:#333;font-family:sans-serif">${escapeHtml(email)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#777;font-family:sans-serif">Teléfono</td>
              <td style="padding:6px 0;font-size:14px;color:#333;font-family:sans-serif">${escapeHtml(phone)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#777;font-family:sans-serif;vertical-align:top">Servicio</td>
              <td style="padding:6px 0;font-size:14px;color:#333;font-family:sans-serif">
                <ul style="margin:0;padding-left:18px">${serviceNames.map((s) => `<li style="margin:4px 0">${escapeHtml(s)}</li>`).join("")}</ul>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#777;font-family:sans-serif">Fecha</td>
              <td style="padding:6px 0;font-size:14px;color:#333;font-family:sans-serif;text-transform:capitalize">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#777;font-family:sans-serif">Hora</td>
              <td style="padding:6px 0;font-size:14px;color:#333;font-family:sans-serif">${timeSlot} hs</td>
            </tr>
            ${notesRow}
          </table>
        </td></tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px">
        <tr><td align="center">
          <a href="${adminUrl}" style="display:inline-block;padding:14px 32px;background:#6BBFB5;color:#fff;font-family:sans-serif;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:0.5px">
            Confirmar turno en el panel →
          </a>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;text-align:center;font-size:12px;color:#aaa;font-family:sans-serif">
        ID del turno: ${escapeHtml(bookingId)}
      </p>
    </td></tr>
    ${FOOTER()}
  `);

  await createTransporter().sendMail({
    from: FROM(),
    to: "spinelli.paulaluciana@gmail.com",
    subject: `Nuevo turno: ${name} — ${formattedDate} ${timeSlot} hs`,
    html,
    text: `Nuevo turno solicitado\n\nNombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\nServicio: ${serviceNames.join(", ")}\nFecha: ${formattedDate}\nHora: ${timeSlot} hs${notes ? `\nNotas: ${notes}` : ""}\n\nConfirmar turno: ${adminUrl}\nID: ${bookingId}`,
  });
}

// ─── Email al cliente: solicitud recibida ────────────────────────────────────

export interface BookingRequestEmailData {
  to: string;
  name: string;
  serviceNames: string[];
  date: string;
  timeSlot: string;
  phone: string;
  notes?: string | null;
}

export async function sendBookingRequestEmail(
  data: BookingRequestEmailData
): Promise<void> {
  const { to, name, serviceNames, date, timeSlot } = data;
  const formattedDate = fmtDate(date);

  await createTransporter().sendMail({
    from: FROM(),
    to,
    subject: "Recibimos tu solicitud de turno — Pauline Studio",
    html: buildRequestHtml({ name, serviceNames, formattedDate, timeSlot }),
    text: buildRequestText({ name, serviceNames, formattedDate, timeSlot }),
  });
}

// ─── Email al cliente: turno confirmado ─────────────────────────────────────

export interface ConfirmationEmailData {
  to: string;
  name: string;
  serviceNames: string[];
  date: string;
  timeSlot: string;
  adminNote?: string | null;
}

export async function sendConfirmationEmail(
  data: ConfirmationEmailData
): Promise<void> {
  const { to, name, serviceNames, date, timeSlot, adminNote } = data;
  const formattedDate = fmtDate(date);

  await createTransporter().sendMail({
    from: FROM(),
    to,
    subject: "Tu turno fue confirmado ✓ — Pauline Studio",
    html: buildConfirmHtml({ name, serviceNames, formattedDate, timeSlot, adminNote }),
    text: buildConfirmText({ name, serviceNames, formattedDate, timeSlot, adminNote }),
  });
}

// ─── Helpers HTML ────────────────────────────────────────────────────────────

const HEADER = (subtitle: string) => `
  <tr><td style="background:#6BBFB5;padding:32px 40px;text-align:center">
    <h1 style="margin:0;color:#fff;font-size:26px;letter-spacing:1px;font-family:Georgia,serif">Pauline Studio</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:14px;font-family:sans-serif">${subtitle}</p>
  </td></tr>`;

const FOOTER = () => `
  <tr><td style="padding:20px 40px;border-top:1px solid #eee;text-align:center">
    <p style="margin:0;font-size:12px;color:#aaa;font-family:sans-serif">© ${new Date().getFullYear()} Pauline Studio · Cosmiatra</p>
  </td></tr>`;

const DETAIL_TABLE = (rows: [string, string][], servicesHtml: string) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF9F7;border-radius:8px">
    <tr><td style="padding:20px 24px">
      <p style="margin:0 0 12px;font-size:11px;font-family:sans-serif;letter-spacing:1px;text-transform:uppercase;color:#999">Detalle del turno</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#777;font-family:sans-serif;vertical-align:top;width:90px">Servicio</td>
          <td style="padding:6px 0;font-size:14px;color:#333;font-family:sans-serif">
            <ul style="margin:0;padding-left:18px">${servicesHtml}</ul>
          </td>
        </tr>
        ${rows.map(([label, value]) => `
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#777;font-family:sans-serif">${label}</td>
          <td style="padding:6px 0;font-size:14px;color:#333;font-family:sans-serif;text-transform:capitalize">${value}</td>
        </tr>`).join("")}
      </table>
    </td></tr>
  </table>`;

const WRAP = (body: string) => `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF9F7;font-family:Georgia,serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
        ${body}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ── Solicitud recibida ──

interface RequestParts {
  name: string;
  serviceNames: string[];
  formattedDate: string;
  timeSlot: string;
}

function buildRequestHtml({ name, serviceNames, formattedDate, timeSlot }: RequestParts) {
  const servicesHtml = serviceNames.map((s) => `<li style="margin:4px 0">${escapeHtml(s)}</li>`).join("");
  return WRAP(`
    ${HEADER("Solicitud de turno recibida")}
    <tr><td style="padding:36px 40px">
      <p style="margin:0 0 20px;font-size:17px;color:#333">Hola, <strong>${escapeHtml(name)}</strong>!</p>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;font-family:sans-serif">
        Recibimos tu solicitud de turno. La revisaremos y te confirmaremos a la brevedad.
      </p>
      ${DETAIL_TABLE([["Fecha", formattedDate], ["Hora", timeSlot + " hs"]], servicesHtml)}
      <p style="margin:24px 0 0;padding:12px 16px;background:#FFF8E1;border-radius:6px;font-size:14px;color:#666;font-family:sans-serif">
        ⏳ Tu turno está <strong>pendiente de confirmación</strong>. Te avisaremos cuando esté confirmado.
      </p>
      <p style="margin:28px 0 0;font-size:14px;color:#777;line-height:1.6;font-family:sans-serif">
        Si necesitás hacer algún cambio, no dudes en contactarnos.
      </p>
    </td></tr>
    ${FOOTER()}
  `);
}

function buildRequestText({ name, serviceNames, formattedDate, timeSlot }: RequestParts) {
  return `Hola ${name},\n\nRecibimos tu solicitud de turno en Pauline Studio.\n\nServicio: ${serviceNames.join(", ")}\nFecha: ${formattedDate}\nHora: ${timeSlot} hs\n\nTu turno está PENDIENTE de confirmación. Te avisaremos cuando esté confirmado.\n\nPauline Studio`;
}

// ── Turno confirmado ──

interface ConfirmParts {
  name: string;
  serviceNames: string[];
  formattedDate: string;
  timeSlot: string;
  adminNote?: string | null;
}

function buildConfirmHtml({ name, serviceNames, formattedDate, timeSlot, adminNote }: ConfirmParts) {
  const servicesHtml = serviceNames.map((s) => `<li style="margin:4px 0">${escapeHtml(s)}</li>`).join("");
  const noteHtml = adminNote
    ? `<p style="margin:24px 0 0;padding:12px 16px;background:#F8E4E0;border-radius:6px;font-size:14px;color:#555;font-family:sans-serif"><strong>Nota del estudio:</strong> ${escapeHtml(adminNote)}</p>`
    : "";
  return WRAP(`
    ${HEADER("Tu turno fue confirmado ✓")}
    <tr><td style="padding:36px 40px">
      <p style="margin:0 0 20px;font-size:17px;color:#333">Hola, <strong>${escapeHtml(name)}</strong>!</p>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;font-family:sans-serif">
        ¡Tu turno está confirmado! Te esperamos.
      </p>
      ${DETAIL_TABLE([["Fecha", formattedDate], ["Hora", timeSlot + " hs"]], servicesHtml)}
      ${noteHtml}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px">
        <tr><td style="padding:16px 20px;background:#FFF8E1;border-left:4px solid #F59E0B;border-radius:0 6px 6px 0">
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#92400E;font-family:sans-serif;text-transform:uppercase;letter-spacing:0.5px">⚠ Política de cancelación</p>
          <p style="margin:0;font-size:14px;color:#78350F;line-height:1.6;font-family:sans-serif">
            En caso de que no puedas asistir, te pedimos amablemente que nos avises con <strong>al menos 48 horas de anticipación</strong>. Esto nos permite reorganizar la agenda y ofrecer el turno a otros clientes. ¡Muchas gracias por tu comprensión!
          </p>
        </td></tr>
      </table>
      <p style="margin:20px 0 0;font-size:14px;color:#777;line-height:1.6;font-family:sans-serif">
        Si necesitás reprogramar o tenés alguna consulta, no dudes en contactarnos.
      </p>
    </td></tr>
    ${FOOTER()}
  `);
}

function buildConfirmText({ name, serviceNames, formattedDate, timeSlot, adminNote }: ConfirmParts) {
  const note = adminNote ? `\nNota del estudio: ${adminNote}` : "";
  return `Hola ${name},\n\nTu turno fue CONFIRMADO en Pauline Studio.\n\nServicio: ${serviceNames.join(", ")}\nFecha: ${formattedDate}\nHora: ${timeSlot} hs${note}\n\n⚠ POLÍTICA DE CANCELACIÓN: En caso de que no puedas asistir, te pedimos que nos avises con al menos 48 horas de anticipación. Esto nos permite reorganizar la agenda y ofrecer el turno a otros clientes. ¡Muchas gracias por tu comprensión!\n\nSi necesitás reprogramar, no dudes en contactarnos.\n\nPauline Studio`;
}

// ─── Email al cliente: recordatorio día anterior ───────────────────────────────────

export interface ReminderEmailData {
  to: string;
  name: string;
  serviceNames: string[];
  date: string;
  timeSlot: string;
}

export async function sendReminderEmail(data: ReminderEmailData): Promise<void> {
  const { to, name, serviceNames, date, timeSlot } = data;
  const formattedDate = fmtDate(date);
  const adminEmail = "spinelli.paulaluciana@gmail.com";
  const servicesHtml = serviceNames.map((s) => `<li style="margin:4px 0">${escapeHtml(s)}</li>`).join("");

  const html = WRAP(`
    ${HEADER("Recordatorio de turno para mañana")}
    <tr><td style="padding:36px 40px">
      <p style="margin:0 0 20px;font-size:17px;color:#333">Hola, <strong>${escapeHtml(name)}</strong>!</p>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;font-family:sans-serif">
        Te recordamos que mañana tenés turno en <strong>Pauline Studio</strong>. ¡Te esperamos!
      </p>
      ${DETAIL_TABLE([["Fecha", formattedDate], ["Hora", timeSlot + " hs"]], servicesHtml)}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px">
        <tr><td style="padding:16px 20px;background:#F0FAF9;border-left:4px solid #6BBFB5;border-radius:0 6px 6px 0">
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#2D6E68;font-family:sans-serif;text-transform:uppercase;letter-spacing:0.5px">📍 Ubicación</p>
          <p style="margin:0;font-size:14px;color:#2D6E68;font-family:sans-serif">
            Av. del Barco Centenera 150, Local 64 · Caballito, CABA
          </p>
        </td></tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px">
        <tr><td style="padding:16px 20px;background:#FFF8E1;border-left:4px solid #F59E0B;border-radius:0 6px 6px 0">
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#92400E;font-family:sans-serif;text-transform:uppercase;letter-spacing:0.5px">⚠ Política de cancelación</p>
          <p style="margin:0;font-size:14px;color:#78350F;line-height:1.6;font-family:sans-serif">
            Si no podés asistir, avisános con anticipación para reorganizar la agenda.
          </p>
        </td></tr>
      </table>
      <p style="margin:28px 0 0;font-size:14px;color:#777;line-height:1.6;font-family:sans-serif">
        Ante cualquier consulta, escribínos por WhatsApp al <strong>11 3419-3424</strong>.
      </p>
    </td></tr>
    ${FOOTER()}
  `);

  await createTransporter().sendMail({
    from: FROM(),
    to,
    cc: adminEmail,
    subject: `Recordatorio: Tu turno es mañana — Pauline Studio`,
    html,
    text: `Hola ${name},\n\nTe recordamos que mañana tenés turno en Pauline Studio.\n\nServicio: ${serviceNames.join(", ")}\nFecha: ${formattedDate}\nHora: ${timeSlot} hs\nUbicación: Av. del Barco Centenera 150, Local 64 · Caballito, CABA\n\nSi no podés asistir, avisános con anticipación.\nConsultas: WhatsApp 11 3419-3424\n\nPauline Studio`,
  });
}
