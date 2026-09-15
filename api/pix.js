// api/pix.js — Vercel Serverless (ESM, sem pacotes externos)
// Retorna o texto EMV do PIX — o QR Code é gerado no frontend com qrcodejs

const FLEVOPAY_API = 'https://app.flevopay.com.br/api/v1/transaction';
const FLEVOPAY_KEY = 'flevopay_sk_4d2f2349cd060b2eb9d2346923037759f1c3b617645417359fc96c8a80ea2429';

function nowUTC() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { amount, customer, address, description, reference } = req.body;

    if (!amount || !customer || !reference) {
      return res.status(400).json({ error: 'Campos obrigatórios: amount, customer, reference' });
    }

    const fResponse = await fetch(FLEVOPAY_API, {
      method: 'POST',
      headers: { 'X-API-Key': FLEVOPAY_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount:      Math.round(amount),
        description: description || 'Tirzepatida T.G. - Ultrafarma',
        reference,
        source:      'api_externa',
        customer: {
          name:     customer.name,
          email:    customer.email,
          document: customer.document,
          phone:    customer.phone
        },
        address: address || undefined
      })
    });

    const data = await fResponse.json();

    if (!fResponse.ok) {
      return res.status(fResponse.status).json({ error: data.message || 'Erro FlevoPay', details: data });
    }

    return res.status(200).json({
      success:        true,
      transaction_id: data.transaction_id,
      qr_code_text:   data.qr_code || '',   // texto EMV — QR gerado no frontend
      amount:         data.amount,
      created_at:     nowUTC(),
      expires_at:     data.expires_at
    });

  } catch (err) {
    console.error('PIX error:', err.message);
    return res.status(500).json({ error: 'Erro interno', message: err.message });
  }
}
