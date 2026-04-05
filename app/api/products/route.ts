import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  const pool = getPool();
  if (!pool) {
    return NextResponse.json([
      { id: 1, title: 'Classic White Tee', price: 2500, description: 'Базовая белая футболка', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', in_stock: true },
      { id: 2, title: 'Essential Black', price: 2800, description: 'Черная футболка', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600', in_stock: true },
      { id: 3, title: 'Urban Grey', price: 3200, description: 'Серая футболка', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600', in_stock: false },
      { id: 4, title: 'Premium Cotton', price: 4500, description: 'Премиальная', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600', in_stock: true },
    ]);
  }
  
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }
  
  try {
    const body = await request.json();
    const { title, price, description, image } = body;
    
    const result = await pool.query(
      'INSERT INTO products (title, price, description, image, in_stock) VALUES ($1, $2, $3, $4, true) RETURNING *',
      [title, price, description, image]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
