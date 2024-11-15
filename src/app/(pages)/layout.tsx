// Importa los estilos de la aplicación
import "@public/styles/globals.css";
// Importa el favicon (icono de la aplicación)
import Favicon from "@public/favicon.ico"; // Importa el favicon (icono de la aplicación)
// Importa los módulos necesarios
import ProvidersLayout from "./ProvidersLayout";
import React, {ReactNode} from "react";
import AuthLayout from "./AuthLayout";

// Define los metadatos de la aplicación
export const metadata = {
    title: 'PFT', // Título de la aplicación
    description: 'LTI - Proyecto Final de Tecnicatura', // Descripción de la aplicación
    icons: [
        {rel: 'icon', url: Favicon.src}, // Icono de la aplicación
    ]
};

// Define el layout principal de la aplicación con los elementos comunes a todas las páginas
// children: Contenido de la página que se renderizará dentro del layout
export default function RootLayout({children}: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
        <body>
        <ProvidersLayout>
                <AuthLayout>
                    {children} {/* Renderiza el contenido de la página */}
                </AuthLayout>
        </ProvidersLayout>
        </body>
        </html>
    );
}
