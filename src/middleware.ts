import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RATE_LIMIT = Number(process.env.RATE_LIMIT) || 100;

export function middleware(request: NextRequest) {
  // Add your middleware logic here
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};