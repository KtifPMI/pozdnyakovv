import { NextResponse } from 'next/server';
import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

const DEMO_PRODUCTS = [
  { id: 1, title: 'Classic White Tee', price: 2500, description: 'Базовая белая футболка из 100% хлопка', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', in_stock: true },
  { id: 2, title: 'Essential Black', price: 2800, description: 'Минималистичная черная футболка', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600', in_stock: true },
  { id: 3, title: 'Urban Grey', price: 3200, description: 'Серая футболка с урбан дизайном', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600', in_stock: false },
  { id: 4, title: 'Premium Cotton', price: 4500, description: 'Премиальная из органического хлопка', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600', in_stock: true },
];

export async function GET() {
  const dbPool = getPool();
  
  if (!dbPool) {
    return NextResponse.json(DEMO_PRODUCTS);
  }
  
  try {
    const result = await dbPool.query('SELECT * FROM products ORDER BY id');
    if (result.rows.length === 0) {
      for (const p of DEMO_PRODUCTS) {
        await dbPool.query(
          'INSERT INTO products (title, price, description, image, in_stock) VALUES ($1, $2, $3, $4, $5)',
          [p.title, p.price, p.description, p.image, p.in_stock]
        );
      }
      return NextResponse.json(DEMO_PRODUCTS);
    }
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json(DEMO_PRODUCTS);
  }
}

export async function POST(request: Request) {
  const dbPool = getPool();
  if (!dbPool) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }
  
  try {
    const body = await request.json();
    const { title, price, description, image } = body;
    
    const result = await dbPool.query(
      'INSERT INTO products (title, price, description, image, in_stock) VALUES ($1, $2, $3, $4, true) RETURNING *',
      [title, price, description, image]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create product', details: error.message }, { status: 500 });
  }
}
