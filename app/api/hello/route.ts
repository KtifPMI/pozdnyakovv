import { NextResponse } from 'next/server';

export async function GET() {
  const hasDb = !!process.env.DATABASE_URL;
  const dbStatus = hasDb ? 'set' : 'not set';
  const nodeEnv = process.env.NODE_ENV;
  
  return NextResponse.json({
    status: 'ok',
    nodeEnv,
    hasDbUrl: hasDb,
    dbStatus
  });
}
