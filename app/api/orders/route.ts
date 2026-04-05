import { NextResponse } from 'next/server';
import { kv, isKVAvailable } from '@onreza/runtime/kv';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendToTelegram(message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
    });
  } catch (e) {
    console.error('Telegram error:', e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product, name, phone, email, comment } = body;
    
    const orders: any[] = isKVAvailable() ? (await kv.get('orders', { type: 'json' })) || [] : [];
    const newOrder = { id: Date.now(), product, name, phone, email, comment, status: 'new', created_at: new Date().toISOString() };
    orders.push(newOrder);
    
    if (isKVAvailable()) {
      await kv.set('orders', JSON.stringify(orders));
    }

    const message = `🛒 НОВЫЙ ЗАКАЗ!\n\nТовар: ${product}\nИмя: ${name}\nТелефон: ${phone}\nEmail: ${email}\nКомментарий: ${comment || '-'}`;
    sendToTelegram(message);
    
    return NextResponse.json(newOrder);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create order', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const orders = isKVAvailable() ? (await kv.get('orders', { type: 'json' })) || [] : [];
    return NextResponse.json(orders.reverse());
  } catch (error: any) {
    return NextResponse.json([]);
  }
}
