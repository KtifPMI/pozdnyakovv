import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request: Request) {
  const body = await request.json();
  const { product, name, phone, email, comment } = body;
  
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    const message = `🛒 НОВЫЙ ЗАКАЗ!\n\nТовар: ${product}\nИмя: ${name}\nТелефон: ${phone}\nEmail: ${email}\nКомментарий: ${comment || '-'}`;
    
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
  
  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json([]);
}
