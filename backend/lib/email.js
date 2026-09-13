// Único punto de integración con un proveedor de correo transaccional.
// Sin dependencia npm: usa el fetch global de Node 18+ (mismo patrón que lib/llm.js).
//
//   EMAIL_PROVIDER  = 'none' (def.) | 'resend'
//   RESEND_API_KEY
//   RESEND_FROM_EMAIL = 'Campus Posgrado <onboarding@resend.dev>' (def.; usar un
//     remitente del dominio propio una vez verificado en Resend)
//   FRONTEND_URL    = 'https://campus-posgrado-v2.vercel.app' (def.) -> base del
//     enlace de restablecimiento y del campus en el correo de bienvenida
//
// Cuando PROVIDER='none' (o falta la API key) no se envía nada: se deja
// registrado en consola el enlace, para poder probar el flujo completo en
// desarrollo local sin cuenta de correo.

const PROVIDER = (process.env.EMAIL_PROVIDER || 'none').toLowerCase();
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const FROM = process.env.RESEND_FROM_EMAIL || 'Campus Posgrado <onboarding@resend.dev>';
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://campus-posgrado-v2.vercel.app').replace(/\/$/, '');
const RESEND_URL = 'https://api.resend.com/emails';

function enabled() {
  return PROVIDER === 'resend' && !!RESEND_KEY;
}

function status() {
  return { provider: PROVIDER, configured: enabled() };
}

function sendInBackground(job, label) {
  Promise.resolve()
    .then(() => job())
    .then((result) => {
      if (result && result.sent) console.log(`[email] ${label} enviado`);
    })
    .catch((err) => console.error(`[email] ${label}:`, err.message));
}

function resetEmailHtml(name, resetUrl) {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#1f2937">
    <h2 style="color:#111827">Restablece tu contraseña</h2>
    <p>Hola ${name || ''},</p>
    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Campus Posgrado. Si no fuiste tú, puedes ignorar este correo: tu contraseña actual sigue siendo válida.</p>
    <p style="margin:28px 0">
      <a href="${resetUrl}" style="background:#dc2626;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Elegir nueva contraseña</a>
    </p>
    <p style="font-size:13px;color:#6b7280">El enlace vence en 1 hora. Si el botón no funciona, copia y pega esta URL en tu navegador:<br>${resetUrl}</p>
  </div>`;
}

// Devuelve { sent: boolean }. Nunca lanza: un fallo de envío no debe romper
// el flujo de "olvidé mi contraseña" (que igual responde éxito genérico).
async function sendPasswordResetEmail({ toEmail, toName, token }) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  if (!enabled()) {
    console.log(`[email] EMAIL_PROVIDER no configurado; enlace de restablecimiento para ${toEmail}: ${resetUrl}`);
    return { sent: false, resetUrl };
  }
  try {
    const r = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: FROM,
        to: [toEmail],
        subject: 'Restablece tu contraseña — Campus Posgrado',
        html: resetEmailHtml(toName, resetUrl),
      }),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error(`[email] Resend respondió ${r.status} al enviar a ${toEmail}: ${detail.slice(0, 300)}`);
      return { sent: false, resetUrl };
    }
    return { sent: true, resetUrl };
  } catch (err) {
    console.error(`[email] fallo de red enviando a ${toEmail}:`, err.message);
    return { sent: false, resetUrl };
  }
}

function welcomeHtml(name) {
  const greeting = name ? `Hola ${name}` : 'Hola';
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#1f2937">
    <h2 style="color:#111827">Bienvenido a Campus Posgrado</h2>
    <p>${greeting},</p>
    <p>Tu cuenta ya está registrada. Un administrador debe aprobarla antes de que puedas entrar al campus.</p>
    <p style="margin:28px 0">
      <a href="${FRONTEND_URL}" style="background:#dc2626;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Ir al campus</a>
    </p>
  </div>`;
}

async function sendWelcome({ to, name }) {
  if (!enabled()) {
    console.log(`[email] EMAIL_PROVIDER no configurado; bienvenida omitida para ${to}`);
    return { sent: false };
  }
  try {
    const r = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: 'Bienvenido a Campus Posgrado',
        html: welcomeHtml(name),
        text: `${name ? `Hola ${name}` : 'Hola'},\n\nTu cuenta ya está registrada. Un administrador debe aprobarla antes de que puedas entrar.\n${FRONTEND_URL}\n`,
      }),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error(`[email] Resend respondió ${r.status} al enviar bienvenida a ${to}: ${detail.slice(0, 300)}`);
      return { sent: false };
    }
    return { sent: true };
  } catch (err) {
    console.error(`[email] fallo de red enviando bienvenida a ${to}:`, err.message);
    return { sent: false };
  }
}

module.exports = { enabled, status, sendInBackground, sendWelcome, sendPasswordResetEmail, FRONTEND_URL };
