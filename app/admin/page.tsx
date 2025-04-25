'use client'

import { AuthGuard } from '@/components/auth/auth-guard'

export default function AdminPage() {
    return (
        <AuthGuard allowedRoles={['admin']}>
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
                <div className="bg-card p-6 rounded-lg shadow">
                    <p className="text-lg">Bienvenido al panel de administración.</p>
                </div>
            </div>
        </AuthGuard>
    )
}