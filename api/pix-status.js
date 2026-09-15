// api/pix-status.js — Vercel Serverless Function
// Consulta status de uma transação FlevoPay pelo transaction_id

const FLEVOPAY_KEY = 'flevopay_sk_4d2f2349cd060b2eb9d2346923037759f1c3b617645417359fc96c8a80ea2429';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Parâmetro id obrigatório' });

  try {
    const url = `https://app.flevopay.com.br/api/v1/query?action=get_transaction&id=${encodeURIComponent(id)}`;
    const response = await fetch(url, {
      headers: { 'X-API-Key': FLEVOPAY_KEY }
    });

    const data = await response.json();

    return res.status(200).json({
      status: data.status || 'pending',
      id: data.id,
      external_id: data.external_id,
      amount: data.amount
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao consultar status', status: 'pending' });
  }
}
