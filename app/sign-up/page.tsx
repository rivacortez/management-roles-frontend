'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { config } from '../config'
import { 
    UserIcon, 
    MailIcon, 
    LockIcon, 
    EyeIcon, 
    EyeOffIcon, 
    UserPlusIcon, 
    Loader2, 
    ShieldIcon 
} from 'lucide-react'

export default function SignUpPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [role, setRole] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(0)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (!role) {
            setError('Por favor, selecciona un rol')
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            setLoading(false)
            return
        }

        try {
            const response = await fetch(`${config.backendUrl}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role,
                }),
                credentials: 'include',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message || 'Error al registrar usuario')
            }

            router.push(`/sign-in?success=true&email=${encodeURIComponent(email)}`)
        } catch (err) {
            console.error('Registration error:', err)
            setError(err instanceof Error ? err.message : 'Ocurrió un error durante el registro')
        } finally {
            setLoading(false)
        }
    }

    const toggleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    const checkPasswordStrength = (pass: string) => {
        setPassword(pass)
        
        // Evaluación simple de la fortaleza de la contraseña
        let strength = 0
        if (pass.length >= 8) strength += 1
        if (/[A-Z]/.test(pass)) strength += 1
        if (/[0-9]/.test(pass)) strength += 1
        if (/[^A-Za-z0-9]/.test(pass)) strength += 1
        
        setPasswordStrength(strength)
    }

    const getPasswordStrengthText = () => {
        if (password.length === 0) return ""
        if (passwordStrength === 0) return "Muy débil"
        if (passwordStrength === 1) return "Débil"
        if (passwordStrength === 2) return "Media"
        if (passwordStrength === 3) return "Fuerte"
        return "Muy fuerte"
    }

    const getPasswordStrengthColor = () => {
        if (password.length === 0) return "bg-gray-200"
        if (passwordStrength === 0) return "bg-red-500"
        if (passwordStrength === 1) return "bg-orange-500"
        if (passwordStrength === 2) return "bg-yellow-500"
        if (passwordStrength === 3) return "bg-green-500"
        return "bg-green-600"
    }

    return (
        <div className="flex min-h-screen bg-gray-50 flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto w-auto flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                        <UserPlusIcon className="h-6 w-6 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Crear una cuenta</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Complete el formulario para registrarse en la plataforma
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nombre completo
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="nombree"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Correo electrónico
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MailIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    placeholder="nombre@ejemplo.com"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Contraseña
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    placeholder="Mínimo 8 caracteres"
                                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                    value={password}
                                    onChange={(e) => checkPasswordStrength(e.target.value)}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={toggleShowPassword}
                                        className="focus:outline-none focus:text-gray-600 text-gray-400 hover:text-gray-500"
                                    >
                                        {showPassword ? (
                                            <EyeOffIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            {password && (
                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div 
                                            className={`h-2.5 rounded-full ${getPasswordStrengthColor()}`}
                                            style={{ width: `${passwordStrength * 25}%` }}
                                        ></div>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-600">
                                        Seguridad: {getPasswordStrengthText()}
                                    </p>
                                </div>
                            )}
                            {password && (
                                <ul className="mt-1 text-xs text-gray-600 space-y-1 pl-4">
                                    <li className={password.length >= 8 ? "text-green-600" : "text-gray-500"}>
                                        • Mínimo 8 caracteres
                                    </li>
                                    <li className={/[A-Z]/.test(password) ? "text-green-600" : "text-gray-500"}>
                                        • Al menos una letra mayúscula
                                    </li>
                                    <li className={/[0-9]/.test(password) ? "text-green-600" : "text-gray-500"}>
                                        • Al menos un número
                                    </li>
                                    <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-600" : "text-gray-500"}>
                                        • Al menos un carácter especial
                                    </li>
                                </ul>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirmar contraseña
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Repita su contraseña"
                                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                                        confirmPassword && password !== confirmPassword
                                            ? "border-red-300 focus:border-red-300 focus:ring-red-500"
                                            : "border-gray-300 focus:border-primary"
                                    }`}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="mt-1 text-xs text-red-600">
                                    Las contraseñas no coinciden
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                Rol
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <ShieldIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <select
                                    id="role"
                                    name="role"
                                    required
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="">Selecciona un rol</option>
                                    <option value="editorCatalogo">Editor Catálogo</option>
                                    <option value="editorAmbiente">Editor Ambiente</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                      

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Creando cuenta...
                                    </>
                                ) : (
                                    'Registrarse'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="text-center text-sm text-gray-600">
                            ¿Ya tienes una cuenta?{' '}
                            <Link href="/sign-in" className="font-medium text-primary hover:text-primary/80">
                                Iniciar sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}