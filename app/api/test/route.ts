import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  const hasDbUrl = !!process.env.DATABASE_URL;
  const dbUrlPreview = process.env.DATABASE_URL 
    ? process.env.DATABASE_URL.replace(/\/[^/]+@/, '/****@') 
    : 'not set';
  
  const pool = getPool();
  
  if (!pool) {
    return NextResponse.json({
      status: 'no pool',
      hasDbUrl,
      dbUrlPreview,
      message: 'DATABASE_URL not configured'
    });
  }
  
  try {
    const result = await pool.query('SELECT NOW()');
    return NextResponse.json({
      status: 'connected',
      hasDbUrl,
      dbUrlPreview,
      time: result.rows[0].now
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      hasDbUrl,
      dbUrlPreview,
      error: error.message
    });
  }
}
