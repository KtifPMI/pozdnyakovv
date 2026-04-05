import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API is working',
    env: {
      hasDbUrl: !!process.env.DATABASE_URL,
      hasTelegram: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    }
  });
}
