import { NextResponse } from 'next/server';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  
  return NextResponse.json({
    envCheck: 'ok',
    hasDbUrl: !!dbUrl,
    dbUrlPreview: dbUrl ? dbUrl.substring(0, 30) + '...' : 'not set'
  });
}
