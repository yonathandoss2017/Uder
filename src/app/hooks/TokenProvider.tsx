import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react'; // Usamos el hook de next-auth para obtener la sesión actual

// Definir la estructura del contexto
interface TokenContextProps {
    sessionAPIToken: string | null;
    setSessionAPIToken: (token: string | null) => void;
}

// Crear el contexto
const TokenContext = createContext<TokenContextProps | undefined>(undefined);

// Crear el proveedor del contexto
export const TokenProvider = ({ children }: { children: ReactNode }) => {
    const [sessionAPIToken, setSessionAPIToken] = useState<string | null>(null);
    const { data: session } = useSession(); // Obtenemos la sesión actual con next-auth

    console.log("TOKEN PROVIDER", sessionAPIToken)
    // Inicializar el token desde la sesión cuando el componente se monta
    useEffect(() => {
        if (session?.user?.sessionAPIToken) {
            setSessionAPIToken(session.user.sessionAPIToken); // Si hay un token en la sesión, lo establecemos
        }
        console.log("DESPUES TOKEN PROVIDER", sessionAPIToken)
    }, [session, session?.user.sessionAPIToken]); // Se ejecuta cada vez que la sesión cambie

    return (
        <TokenContext.Provider value={{ sessionAPIToken, setSessionAPIToken }}>
            {children}
        </TokenContext.Provider>
    );
};

// Hook para usar el contexto
export const useToken = () => {
    const context = useContext(TokenContext);
    if (!context) {
        throw new Error('useToken debe ser usado dentro de un TokenProvider');
    }
    return context;
};

