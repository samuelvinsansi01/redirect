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
    if (typeof parsed === 'string') return JSON.parse(parsed);
    return parsed;
  } catch { return null; }
}

function isMobileUA(ua) {
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua || '');
}

export default async function handler(req, res) {
  console.log('handler called, url:', req.url);

  const url = new URL(req.url, 'https://placeholder.com');
  const alias = url.searchParams.get('alias');

  console.log('alias extraído:', alias);

  if (!alias)
    return res.status(400).send('Parâmetro alias ausente.');

  let record;
  try {
    record = await redisGet(`redirect:${alias}`);
  } catch (err) {
    console.error('Redis error:', err);
    return res.status(500).send('Erro ao buscar dados. Tente novamente.');
  }

  console.log('record:', JSON.stringify(record));
  console.log('record:', JSON.stringify(record));
  console.log('record keys:', Object.keys(record || {}));
  console.log('deskUrl:', record?.deskUrl);
  console.log('mobUrl:', record?.mobUrl);
  console.log('record type:', typeof record);

  if (!record)
    return res.status(404).send(`Link "${alias}" não encontrado ou expirado.`);

  const ua     = req.headers['user-agent'] || '';
  const mobile = isMobileUA(ua);
  const target = mobile ? record.mobUrl : record.deskUrl;

  console.log('target:', target);

  if (!target)
    return res.status(500).send('Link de destino não configurado.');

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  return res.redirect(302, target);
}
