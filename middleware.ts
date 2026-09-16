import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

const publicRoutes = [
    '/login', 
    '/register', 
    '/api/auth/login', 
    '/api/auth/register',
    '/api/auth/verify-email',
    '/surveys/view',
    '/api/surveys/public',
    '/api/surveys/responses'
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Let public routes pass
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Next.js internals
    if (pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
        return NextResponse.next();
    }

    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        if (pathname.startsWith('/api')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
        if (pathname.startsWith('/api')) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role Access Control: Normal users/admins only access /tracking. SuperAdmin sees everything.
    if (payload.role !== 'SuperAdmin') {
        const isTrackingRoute = pathname === '/tracking' || pathname.startsWith('/tracking/');
        const isApiRoute = pathname.startsWith('/api');
        
        if (!isTrackingRoute && !isApiRoute) {
            return NextResponse.redirect(new URL('/tracking', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
