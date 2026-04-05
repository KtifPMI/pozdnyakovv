import { NextResponse } from 'next/server';

export async function GET() {
  const hasDbUrl = !!process.env.DATABASE_URL;
  
  if (!hasDbUrl) {
    return NextResponse.json({
      status: 'NO_DB',
      message: 'DATABASE_URL is not set',
      check: 'Enable auto-inject in PostgreSQL settings'
    }, { status: 200 });
  }
  
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    
    await pool.query('SELECT 1');
    await pool.end();
    
    return NextResponse.json({
      status: 'OK',
      message: 'Database connected'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'ERROR',
      message: error.message
    }, { status: 200 });
  }
}
