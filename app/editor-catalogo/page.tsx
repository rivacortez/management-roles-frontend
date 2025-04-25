
'use client'

import { useState } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { CatalogoTable } from '@/app/editor-catalogo/component/catalogo-table'
import { config } from '@/app/config'
import { CatalogoDialog } from './dialogs/catalogo-dialog'

interface CamposCatalogo {
    _id?: string
    nombreItem: string
    precio: number
}

export default function EditorCatalogoPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [campoEditar, setCampoEditar] = useState<CamposCatalogo | undefined>()
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [campoEliminar, setCampoEliminar] = useState<CamposCatalogo | undefined>()
    const [error, setError] = useState<string | null>(null)

    const handleAdd = async (campo: CamposCatalogo) => {
        try {
            const campoData = {
                nombreItem: campo.nombreItem.trim(),
                precio: campo.precio
            }


            const response = await fetch(`${config.backendUrl}/api/catalogo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(campoData),
            })
            
            const responseData = await response.json()

            if (!response.ok) {
                throw new Error(responseData.message || responseData.errors?.[0]?.message || 'Error al agregar el item')
            }

            window.location.reload()
        } catch (error) {
            console.error('Error detallado:', error)
            setError(error instanceof Error ? error.message : 'Error al agregar el item')
            return false
        }
        return true
    }

    const handleEdit = async (campo: CamposCatalogo) => {
        try {
            if (!campo._id) {
                throw new Error('ID del item no válido')
            }

            const campoData = {
                nombreItem: campo.nombreItem.trim(),
                precio: campo.precio
            }

            const response = await fetch(`${config.backendUrl}/api/catalogo/${campo._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(campoData),
            })
            
            const responseData = await response.json()
            
            if (!response.ok) {
                throw new Error(responseData.message || 'Error al editar el item')
            }

            window.location.reload()
        } catch (error) {
            console.error('Error:', error)
            setError(error instanceof Error ? error.message : 'Error al editar el item')
            return false
        }
        return true
    }

    const handleDelete = async (campo: CamposCatalogo) => {
        try {
            if (!campo._id) {
                throw new Error('ID del item no válido')
            }

            const response = await fetch(`${config.backendUrl}/api/catalogo/${campo._id}`, {
                method: 'DELETE',
                credentials: 'include',
            })
            
            const responseData = await response.json()
            
            if (!response.ok) {
                throw new Error(responseData.message || 'Error al eliminar el item')
            }

            setShowDeleteConfirm(false)
            window.location.reload()
        } catch (error) {
            console.error('Error:', error)
            setError(error instanceof Error ? error.message : 'Error al eliminar el item')
            return false
        }
        return true
    }

    return (
        <AuthGuard allowedRoles={['editorCatalogo', 'admin']}>
            <div className="container mx-auto py-8 px-4">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        <span className="block sm:inline">{error}</span>
                        <span 
                            className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
                            onClick={() => setError(null)}
                        >
                            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <title>Cerrar</title>
                                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                            </svg>
                        </span>
                    </div>
                )}

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Editor de Catálogo</h1>
                    <button
                        onClick={() => {
                            setError(null)
                            setCampoEditar(undefined)
                            setIsDialogOpen(true)
                        }}
                        className="bg-black text-white px-4 py-2 rounded-md "
                    >
                        Agregar Item
                    </button>
                </div>

                <CatalogoTable
                    onEdit={(campo) => {
                        setError(null)
                        setCampoEditar(campo)
                        setIsDialogOpen(true)
                    }}
                    onDelete={(campo) => {
                        setError(null)
                        setCampoEliminar(campo)
                        setShowDeleteConfirm(true)
                    }}
                />

                <CatalogoDialog
                    isOpen={isDialogOpen}
                    onClose={() => {
                        setIsDialogOpen(false)
                        setCampoEditar(undefined)
                        setError(null)
                    }}
                    onSubmit={async (campo) => {
                        const success = await (campoEditar ? handleEdit(campo) : handleAdd(campo))
                        if (success) {
                            setIsDialogOpen(false)
                            setCampoEditar(undefined)
                        }
                    }}
                    campoInicial={campoEditar}
                />

                {showDeleteConfirm && campoEliminar && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
                            <p className="mb-4">
                                ¿Estás seguro de que deseas eliminar el item "{campoEliminar.nombreItem}"?
                            </p>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false)
                                        setError(null)
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleDelete(campoEliminar)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    )
}