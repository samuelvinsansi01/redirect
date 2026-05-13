export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { deskId, mobId } = req.body;

  if (!deskId || !mobId) {
    return res.status(400).json({ error: 'deskId e mobId são obrigatórios' });
  }

  const token = process.env.TINYURL_TOKEN;
  const alias = `${req.body.alias || 'redirect'}-vin`;
  const baseUrl = process.env.BASE_URL || 'https://figma-redirect.vercel.app';
  const longUrl = `${baseUrl}/r?d=${encodeURIComponent(deskId)}&m=${encodeURIComponent(mobId)}`;

  try {
    const response = await fetch('https://api.tinyurl.com/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: longUrl,
        alias: alias,
        domain: 'tinyurl.com',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({ error: data.errors?.[0] || 'Erro ao criar link TinyURL' });
    }

    return res.status(200).json({ shortUrl: data.data.tiny_url });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno ao chamar TinyURL' });
  }
}
