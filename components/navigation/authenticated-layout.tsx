'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { config } from '@/app/config'
import { AuthToolbar } from './auth-toolbar'

interface AuthenticatedLayoutProps {
    children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const pathname = usePathname()

    const publicRoutes = ['/sign-in', '/sign-up', '/unauthorized']

    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await fetch(`${config.backendUrl}/api/users/me`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (response.ok) {
                    setIsAuthenticated(true)
                }
            } catch (error) {
                console.error('Error checking authentication:', error)
                setIsAuthenticated(false)
            }
        }

        checkAuth()
    }, [])

    const shouldShowToolbar = isAuthenticated && !publicRoutes.includes(pathname)

    return (
        <>
            {shouldShowToolbar && <AuthToolbar />}
            {children}
        </>
    )
} 