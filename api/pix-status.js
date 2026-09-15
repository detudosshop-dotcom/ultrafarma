// api/pix-status.js — Vercel Serverless Function
// Consulta status FlevoPay e notifica UTMify quando PIX for pago

const FLEVOPAY_KEY = 'flevopay_sk_4d2f2349cd060b2eb9d2346923037759f1c3b617645417359fc96c8a80ea2429';
const UTMIFY_API   = 'https://api.utmify.com.br/api-credentials/orders';
const UTMIFY_TOKEN = 'aAQw1sjHtZrpURZW1FbM1UL9U0AKHljqJgnQ';

function nowUTC() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

async function notifyUtmifyPaid(orderId, customer, amountCents, createdAt, utms = {}) {
  try {
    await fetch(UTMIFY_API, {
      method: 'POST',
      headers: {
        'x-api-token': UTMIFY_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderId,
        platform:      'ultrafarma',
        paymentMethod: 'pix',
        status:        'paid',
        createdAt:     createdAt || nowUTC(),
        approvedDate:  nowUTC(),
        customer: {
          name:     customer.name     || '',
          email:    customer.email    || '',
          document: customer.document || ''
        },
        products: [{
          id:           orderId,
          name:         'Tirzepatida T.G. Solução Injetável',
          quantity:     1,
          priceInCents: amountCents
        }],
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
      })
    });
  } catch (e) {
    console.warn('UTMify paid notify error:', e.message);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id, order_id, created_at, amount, customer_name, customer_email, customer_doc, utms } = req.query;
  if (!id) return res.status(400).json({ error: 'Parâmetro id obrigatório' });

  try {
    const url = `https://app.flevopay.com.br/api/v1/query?action=get_transaction&id=${encodeURIComponent(id)}`;
    const response = await fetch(url, {
      headers: { 'X-API-Key': FLEVOPAY_KEY }
    });

    const data = await response.json();
    const isPaid = data.status === 'paid' || data.payment_status === 'paid';

    // Se pago, notifica UTMify
    if (isPaid && order_id) {
      const parsedUtms = utms ? JSON.parse(decodeURIComponent(utms)) : {};
      await notifyUtmifyPaid(
        order_id,
        { name: customer_name || '', email: customer_email || '', document: customer_doc || '' },
        parseInt(amount || data.amount || 0),
        created_at || null,
        parsedUtms
      );
    }

    return res.status(200).json({
      status:     isPaid ? 'approved' : (data.status || 'pending'),
      id:         data.id,
      amount:     data.amount
    });

  } catch (err) {
    return res.status(500).json({ error: 'Erro ao consultar status', status: 'pending' });
  }
}
