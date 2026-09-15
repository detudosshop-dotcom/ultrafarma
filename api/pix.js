// api/pix.js — Vercel Serverless Function
// Proxy seguro para FlevoPay + notificação UTMify (waiting_payment)

const FLEVOPAY_API  = 'https://app.flevopay.com.br/api/v1/transaction';
const FLEVOPAY_KEY  = 'flevopay_sk_4d2f2349cd060b2eb9d2346923037759f1c3b617645417359fc96c8a80ea2429';
const UTMIFY_API    = 'https://api.utmify.com.br/api-credentials/orders';
const UTMIFY_TOKEN  = 'aAQw1sjHtZrpURZW1FbM1UL9U0AKHljqJgnQ';

function nowUTC() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

async function notifyUtmify(payload) {
  try {
    await fetch(UTMIFY_API, {
      method: 'POST',
      headers: {
        'x-api-token': UTMIFY_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn('UTMify notify error:', e.message);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      amount, customer, address, description, reference,
      utms = {}, products = []
    } = req.body;

    if (!amount || !customer || !reference) {
      return res.status(400).json({ error: 'Campos obrigatórios: amount, customer, reference' });
    }

    const payload = {
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
    };

    const fResponse = await fetch(FLEVOPAY_API, {
      method: 'POST',
      headers: { 'X-API-Key': FLEVOPAY_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await fResponse.json();

    if (!fResponse.ok) {
      return res.status(fResponse.status).json({ error: data.message || 'Erro FlevoPay', details: data });
    }

    // Gera imagem do QR Code via Google Charts (FlevoPay retorna qr_code_base64 vazio)
    const qrText     = data.qr_code || '';
    const qrImageUrl = qrText
      ? 'https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=' + encodeURIComponent(qrText) + '&choe=UTF-8'
      : '';

    const createdAt = nowUTC();
    const amountCents = Math.round(amount);

    // Notifica UTMify: PIX gerado (waiting_payment)
    const productList = products.length > 0 ? products : [{
      id:           reference,
      name:         description || 'Tirzepatida T.G. Solução Injetável',
      quantity:     1,
      priceInCents: amountCents
    }];

    await notifyUtmify({
      orderId:       reference,
      platform:      'ultrafarma',
      paymentMethod: 'pix',
      status:        'waiting_payment',
      createdAt,
      approvedDate:  null,
      customer: {
        name:     customer.name,
        email:    customer.email,
        document: customer.document || ''
      },
      products: productList,
      trackingParameters: {
        utm_source:   utms.utm_source   || null,
        utm_medium:   utms.utm_medium   || null,
        utm_campaign: utms.utm_campaign || null,
        utm_content:  utms.utm_content  || null,
        utm_term:     utms.utm_term     || null,
        src:          utms.src          || null,
        sck:          utms.sck          || null
      },
      commission: {
        totalPriceInCents:     amountCents,
        gatewayFeeInCents:     0,
        userCommissionInCents: amountCents
      },
      isTest: false
    });

    return res.status(200).json({
      success:        true,
      transaction_id: data.transaction_id,
      qr_code_text:   qrText,
      qr_code_image:  qrImageUrl,
      amount:         data.amount,
      created_at:     createdAt,
      expires_at:     data.expires_at
    });

  } catch (err) {
    console.error('PIX proxy error:', err);
    return res.status(500).json({ error: 'Erro interno ao gerar PIX', message: err.message });
  }
}
