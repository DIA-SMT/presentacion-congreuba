// Puente entre la presentación y el chat web real de Migue.
//
// El navegador no puede llamar directo a migue.smt.gob.ar/api/chat (el chat
// sólo acepta los orígenes del municipio), así que la pantalla le pregunta acá
// y esta función reenvía la consulta del lado del servidor.
//
// Sólo atiende pedidos que salen de la misma presentación (el navegador manda
// Origin en cada POST): así otra página no puede usar este puente para
// escribirle a Migue y comerse el límite de consultas por minuto que tiene el chat.
const MIGUE_CHAT = 'https://migue.smt.gob.ar/api/chat';

function mismoSitio(req) {
    const desde = req.headers.origin || req.headers.referer || '';
    const aca = req.headers['x-forwarded-host'] || req.headers.host || '';
    try { return !!aca && new URL(desde).host === aca; } catch { return false; }
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
    if (!mismoSitio(req)) return res.status(403).json({ error: 'Pedido de otro sitio' });

    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    const mensaje = String((body && body.mensaje) || '').trim().slice(0, 400);
    const sessionId = String((body && body.sessionId) || 'presentacion').slice(0, 80);
    if (!mensaje) return res.status(400).json({ error: 'Falta la pregunta' });

    try {
        const r = await fetch(MIGUE_CHAT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje, sessionId }),
            signal: AbortSignal.timeout(55000),
        });
        const j = await r.json().catch(() => ({}));
        return res.status(r.status).json({ respuesta: j.respuesta || null, error: j.error || null });
    } catch (e) {
        return res.status(502).json({ error: 'Migue no respondió a tiempo' });
    }
};
