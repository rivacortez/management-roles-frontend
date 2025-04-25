'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ConsumoAgua {
    _id?: string
    diaRegistro: string
    cantidad: number
    observaciones: string
    createdAt?: string
}

interface AmbienteDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (consumo: ConsumoAgua) => void
    consumoInicial?: ConsumoAgua
}

export function AmbienteDialog({ 
    isOpen, 
    onClose, 
    onSubmit, 
    consumoInicial 
}: AmbienteDialogProps) {
    const [consumo, setConsumo] = useState<ConsumoAgua>({
        diaRegistro: new Date().toISOString().split('T')[0],
        cantidad: 0,
        observaciones: ''
    })
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (consumoInicial) {
            setConsumo({
                ...consumoInicial,
                diaRegistro: new Date(consumoInicial.diaRegistro).toISOString().split('T')[0]
            })
        } else {
            setConsumo({
                diaRegistro: new Date().toISOString().split('T')[0],
                cantidad: 0,
                observaciones: ''
            })
        }
        setError(null)
    }, [consumoInicial, isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!consumo.diaRegistro) {
            setError('El día de registro es requerido')
            return
        }
        if (consumo.cantidad <= 0) {
            setError('La cantidad debe ser mayor que 0')
            return
        }
        if (!consumo.observaciones.trim()) {
            setError('Las observaciones son requeridas')
            return
        }

        onSubmit(consumo)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <h1></h1>
                    <DialogTitle>
                        {consumoInicial ? 'Editar Registro' : 'Nuevo Registro'}
                    </DialogTitle>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="diaRegistro">Día de Registro</Label>
                        <Input
                            id="diaRegistro"
                            type="date"
                            value={consumo.diaRegistro}
                            onChange={(e) => setConsumo({ ...consumo, diaRegistro: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cantidad">Cantidad (m³)</Label>
                        <Input
                            id="cantidad"
                            type="number"
                            step="0.01"
                            min="0"
                            value={consumo.cantidad}
                            onChange={(e) => setConsumo({ ...consumo, cantidad: parseFloat(e.target.value) || 0 })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observaciones">Observaciones</Label>
                        <Textarea
                            id="observaciones"
                            value={consumo.observaciones}
                            onChange={(e) => setConsumo({ ...consumo, observaciones: e.target.value })}
                            rows={3}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {consumoInicial ? 'Guardar' : 'Agregar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
} 