import { NextResponse } from 'next/server';
import initSqlJs from 'sql.js';

let db: any = null;

async function getDb() {
  if (db) return db;
  
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });
  
  db = new SQL.Database();
  
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product VARCHAR(255),
      name VARCHAR(255),
      phone VARCHAR(50),
      email VARCHAR(255),
      comment TEXT,
      status VARCHAR(50) DEFAULT 'new'
    )
  `);
  
  return db;
}

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
    const database = await getDb();
    const body = await request.json();
    const { product, name, phone, email, comment } = body;
    
    database.run(
      'INSERT INTO orders (product, name, phone, email, comment) VALUES (?, ?, ?, ?, ?)',
      [product, name, phone, email, comment]
    );

    const message = `🛒 НОВЫЙ ЗАКАЗ!\n\nТовар: ${product}\nИмя: ${name}\nТелефон: ${phone}\nEmail: ${email}\nКомментарий: ${comment || '-'}`;
    sendToTelegram(message);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create order', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const database = await getDb();
    const result = database.exec('SELECT * FROM orders ORDER BY id DESC');
    
    if (result.length === 0) {
      return NextResponse.json([]);
    }
    
    const orders = result[0].values.map((row: any) => ({
      id: row[0],
      product: row[1],
      name: row[2],
      phone: row[3],
      email: row[4],
      comment: row[5],
      status: row[6],
    }));
    
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json([]);
  }
}
