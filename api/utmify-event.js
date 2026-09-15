// api/utmify-event.js — Vercel Serverless Function
// Envia evento para UTMify com o token seguro no servidor
// Chamado pelo frontend quando o usuário clica em "Copiar Código PIX" (waiting_payment)
// e quando o polling confirma o pagamento (paid)

const UTMIFY_API   = 'https://api.utmify.com.br/api-credentials/orders';
const UTMIFY_TOKEN = 'aAQw1sjHtZrpURZW1FbM1UL9U0AKHljqJgnQ';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { orderId, status, customer, amountCents, createdAt, utms, description } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ error: 'orderId e status são obrigatórios' });
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const amt = parseInt(amountCents || 0);

    const payload = {
      orderId,
      platform:      'ultrafarma',
      paymentMethod: 'pix',
      status,
      createdAt:    createdAt || now,
      approvedDate: status === 'paid' ? now : null,
      customer: {
        name:     customer?.name     || '',
        email:    customer?.email    || '',
        document: customer?.document || '',
        phone:    customer?.phone    || null   // campo obrigatório como string ou null
      },
      products: [{
        id:       orderId,
        planId:   'tirzepatida-tg',            // obrigatório pela UTMify
        planName: description || 'Tirzepatida T.G. Solução Injetável', // obrigatório
        name:     description || 'Tirzepatida T.G. Solução Injetável',
        quantity: 1,
        priceInCents: amt
      }],
      trackingParameters: {
        utm_source:   utms?.utm_source   || null,
        utm_medium:   utms?.utm_medium   || null,
        utm_campaign: utms?.utm_campaign || null,
        utm_content:  utms?.utm_content  || null,  // obrigatório como null se vazio
        utm_term:     utms?.utm_term     || null,  // obrigatório como null se vazio
        src:          utms?.src          || null,
        sck:          utms?.sck          || null
      },
      commission: {
        totalPriceInCents:     amt,
        gatewayFeeInCents:     0,
        userCommissionInCents: amt
      },
      isTest: false
    };

    const utmResp = await fetch(UTMIFY_API, {
      method: 'POST',
      headers: { 'x-api-token': UTMIFY_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const utmData = await utmResp.json().catch(() => ({}));
    console.log('UTMify response:', JSON.stringify(utmData));

    return res.status(200).json({ success: utmResp.ok, utmify: utmData });

  } catch (err) {
    console.error('UTMify event error:', err);
    return res.status(500).json({ error: 'Erro ao notificar UTMify', message: err.message });
  }
}
