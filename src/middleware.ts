import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

interface UserSession {
  userId: string
  role: "admin" | "user"
  expiresAt: number
}

export function middleware(request: NextRequest) {
  const rawSession = request.cookies.get("__session")
  const session: UserSession = rawSession ? JSON.parse(rawSession.value) : null

  if (session && session.expiresAt < Date.now()) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (session?.role !== "admin" && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
