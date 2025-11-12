import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // Protect dashboard route with simple auth cookie check
  if (pathname.startsWith('/dashboard')) {
    const auth = req.cookies.get('refiner_auth')?.value
    if (!auth) {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('login', '1')
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard'],
}


