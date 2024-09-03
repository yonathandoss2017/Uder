"use client"; // Este es un componente del lado del cliente

import {SessionProvider} from "next-auth/react"; // Importa el proveedor de sesión de NextAuth.js
import {ReactNode} from "react";
import {ModalProvider} from "@/app/hooks/modals/ModalProvider";

/**
 * Define el componente ProvidersLayout
 * Envuelve las páginas de la aplicación para proveer contextos de sesión (NextAuth)
 * y modales al resto de la aplicación.
 * @param children - Contenido del layout
 */
function ProvidersLayout({children}: Readonly<{ children: ReactNode }>) {
    return (
        // Envuelve los children en el SessionProvider para proporcionar el contexto de sesión a toda la aplicación
        <SessionProvider>
            <ModalProvider>
                {children}
            </ModalProvider>
        </SessionProvider>
    );
}

// Exporta el componente ProvidersLayout
export default ProvidersLayout;