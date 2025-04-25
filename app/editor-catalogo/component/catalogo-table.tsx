'use client'

import { useState, useEffect, useMemo } from 'react'
import { config } from '@/app/config'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, RefreshCcw, PlusCircle, Search, ChevronUp, ChevronDown, Download, LayoutGrid, LayoutList } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

interface CamposCatalogo {
    id: string
    nombreItem: string
    precio: number
}

export function CatalogoTable({ 
    onEdit, 
    onDelete 
}: {
    onEdit: (campo: CamposCatalogo) => void
    onDelete: (campo: CamposCatalogo) => void
}) {
    const [campos, setCampos] = useState<CamposCatalogo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortConfig, setSortConfig] = useState<{
        key: keyof CamposCatalogo,
        direction: 'ascending' | 'descending'
    }>({
        key: 'nombreItem',
        direction: 'ascending'
    })
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
    
    // Filtrar y ordenar los datos
    const filteredAndSortedCampos = useMemo(() => {
        const filtered = campos.filter(campo => 
            campo.nombreItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
            campo.precio.toString().includes(searchTerm)
        )
        
        return [...filtered].sort((a, b) => {
            if (sortConfig.key === 'precio') {
                return sortConfig.direction === 'ascending' 
                    ? a.precio - b.precio
                    : b.precio - a.precio
            }
            
            // Para el nombre del item
            return sortConfig.direction === 'ascending'
                ? a[sortConfig.key].toString().localeCompare(b[sortConfig.key].toString())
                : b[sortConfig.key].toString().localeCompare(a[sortConfig.key].toString())
        })
    }, [campos, searchTerm, sortConfig])
    
    // Calcular totales para mostrar en el resumen
    const catalogStats = useMemo(() => {
        const totalItems = filteredAndSortedCampos.length
        const precioPromedio = totalItems > 0 
            ? filteredAndSortedCampos.reduce((sum, item) => sum + item.precio, 0) / totalItems
            : 0
        const precioMinimo = totalItems > 0
            ? Math.min(...filteredAndSortedCampos.map(item => item.precio))
            : 0
        const precioMaximo = totalItems > 0
            ? Math.max(...filteredAndSortedCampos.map(item => item.precio))
            : 0
            
        return {
            totalItems,
            precioPromedio,
            precioMinimo,
            precioMaximo
        }
    }, [filteredAndSortedCampos])
    
    useEffect(() => {
        fetchCampos()
    }, [])
    
    const fetchCampos = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${config.backendUrl}/api/catalogo`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            })
            
            if (response.ok) {
                const data = await response.json()
                const camposData = data.docs || data || []
                setCampos(camposData)
                setError(null)
            } else {
                throw new Error(`Error en la respuesta: ${response.status}`)
            }
        } catch (error) {
            console.error('Error al cargar los campos:', error)
            setError('Error al cargar los datos del catálogo')
        } finally {
            setLoading(false)
        }
    }
    
    const handleSort = (key: keyof CamposCatalogo) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'ascending' 
                ? 'descending' 
                : 'ascending'
        })
    }
    
    const getSortIcon = (key: keyof CamposCatalogo) => {
        if (sortConfig.key !== key) return null
        return sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
    }
    
    if (loading) {
        return (
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-10 w-32" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between mb-4">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                    <div className="space-y-2">
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
                    <span>{error}</span>
                    <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => fetchCampos()}
                        className="flex items-center gap-1"
                    >
                        <RefreshCcw className="h-4 w-4" /> Reintentar
                    </Button>
                </AlertDescription>
            </Alert>
        )
    }
    
    if (!campos || campos.length === 0) {
        return (
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Catálogo</CardTitle>
                    <CardDescription>No hay items disponibles en el catálogo</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-10 bg-muted/20 rounded-md">
                        <p className="text-muted-foreground mb-4">No se encontraron items en el catálogo</p>
                        <Button 
                            variant="default" 
                            onClick={() => fetchCampos()}
                            className="flex items-center gap-1"
                        >
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }
    
    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <CardTitle>Catálogo de Productos</CardTitle>
                        <CardDescription className="mt-1">
                            {catalogStats.totalItems} {catalogStats.totalItems === 1 ? 'item' : 'items'} • 
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                       
                        
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex flex-col sm:flex-row justify-between gap-3">
                    <div className="relative w-full sm:max-w-xs">
                        <Input
                            type="text"
                            placeholder="Buscar items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-full"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2">
                       
                        
                        <DropdownMenu>
                            
                            
                        </DropdownMenu>
                    </div>
                </div>

                {filteredAndSortedCampos.length === 0 ? (
                    <div className="text-center py-8 bg-muted/30 rounded-md">
                        <p className="text-muted-foreground">No se encontraron items que coincidan con la búsqueda</p>
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
                ) : viewMode === 'table' ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead 
                                        className="cursor-pointer" 
                                        onClick={() => handleSort('nombreItem')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Nombre del Item
                                            {getSortIcon('nombreItem')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="cursor-pointer" 
                                        onClick={() => handleSort('precio')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Precio
                                            {getSortIcon('precio')}
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedCampos.map((campo) => (
                                    <TableRow key={campo.id} className="hover:bg-muted/40">
                                        <TableCell className="font-medium">
                                            {campo.nombreItem}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={campo.precio > catalogStats.precioPromedio ? "secondary" : "outline"}>
                                                S/. {campo.precio.toFixed(2)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAndSortedCampos.map((campo) => (
                            <Card key={campo.id} className="hover:bg-muted/20 transition-colors">
                                <CardContent className="p-4 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-base">{campo.nombreItem}</h3>
                                        <Badge variant={campo.precio > catalogStats.precioPromedio ? "secondary" : "outline"}>
                                            S/. {campo.precio.toFixed(2)}
                                        </Badge>
                                    </div>
                                    <div className="mt-auto pt-2 flex justify-end gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onEdit(campo)}
                                            title="Editar item"
                                        >
                                            <Pencil className="h-4 w-4 mr-1" /> Editar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => onDelete(campo)}
                                            title="Eliminar item"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="mt-4 text-xs text-muted-foreground flex justify-between items-center">
                   
                    <div>
                        Última actualización: {new Date().toLocaleString()}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}