import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({
      error: 'No database pool',
      envDbUrl: !!process.env.DATABASE_URL,
      message: 'DATABASE_URL not found. Please add it in project settings.'
    }, { status: 500 });
  }
  
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Database query failed', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ error: 'Database not configured. Add DATABASE_URL in project settings.' }, { status: 500 });
  }
  
  try {
    const body = await request.json();
    const { title, price, description, image } = body;
    
    const result = await pool.query(
      'INSERT INTO products (title, price, description, image, in_stock) VALUES ($1, $2, $3, $4, true) RETURNING *',
      [title, price, description, image]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create product', details: error.message }, { status: 500 });
  }
}
