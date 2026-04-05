import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function GET() {
  try {
    await initDb();
    return NextResponse.json({ success: true, message: 'Database initialized' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}
