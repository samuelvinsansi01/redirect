const REDIS_URL   = process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN;

async function redisGet(key) {
  const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  console.log('Redis raw response:', JSON.stringify(data));
  const raw = data.result;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    // se ainda for string, parseia de novo
    if (typeof parsed === 'string') return JSON.parse(parsed);
    return parsed;
  } catch { return null; }
}

function isMobileUA(userAgent) {
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent || '');
}

export default async function handler(req, res) {
  const { alias } = req.query;

  if (!alias)
    return res.status(400).send('Parâmetro alias ausente.');

  let record;
  try {
    record = await redisGet(`redirect:${alias}`);
  } catch (err) {
    console.error('Redis error:', err);
    return res.status(500).send('Erro ao buscar dados. Tente novamente.');
  }

  if (!record)
    return res.status(404).send(`Link "${alias}" não encontrado ou expirado.`);

  const ua     = req.headers['user-agent'] || '';
  const mobile = isMobileUA(ua);
  const target = mobile ? record.mobUrl : record.deskUrl;

  if (!target)
    return res.status(500).send('Link de destino não configurado.');

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  return res.redirect(302, target);
}
