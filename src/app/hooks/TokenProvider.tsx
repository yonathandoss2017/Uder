import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

// Definir el tipo de los valores del contexto
interface TokenContextProps {
    sessionAPIToken: string | null;
    setSessionAPIToken: (token: string | null) => void;
}

// Crear el contexto
const TokenContext = createContext<TokenContextProps | undefined>(undefined);

// Crear el proveedor del contexto
export const TokenProvider = ({ children }: { children: ReactNode }) => {

    // Estado para almacenar el token de la sesión
    const [sessionAPIToken, setSessionAPIToken] = useState<string | null>(null);
    const { data: session } = useSession(); // Obtenemos la sesión actual con next-auth

    // Inicializar el token desde la sesión cuando el componente se monta
    useEffect(() => {
        if (session?.user?.sessionAPIToken) {
            setSessionAPIToken(session.user.sessionAPIToken); // Si hay un token en la sesión, lo establecemos
        }
    }, [session, session?.user.sessionAPIToken]); // Se ejecuta cada vez que la sesión cambie

    // Devolver el proveedor del contexto
    return (
        <TokenContext.Provider value={{ sessionAPIToken, setSessionAPIToken }}>
            {children}
        </TokenContext.Provider>
    );
};

// Hook para usar el contexto
export const useToken = () => {
    // Obtenemos el contexto
    const context = useContext(TokenContext);
    if (!context) { // Si no hay contexto, lanzamos un error
        throw new Error('useToken debe ser usado dentro de un TokenProvider');
    }
    return context; // Devolvemos el contexto
};

