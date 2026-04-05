import { Pool } from 'pg';

let pool: Pool | null = null;

export async function initDb() {
  if (!process.env.DATABASE_URL) return;
  
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  
  const client = await pool.connect();
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      price INTEGER NOT NULL,
      description TEXT,
      image VARCHAR(500),
      in_stock BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      product VARCHAR(255),
      name VARCHAR(255),
      phone VARCHAR(50),
      email VARCHAR(255),
      comment TEXT,
      status VARCHAR(50) DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const result = await client.query('SELECT COUNT(*) as cnt FROM products');
  if (parseInt(result.rows[0].cnt) === 0) {
    await client.query(`
      INSERT INTO products (title, price, description, image, in_stock) VALUES
      ('Classic White Tee', 2500, 'Базовая белая футболка из 100% хлопка', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', true),
      ('Essential Black', 2800, 'Минималистичная черная футболка', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600', true),
      ('Urban Grey', 3200, 'Серая футболка с урбан дизайном', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600', false),
      ('Premium Cotton', 4500, 'Премиальная из органического хлопка', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600', true)
    `);
  }
  
  client.release();
}

export function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}
