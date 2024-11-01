// ==================================================================
// Página de cierre de sesión que se renderiza en la ruta "/logout"
// ==================================================================

"use client"; // Este es un componente del lado del cliente

// Importa los estilos de la página
import styles from "@public/styles/modules/message.module.css";

// Importa los módulos necesarios
import {signOut, useSession} from 'next-auth/react';
import {useEffect} from 'react';
import {Session} from "next-auth";

// Define el componente de cierre de sesión
const SignOut = () => {
    // Obtiene la sesión del usuario (NextAuth)
    const {data: sessionData}: { data: Session | null } = useSession();

    if(sessionData) sessionData.user.sessionAPIToken = undefined;

    if (document.cookie.includes('sessionToken')) {
        document.cookie = `sessionToken=;max-age=0;path=/;samesite=strict;`;
    }

    // Define el efecto secundario del componente (Cerrar sesión)
    useEffect((): void => {
        (async (): Promise<void> => {
            // Sí no hay una sesión activa no hace nada
            if (!sessionData) return;

            // Cierra la sesión del usuario
            await signOut({
                redirect: true,
                callbackUrl: '/login'
            });
        })();
    }, [sessionData]);

    // Renderiza el componente de cierre de sesión
    return (
        <main className={styles.container}>
            <h1>Cerrando sesión...</h1>
            <p>¡Hasta pronto!</p>
        </main>
    );
}

// Exporta el módulo del componente de cierre de sesión
export default SignOut;