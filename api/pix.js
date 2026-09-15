// api/pix.js — Vercel Serverless Function
// Proxy seguro para FlevoPay: chama a API do lado do servidor
// A secret key NUNCA fica exposta no frontend

const FLEVOPAY_API = 'https://app.flevopay.com.br/api/v1/transaction';
const FLEVOPAY_KEY = 'flevopay_sk_4d2f2349cd060b2eb9d2346923037759f1c3b617645417359fc96c8a80ea2429';

export default async function handler(req, res) {
  // CORS para permitir chamadas do frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, customer, address, description, reference } = req.body;

    if (!amount || !customer || !reference) {
      return res.status(400).json({ error: 'Campos obrigatórios: amount, customer, reference' });
    }

    const payload = {
      amount: Math.round(amount),       // valor em centavos
      description: description || 'Tirzepatida T.G. - Ultrafarma',
      reference: reference,
      source: 'api_externa',            // ignora validação de productHash
      customer: {
        name: customer.name,
        email: customer.email,
        document: customer.document,    // CPF apenas números
        phone: customer.phone           // DDD+número apenas números
      },
      address: address || undefined
    };

    const response = await fetch(FLEVOPAY_API, {
      method: 'POST',
      headers: {
        'X-API-Key': FLEVOPAY_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Erro na API FlevoPay', details: data });
    }

    // FlevoPay retorna qr_code (texto EMV) mas qr_code_base64 vem vazio.
    // Geramos a imagem do QR via Google Charts API usando o texto EMV.
    const qrText = data.qr_code || '';
    const qrImageUrl = qrText
      ? 'https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=' + encodeURIComponent(qrText) + '&choe=UTF-8'
      : '';

    return res.status(200).json({
      success: true,
      transaction_id: data.transaction_id,
      qr_code_text:  qrText,
      qr_code_image: qrImageUrl,
      amount:        data.amount,
      expires_at:    data.expires_at
    });

  } catch (err) {
    console.error('FlevoPay proxy error:', err);
    return res.status(500).json({ error: 'Erro interno ao gerar PIX', message: err.message });
  }
}
