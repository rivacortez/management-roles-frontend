'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { config } from '@/app/config'

interface User {
    id: string
    email: string
    role: string
    name: string
}

interface AuthGuardProps {
    children: React.ReactNode
    allowedRoles: string[]
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await fetch(`${config.backendUrl}/api/users/me`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (!response.ok) {
                    throw new Error('Not authenticated')
                }

                const data = await response.json()

                const userRole = data.user?.role

                if (!userRole || !allowedRoles.includes(userRole)) {
                    console.log('Usuario no autorizado. Rol:', userRole, 'Roles permitidos:', allowedRoles)
                    router.push('/unauthorized')
                    return
                }

                setUser(data.user)
            } catch (error) {
                console.error('Auth check failed:', error)
                router.push('/sign-in')
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [allowedRoles, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]" />
                    <p className="mt-2">Cargando...</p>
                </div>
            </div>
        )
    }

    return user ? <>{children}</> : null
}