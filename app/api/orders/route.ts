import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    const message = `🛒 НОВЫЙ ЗАКАЗ!\n\nТовар: ${body.product}\nИмя: ${body.name}\nТелефон: ${body.phone}\nEmail: ${body.email}\nКомментарий: ${body.comment || '-'}`;
    
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
    });
  }
  
  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json([]);
}
