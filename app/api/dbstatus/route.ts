import { NextResponse } from 'next/server';
import pg from 'pg';

const { Pool } = pg;

let pool: any = null;

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

export async function GET() {
  const hasDbUrl = !!process.env.DATABASE_URL;
  
  if (!hasDbUrl) {
    return NextResponse.json({
      status: 'NO_DB',
      message: 'DATABASE_URL is not set in environment'
    });
  }
  
  const pool = getPool();
  
  try {
    await pool.query('SELECT 1');
    return NextResponse.json({
      status: 'OK',
      message: 'Database connected successfully'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'ERROR',
      message: error.message
    });
  }
}
