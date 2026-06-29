export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID não informado' });

    const response = await fetch(
      `https://app.sigilopay.com.br/api/v1/gateway/transactions?id=${encodeURIComponent(id)}`,
      {
        method: 'GET',
        headers: {
          'x-public-key': process.env.SIGILOPAY_PUBLIC_KEY,
          'x-secret-key': process.env.SIGILOPAY_SECRET_KEY,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.message || 'Erro ao consultar' });

    return res.status(200).json({ status: data.status });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
