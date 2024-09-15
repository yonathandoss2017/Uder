"use client"; // Este es un componente del lado del cliente

// Importa los módulos necesarios
import {signOut, useSession} from "next-auth/react";
import {ReactNode, useEffect} from "react";
import {Session} from "next-auth";
import LoadingPage from "@/app/(pages)/loading";
import ErrorFC from "@/components/ErrorFC";
import Cookies from 'universal-cookie';

// Define el componente layout de autenticación
function AuthLayout({children}: Readonly<{ children: ReactNode }>) {

    // Obtiene los datos de sesión y el estado de uso del hook useSession de NextAuth.js
    // estado = (loading, authenticated, unauthenticated)
    const {data: sessionData, status}: { data: Session | null, status: string } =
        useSession() as {
            data: Session | null,
            status: string
        };

    useEffect(() => {
        console.log("EN AUTH LAYOUT")
    }, [sessionData?.user.sessionAPIToken]);

    // Muestra la página de carga si el estado de la sesión es "loading"
    if (status === "loading") return <LoadingPage/>

    // Muestra un mensaje de error si se produce un error de sesión
    if (sessionData?.user?.error === "expired_token") return <ErrorFC customContent={(
        <>
            <h1>Error</h1>
            <h2>La sesión expiro por inactividad</h2>
            <h3>Por favor inicie sesión nuevamente.</h3>
            <br/>
            <button onClick={async (): Promise<void> => {
                await signOut({
                    callbackUrl: "/login", // URL de redirección después del cierre de sesión
                    redirect: true    // Redirige al usuario después de cerrar la sesión
                });
            }}>
                Volver a iniciar sesión
            </button>
        </>
    )}></ErrorFC>

    // Muestra el contenido de la página
    return (
        <>
            {children}
        </>
    )
}

// Exporta el componente
export default AuthLayout;