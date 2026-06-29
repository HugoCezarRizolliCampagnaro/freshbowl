export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const { total, cart, customer } = req.body;
    if (!total || !cart || !customer) return res.status(400).json({ error: 'Dados incompletos' });

    const identifier = `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const body = {
      identifier,
      amount: total,
      client: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        document: customer.cpf,
      },
      products: cart.map((item, i) => ({
        id: `item-${i}`,
        name: item.name,
        quantity: 1,
        price: item.price,
      })),
    };

    const response = await fetch('https://app.sigilopay.com.br/api/v1/gateway/pix/receive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': process.env.SIGILOPAY_PUBLIC_KEY,
        'x-secret-key': process.env.SIGILOPAY_SECRET_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.message || 'Erro ao gerar Pix' });

    return res.status(200).json({
      transactionId: data.transactionId,
      pixCode: data.pix?.code,
      pixImage: data.pix?.image,
      pixBase64: data.pix?.base64,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
