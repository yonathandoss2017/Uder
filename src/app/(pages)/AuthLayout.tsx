"use client"; // Este es un componente del lado del cliente

// Importa los módulos necesarios
import {signOut, useSession} from "next-auth/react";
import {ReactNode, useEffect} from "react";
import {Session} from "next-auth";
import LoadingPage from "@/app/(pages)/loading";
import {useModal} from "@/app/hooks/modals/useModal";
import {ModalButtonsType} from "@/components/ModalFC";
import ErrorFC from "@/components/ErrorFC";

// Define el componente layout de autenticación
function AuthLayout({children}: Readonly<{ children: ReactNode }>) {

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    // Obtiene los datos de sesión y el estado de uso del hook useSession de NextAuth.js
    // estado = (loading, authenticated, unauthenticated)
    const {data: sessionData, status}: { data: Session | null, status: string } =
        useSession() as {
            data: Session | null,
            status: string
        };

    // Efecto para verificar si hay errores de sesión y cerrar la sesión si es necesario
    useEffect((): void => {
        (async (): Promise<void> => {
            // Verifica si se ha producido un error en la sesión
            if (sessionData?.user?.error === "server_invalid_token") {
                // Muestra una alerta informando al usuario sobre el cierre de sesión
                createModal({
                    children: (
                        <div>
                            <h1>Se perdió la sesión del usuario con el servidor</h1>
                            <p>Por favor inicie sesión nuevamente.</p>
                        </div>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM,
                    onClose(): void {
                        (async (): Promise<void> => {
                            await signOut({
                                callbackUrl: "/login", // URL de redirección después del cierre de sesión
                                redirect: true    // Redirige al usuario después de cerrar la sesión
                            });
                        })();
                    },
                    isSidebarOpen: false
                }).show();
            }
        })();

    }, [sessionData?.user.error]); // Se ejecuta cada vez que cambie sessionData?.user.error (Cuando se produce un error de sesión)

    // Muestra la página de carga si el estado de la sesión es "loading"
    if (status === "loading") return <LoadingPage/>

    // Muestra un mensaje de error si se produce un error de sesión
    if (sessionData?.user.error) return <ErrorFC customContent={(
        <>
            <h1>Error</h1>
            <h2>Se perdió la sesión del usuario con el servidor</h2>
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
        ;
}

// Exporta el componente
export default AuthLayout;