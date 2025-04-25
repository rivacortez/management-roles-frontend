'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  NavigationMenu, 
  NavigationMenuItem, 
  NavigationMenuList
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { config } from '@/app/config'

export function AuthToolbar() {
    const pathname = usePathname()
    const router = useRouter()

    const routes = [
        { path: '/admin', label: 'Admin' },
        { path: '/editor-catalogo', label: 'Editor Catálogo' },
        { path: '/editor-ambiente', label: 'Editor Ambiente' }
    ]

    const handleLogout = async () => {
        try {
            const response = await fetch(`${config.backendUrl}/api/users/logout`, {
                method: 'POST',
                credentials: 'include',
            })

            if (response.ok) {
                router.push('/sign-in')
            } else {
                console.error('Error al cerrar sesión')
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error)
        }
    }

    return (
        <div className="w-full bg-primary">
            <div className="container py-2 flex justify-between items-center">
                <NavigationMenu>
                    <NavigationMenuList>
                        {routes.map((route) => (
                            <NavigationMenuItem key={route.path}>
                                <Link 
                                    href={route.path}
                                    className={cn(
                                        "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                        "focus:outline-none focus:bg-primary-foreground/10",
                                        "bg-transparent hover:bg-primary-foreground/10",
                                        pathname === route.path 
                                            ? "text-accent font-medium" 
                                            : "text-primary-foreground"
                                    )}
                                >
                                    {route.label}
                                </Link>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
                
                <Button 
                    variant="ghost" 
                    className="text-primary-foreground "
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    )
}