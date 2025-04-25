import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { config as appConfig } from './config'

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    if (path === '/sign-in' || path === '/sign-up') {
        return NextResponse.next()
    }

    const token = request.cookies.get('payload-token')?.value

    if (!token && path !== '/') {
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    try {
        const response = await fetch(`${appConfig.backendUrl}/api/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            return NextResponse.redirect(new URL('/sign-in', request.url))
        }

        const user = await response.json()

        if (path === '/') {
            if (user.role === 'admin') {
                return NextResponse.redirect(new URL('/admin', request.url))
            } else if (user.role === 'editorCatalogo') {
                return NextResponse.redirect(new URL('/editor-catalogo', request.url))
            } else if (user.role === 'editorAmbiente') {
                return NextResponse.redirect(new URL('/editor-ambiente', request.url))
            }
            return NextResponse.redirect(new URL('/unauthorized', request.url))
        }

        if (path.startsWith('/admin') && user.role !== 'admin') {
            return NextResponse.redirect(new URL('/unauthorized', request.url))
        }

        if (path.startsWith('/editor-catalogo')) {
            if (!['admin', 'editorCatalogo'].includes(user.role)) {
                return NextResponse.redirect(new URL('/unauthorized', request.url))
            }
            return NextResponse.next()
        }

        if (path.startsWith('/editor-ambiente')) {
            if (!['admin', 'editorAmbiente'].includes(user.role)) {
                return NextResponse.redirect(new URL('/unauthorized', request.url))
            }
            return NextResponse.next()
        }

    } catch (error) {
        console.error('Auth check failed:', error)
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}