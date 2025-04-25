'use client'

import { useState, useEffect } from 'react'
import { config } from '@/app/config'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, RefreshCcw, DownloadCloud, Filter, PlusCircle, ChevronUp, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

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

export function AmbienteTable({ 
    onEdit, 
    onDelete 
}: {
    onEdit: (consumo: ConsumoAgua) => void
    onDelete: (consumo: ConsumoAgua) => void
}) {
    const [consumos, setConsumos] = useState<ConsumoAgua[]>([])
    const [filteredConsumos, setFilteredConsumos] = useState<ConsumoAgua[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortConfig, setSortConfig] = useState<{
        key: keyof ConsumoAgua | null,
        direction: 'ascending' | 'descending'
    }>({ key: 'diaRegistro', direction: 'descending' })
    
    useEffect(() => {
        fetchConsumos()
    }, [])
    
    useEffect(() => {
        // Filtrar consumos basado en la búsqueda
        const filtered = consumos.filter(consumo => 
            consumo.observaciones.toLowerCase().includes(searchTerm.toLowerCase()) ||
            new Date(consumo.diaRegistro).toLocaleDateString().includes(searchTerm)
        )
        
        // Aplicar ordenamiento
        const sorted = [...filtered].sort((a, b) => {
            if (!sortConfig.key) return 0
            
            if (sortConfig.key === 'diaRegistro' || sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
                const dateA = new Date(a[sortConfig.key]).getTime()
                const dateB = new Date(b[sortConfig.key]).getTime()
                
                return sortConfig.direction === 'ascending' 
                    ? dateA - dateB 
                    : dateB - dateA
            }
            
            if (sortConfig.key === 'cantidad') {
                return sortConfig.direction === 'ascending' 
                    ? a.cantidad - b.cantidad 
                    : b.cantidad - a.cantidad
            }
            
            const valueA = a[sortConfig.key]?.toString() || ''
            const valueB = b[sortConfig.key]?.toString() || ''
            
            return sortConfig.direction === 'ascending'
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA)
        })
        
        setFilteredConsumos(sorted)
    }, [consumos, searchTerm, sortConfig])
    
    const fetchConsumos = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${config.backendUrl}/api/consumo-agua`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            })
            
            if (!response.ok) {
                throw new Error(`Error en la respuesta: ${response.status}`)
            }

            const data = await response.json()

            let consumosData: any[] = []
            if (Array.isArray(data)) {
                consumosData = data
            } else if (data.docs && Array.isArray(data.docs)) {
                consumosData = data.docs
            } else if (typeof data === 'object' && data !== null) {
                consumosData = [data]
            }

            const validConsumos = consumosData
                .filter((consumo): consumo is ConsumoAgua => {
                    const isValid = consumo &&
                        typeof consumo === 'object' &&
                        'id' in consumo &&
                        'diaRegistro' in consumo &&
                        'cantidad' in consumo &&
                        'observaciones' in consumo

                    if (!isValid) {
                        console.log('Consumo inválido encontrado:', consumo)
                    }

                    return isValid
                })
                .map(consumo => ({
                    ...consumo,
                    cantidad: Number(consumo.cantidad),
                    diaRegistro: consumo.diaRegistro,
                    createdAt: consumo.createdAt,
                    updatedAt: consumo.updatedAt
                }))

            setConsumos(validConsumos)
            setError(null)
        } catch (error) {
            console.error('Error detallado al cargar los consumos:', error)
            setError(error instanceof Error ? error.message : 'Error al cargar los datos de consumo de agua')
        } finally {
            setLoading(false)
        }
    }

    const handleSort = (key: keyof ConsumoAgua) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'ascending' 
                ? 'descending' 
                : 'ascending'
        })
    }

    const getSortIcon = (key: keyof ConsumoAgua) => {
        if (sortConfig.key !== key) return null
        return sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
    }

    const totalConsumo = filteredConsumos.reduce((sum, consumo) => sum + consumo.cantidad, 0)
    
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-10 w-20" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }
    
    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription className="flex items-center justify-between">
                    <div>
                        <span className="font-semibold">Error:</span> {error}
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fetchConsumos()}
                        className="flex items-center gap-1"
                    >
                        <RefreshCcw className="h-4 w-4" /> Reintentar
                    </Button>
                </AlertDescription>
            </Alert>
        )
    }
    
    return (
        <Card className="shadow-md">
            <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <CardTitle>Registro de Consumo de Agua</CardTitle>
                        <CardDescription className="mt-1">
                            {filteredConsumos.length} {filteredConsumos.length === 1 ? 'registro' : 'registros'} • 
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      
                        
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="relative w-full max-w-xs">
                        <Input
                            type="text"
                            placeholder="Buscar registros..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-8"
                        />
                        <Filter className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Exportar a Excel</DropdownMenuItem>
                            <DropdownMenuItem>Exportar a CSV</DropdownMenuItem>
                            <DropdownMenuItem>Generar PDF</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {filteredConsumos.length === 0 ? (
                    <div className="text-center py-8 bg-muted/30 rounded-md">
                        <p className="text-muted-foreground">No se encontraron registros de consumo</p>
                        {searchTerm && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setSearchTerm("")}
                                className="mt-2"
                            >
                                Limpiar búsqueda
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('diaRegistro')}>
                                        <div className="flex items-center gap-1">
                                            Fecha de Registro
                                            {getSortIcon('diaRegistro')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('cantidad')}>
                                        <div className="flex items-center gap-1">
                                            Consumo (m³)
                                            {getSortIcon('cantidad')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer min-w-[200px]" onClick={() => handleSort('observaciones')}>
                                        <div className="flex items-center gap-1">
                                            Observaciones
                                            {getSortIcon('observaciones')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                                        <div className="flex items-center gap-1">
                                            Fecha de Creación
                                            {getSortIcon('createdAt')}
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredConsumos.map((consumo) => (
                                    <TableRow key={`consumo-${consumo.id}`} className="hover:bg-muted/40">
                                        <TableCell className="font-medium">
                                            {new Date(consumo.diaRegistro).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={consumo.cantidad > 10 ? "destructive" : "outline"}>
                                                {consumo.cantidad.toFixed(2)} m³
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{consumo.observaciones || '-'}</TableCell>
                                        <TableCell>
                                            {new Date(consumo.createdAt).toLocaleString('es-ES', {
                                                day: '2-digit',
                                                month: '2-digit', 
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <div className="mt-4 text-sm text-muted-foreground text-right">
                    Última actualización: {new Date().toLocaleString('es-ES')}
                </div>
            </CardContent>
        </Card>
    )
}