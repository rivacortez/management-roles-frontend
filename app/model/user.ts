export interface User {
    id: string
    name: string
    email: string
    role: 'admin' | 'editorCatalogo' | 'editorAmbiente'
    lastLogin?: string
    createdAt?: string
}

