'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function UnauthorizedPage() {
    const router = useRouter()
    const pathname = usePathname()
    const [userRole, setUserRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch('/api/user', {
                    credentials: 'include',
                })

                if (response.ok) {
                    const userData = await response.json()
                    setUserRole(userData.role)
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUserInfo()
    }, [])

    const getRoleSpecificMessage = () => {
        if (!userRole) return ''

        if (pathname?.includes('/admin')) {
            return 'Esta área es exclusiva para administradores.'
        }

        if (pathname?.includes('/editor-catalogo')) {
            return 'Esta área es exclusiva para editores de catálogo y administradores.'
        }

        if (pathname?.includes('/editor-ambiente')) {
            return 'Esta área es exclusiva para editores de ambiente y administradores.'
        }

        return 'No tienes permisos para acceder a esta área.'
    }

    const getAvailableLinks = () => {
        if (!userRole) return null

        return (
            <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Áreas disponibles con tu rol:</h3>
                <div className="grid gap-3">
                    {userRole === 'admin' && (
                        <>
                            <Button asChild>
                                <Link href="/admin">Panel de Administrador</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/editor-catalogo">Editor de Catálogo</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/editor-ambiente">Editor de Ambiente</Link>
                            </Button>
                        </>
                    )}

                    {userRole === 'editorCatalogo' && (
                        <Button asChild>
                            <Link href="/editor-catalogo">Editor de Catálogo</Link>
                        </Button>
                    )}

                    {userRole === 'editorAmbiente' && (
                        <Button asChild>
                            <Link href="/editor-ambiente">Editor de Ambiente</Link>
                        </Button>
                    )}

                    <Button asChild variant="ghost">
                        <Link href="/">Ir al Inicio</Link>
                    </Button>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                    <p className="mt-2">Cargando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <h2 className="mt-6 text-3xl font-bold">Acceso Denegado</h2>
                    <p className="mt-2 text-muted-foreground">
                        {getRoleSpecificMessage()}
                    </p>
                </div>

                <Button variant="destructive" onClick={() => router.push('/sign-in')}>
                 Volver a Iniciar Sesión
                </Button>

                {getAvailableLinks()}
            </div>
        </div>
    )
}