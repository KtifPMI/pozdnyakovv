import { NextResponse } from 'next/server';
import initSqlJs from 'sql.js';

let db: any = null;
let dbReady = false;

async function getDb() {
  if (db) return db;
  
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });
  
  const dbUrl = process.env.DATABASE_URL;
  
  if (dbUrl) {
    try {
      const response = await fetch(dbUrl);
      const data = await response.arrayBuffer();
      db = new SQL.Database(new Uint8Array(data));
    } catch {
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }
  
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      price INTEGER NOT NULL,
      description TEXT,
      image VARCHAR(500),
      in_stock INTEGER DEFAULT 1
    )
  `);

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

  const result = db.exec('SELECT COUNT(*) as cnt FROM products');
  if (result.length === 0 || result[0].values[0][0] === 0) {
    db.run(`INSERT INTO products (title, price, description, image, in_stock) VALUES ('Classic White Tee', 2500, 'Базовая белая футболка из 100% хлопка', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 1)`);
    db.run(`INSERT INTO products (title, price, description, image, in_stock) VALUES ('Essential Black', 2800, 'Минималистичная черная футболка', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600', 1)`);
    db.run(`INSERT INTO products (title, price, description, image, in_stock) VALUES ('Urban Grey', 3200, 'Серая футболка с урбан дизайном', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600', 0)`);
    db.run(`INSERT INTO products (title, price, description, image, in_stock) VALUES ('Premium Cotton', 4500, 'Премиальная из органического хлопка', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600', 1)`);
  }
  
  return db;
}

const DEMO_PRODUCTS = [
  { id: 1, title: 'Classic White Tee', price: 2500, description: 'Базовая белая футболка из 100% хлопка', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', in_stock: 1 },
  { id: 2, title: 'Essential Black', price: 2800, description: 'Минималистичная черная футболка', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600', in_stock: 1 },
  { id: 3, title: 'Urban Grey', price: 3200, description: 'Серая футболка с урбан дизайном', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600', in_stock: 0 },
  { id: 4, title: 'Premium Cotton', price: 4500, description: 'Премиальная из органического хлопка', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600', in_stock: 1 },
];

export async function GET() {
  try {
    const database = await getDb();
    const result = database.exec('SELECT * FROM products ORDER BY id');
    
    if (result.length === 0) {
      return NextResponse.json(DEMO_PRODUCTS);
    }
    
    const products = result[0].values.map((row: any) => ({
      id: row[0],
      title: row[1],
      price: row[2],
      description: row[3],
      image: row[4],
      in_stock: row[5],
    }));
    
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json(DEMO_PRODUCTS);
  }
}

export async function POST(request: Request) {
  try {
    const database = await getDb();
    const body = await request.json();
    const { title, price, description, image } = body;
    
    database.run(
      'INSERT INTO products (title, price, description, image, in_stock) VALUES (?, ?, ?, ?, 1)',
      [title, price, description, image]
    );
    
    const result = database.exec('SELECT last_insert_rowid()');
    const id = result[0].values[0][0];
    
    return NextResponse.json({ id, title, price, description, image, in_stock: 1 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create product', details: error.message }, { status: 500 });
  }
}
