import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendToTelegram(message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
    }),
  });
}

export async function POST(request: Request) {
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }
  
  try {
    const body = await request.json();
    const { product, name, phone, email, comment } = body;
    
    const result = await pool.query(
      'INSERT INTO orders (product, name, phone, email, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [product, name, phone, email, comment]
    );

    const message = `🛒 НОВЫЙ ЗАКАЗ!\n\nТовар: ${product}\nИмя: ${name}\nТелефон: ${phone}\nEmail: ${email}\nКомментарий: ${comment || '-'}`;
    
    sendToTelegram(message);
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET() {
  const pool = getPool();
  if (!pool) {
    return NextResponse.json([]);
  }
  
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
