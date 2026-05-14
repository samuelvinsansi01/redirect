export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const { alias, deskUrl, mobUrl } = req.body;
  if (!alias) return res.status(400).json({ error: 'alias é obrigatório' });
  if (!deskUrl && !mobUrl) return res.status(400).json({ error: 'Informe ao menos um link para atualizar' });

  function extractId(url) {
    try { return new URL(url).searchParams.get('node-id'); } catch { return null; }
  }

  const token = process.env.TINYURL_TOKEN;
  const baseUrl = process.env.BASE_URL || 'https://redirect-self-delta.vercel.app';

  // Busca a URL atual do alias para pegar os IDs que não foram alterados
  const getRes = await fetch(`https://api.tinyurl.com/alias/tinyurl.com/${alias}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!getRes.ok) return res.status(404).json({ error: 'Alias não encontrado no TinyURL' });

  const getData = await getRes.json();
  const currentLongUrl = getData.data?.url || '';

  let currentDeskId, currentMobId;
  try {
    const u = new URL(currentLongUrl);
    currentDeskId = u.searchParams.get('d');
    currentMobId  = u.searchParams.get('m');
  } catch {
    return res.status(500).json({ error: 'Não foi possível ler a URL atual' });
  }

  const finalDeskId = deskUrl ? (extractId(deskUrl) || currentDeskId) : currentDeskId;
  const finalMobId  = mobUrl  ? (extractId(mobUrl)  || currentMobId)  : currentMobId;

  const newLongUrl = `${baseUrl}/r?d=${encodeURIComponent(finalDeskId)}&m=${encodeURIComponent(finalMobId)}`;

  const updateRes = await fetch(`https://api.tinyurl.com/alias/tinyurl.com/${alias}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: newLongUrl, domain: 'tinyurl.com', alias }),
  });

  if (!updateRes.ok) {
    const d = await updateRes.json().catch(() => ({}));
    return res.status(400).json({ error: d.errors?.[0] || 'Erro ao atualizar no TinyURL' });
  }

  return res.status(200).json({ ok: true });
}
