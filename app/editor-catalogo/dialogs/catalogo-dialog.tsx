'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CamposCatalogo {
    _id?: string
    nombreItem: string
    precio: number
}

interface CatalogoDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (campo: CamposCatalogo) => void
    campoInicial?: CamposCatalogo
}

export function CatalogoDialog({ 
    isOpen, 
    onClose, 
    onSubmit, 
    campoInicial 
}: CatalogoDialogProps) {
    const [campo, setCampo] = useState<CamposCatalogo>({
        nombreItem: '',
        precio: 0
    })
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (campoInicial) {
            setCampo(campoInicial)
        } else {
            setCampo({
                nombreItem: '',
                precio: 0
            })
        }
        setError(null)
    }, [campoInicial, isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!campo.nombreItem.trim()) {
            setError('El nombre del item es requerido')
            return
        }
        if (campo.precio <= 0) {
            setError('El precio debe ser mayor que 0')
            return
        }

        onSubmit(campo)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {campoInicial ? 'Editar Item' : 'Nuevo Item'}
                    </DialogTitle>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombreItem">Nombre del Item</Label>
                        <Input
                            id="nombreItem"
                            value={campo.nombreItem}
                            onChange={(e) => setCampo({ ...campo, nombreItem: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="precio">Precio (S/.)</Label>
                        <Input
                            id="precio"
                            type="number"
                            step="0.01"
                            min="0"
                            value={campo.precio}
                            onChange={(e) => setCampo({ ...campo, precio: parseFloat(e.target.value) || 0 })}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {campoInicial ? 'Guardar' : 'Agregar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
} 