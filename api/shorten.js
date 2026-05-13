export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { deskId, mobId, companyName } = req.body;

  if (!deskId || !mobId) {
    return res.status(400).json({ error: 'deskId e mobId são obrigatórios' });
  }

  if (!companyName) {
    return res.status(400).json({ error: 'Nome da empresa é obrigatório' });
  }

  // Normaliza o nome: minúsculas, remove acentos, substitui espaços e caracteres especiais por hífen
  const normalized = companyName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50); // limite de 50 chars antes do sufixo

  const alias = `${normalized}-vin`;
  const token = process.env.TINYURL_TOKEN;
  const baseUrl = process.env.BASE_URL || 'https://redirect-self-delta.vercel.app';
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
      // TinyURL retorna erro específico quando o alias já existe
      const errMsg = data.errors?.[0] || '';
      if (errMsg.toLowerCase().includes('alias') || errMsg.toLowerCase().includes('taken') || errMsg.toLowerCase().includes('exist')) {
        return res.status(409).json({ error: `O link "tinyurl.com/${alias}" já existe. Tente um nome diferente para a empresa.` });
      }
      return res.status(400).json({ error: errMsg || 'Erro ao criar link TinyURL' });
    }

    return res.status(200).json({ shortUrl: data.data.tiny_url, alias });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno ao chamar TinyURL' });
  }
}
