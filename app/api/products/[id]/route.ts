import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }
  
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, price, description, image, in_stock } = body;
    
    const result = await pool.query(
      'UPDATE products SET title = $1, price = $2, description = $3, image = $4, in_stock = $5 WHERE id = $6 RETURNING *',
      [title, price, description, image, in_stock, id]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }
  
  try {
    const { id } = await params;
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
