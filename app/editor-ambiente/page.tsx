'use client'

import { useState } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { AmbienteTable } from './components/ambiente-table'
import { AmbienteDialog } from './dialogs/add-ambiente-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { config } from '@/app/config'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ConsumoAgua {
    id: string
    diaRegistro: string
    cantidad: number
    observaciones: string
    createdAt: string
    updatedAt: string
    creadoPor?: {
        name: string
        role: string
    }
}

export default function EditorAmbientePage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [consumoEditar, setConsumoEditar] = useState<ConsumoAgua | undefined>()
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [consumoEliminar, setConsumoEliminar] = useState<ConsumoAgua | undefined>()
    const [error, setError] = useState<string | null>(null)

    const handleAdd = async (consumo: Omit<ConsumoAgua, 'id' | 'createdAt' | 'updatedAt' | 'creadoPor'>) => {
        try {
            const response = await fetch(`${config.backendUrl}/api/consumo-agua`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(consumo),
            })
            
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message || 'Error al agregar el registro')
            }

            window.location.reload()
            return true
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error al agregar el registro')
            return false
        }
    }

    const handleEdit = async (consumo: ConsumoAgua) => {
        try {
            const response = await fetch(`${config.backendUrl}/api/consumo-agua/${consumo.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(consumo),
            })
            
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message || 'Error al editar el registro')
            }

            window.location.reload()
            return true
        } catch (error) {
            console.error('Error:', error)
            setError(error instanceof Error ? error.message : 'Error al editar el registro')
            return false
        }
    }

    const handleDelete = async (consumo: ConsumoAgua) => {
        try {
            const response = await fetch(`${config.backendUrl}/api/consumo-agua/${consumo.id}`, {
                method: 'DELETE',
                credentials: 'include',
            })
            
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message || 'Error al eliminar el registro')
            }

            window.location.reload()
            return true
        } catch (error) {
            console.error('Error:', error)
            setError(error instanceof Error ? error.message : 'Error al eliminar el registro')
            return false
        }
    }

    return (
        <AuthGuard allowedRoles={['admin', 'editorAmbiente']}>
            <div className="container mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Consumo de Agua</h1>
                    <Button
                        onClick={() => {
                            setError(null)
                            setConsumoEditar(undefined)
                            setIsDialogOpen(true)
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Registro
                    </Button>
                </div>

                <AmbienteTable
                    onEdit={(consumo) => {
                        setError(null)
                        setConsumoEditar(consumo)
                        setIsDialogOpen(true)
                    }}
                    onDelete={(consumo) => {
                        setError(null)
                        setConsumoEliminar(consumo)
                        setShowDeleteConfirm(true)
                    }}
                />

                <AmbienteDialog
                    isOpen={isDialogOpen}
                    onClose={() => {
                        setIsDialogOpen(false)
                        setConsumoEditar(undefined)
                        setError(null)
                    }}
                    onSubmit={async (consumo) => {
                        const success = await (consumoEditar ? handleEdit({ ...consumoEditar, ...consumo }) : handleAdd(consumo))
                        if (success) {
                            setIsDialogOpen(false)
                            setConsumoEditar(undefined)
                        }
                    }}
                    consumoInicial={consumoEditar}
                />

                {showDeleteConfirm && consumoEliminar && (
                    <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirmar Eliminación</DialogTitle>
                            </DialogHeader>
                            <p className="py-4">
                                ¿Estás seguro de que deseas eliminar el registro de consumo del {new Date(consumoEliminar.diaRegistro).toLocaleDateString()}?
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowDeleteConfirm(false)
                                        setError(null)
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(consumoEliminar)}
                                >
                                    Eliminar
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AuthGuard>
    )
}