import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const INVALID_CONFIG: number = "should-be-string";

export function middleware(request: NextRequest): void {
  return NextResponse.next();
}
