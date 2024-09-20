// ===============================================================================
// Página de autenticación con Google que se renderiza en la ruta "/login/google"
// para registrar un nuevo usuario en la aplicación
// ===============================================================================

// Importa los estilos de la página
"use client";

// Importa los módulos necesarios
import React, {MutableRefObject, useEffect, useRef} from 'react';
import {Session} from "next-auth";
import {signIn, signOut, useSession} from "next-auth/react";
import LoadingPage from "@/app/(pages)/loading";
import {useRouter} from "next/navigation";
import {loginGoogle} from "@/services/SessionService";
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {ModalButtonsType} from "@/components/ModalFC";
import {useModal} from "@/app/hooks/modals/useModal";
import {existeCorreo} from "@/services/UsuarioService";

// Página de autenticación con Google
const GoogleAuthPage = () => {
    const router: AppRouterInstance = useRouter(); // Inicializa el hook de enrutamiento de Next.js

    const {createModal} = useModal();

    // Obtiene la sesión del usuario (NextAuth) y su estado (loading, authenticated, unauthenticated)
    let {data: sessionData, update}: {
        data: Session | null,
        update: (data: Session) => void
    } = useSession();

    // Inicializa una referencia mutable para el estado de espera (Controla el flujo de ejecución del useEffect)
    const standby: MutableRefObject<boolean> = useRef(false);

    // Efecto secundario que se ejecuta montar el componente y cuando cambia la sesión del usuario,
    // los parámetros de búsqueda o la función de actualización
    useEffect((): void => {
        if (standby.current) return; // Si está en espera, no hace nada

        // Procedimiento auto-ejecutable para ejecutar de forma asíncrona
        (async (): Promise<void> => {

            // Si no hay una sesión activa, inicia sesión con Google
            if (!sessionData) {
                await signIn("google", {redirect: false});
            } else { // Si hay una sesión activa
                standby.current = true; // Pone en espera el estado

                // Sí tiene un token de sesión en la API, no hace nada, ya que ya está autenticado y será redirigido a la página principal
                // Esto evita que se vuelva a ejecutar el componente por el update de la sesión
                if (sessionData.user.sessionAPIToken) return;

                // Obtiene el token de autenticación de Google
                const sessionGoogleToken: string | undefined = sessionData.user.sessionGoogleToken as string;

                // Si no se obtiene el token de Google, cierra la sesión y muestra un mensaje de error
                if (!sessionGoogleToken) {

                    createModal({
                        children: (<p>Error con la autenticación de Google</p>
                        ), buttonsType: ModalButtonsType.CONFIRM, onClose: async () => {
                            await signOut({redirect: true, callbackUrl: "/login"}); // Cierra la sesión del usuario (NextAuth)
                        },
                        isSidebarOpen: false
                    }).show();
                }

                if (!await existeCorreo(sessionData?.user.email as string)) {
                    createModal({
                        children: (
                            <p>Este correo no está registrado en el sistema</p>
                        ), buttonsType: ModalButtonsType.CONFIRM_CANCEL, onClose: async () => {
                            await signOut({redirect: true, callbackUrl: "/login"});
                        },
                        isSidebarOpen: false
                    }).show();
                } else {
                    // Enviamos el token de Google a la API para autenticar al usuario y obtener un token de sesión (JWT)
                    const response: string | FetchAPIError = await loginGoogle(sessionGoogleToken);

                    if (isFetchAPIError(response)) {// Sí hay un error en la autenticación

                        createModal({
                            children: (<p>Usuario no verificado. Vuelva a intentarlo</p>
                            ), buttonsType: ModalButtonsType.CONFIRM, onClose: async () => {
                                await signOut({redirect: true, callbackUrl: "/login"}); // Cierra la sesión del usuario (NextAuth)
                            },
                            isSidebarOpen: false

                        }).show();
                    } else {
                        document.cookie = `sessionToken=${response};path=/;max-age=30;samesite=lax;secure`;
                        if (document.cookie.includes('sessionToken')) {
                            sessionData.user.sessionAPIToken = response; // Asigna el token de sesión al usuario

                            update(sessionData); // Actualiza la sesión del usuario (NextAuth)

                            window.location.href = "/"; // Redirige al usuario a la página principal
                        }
                    }
                }

            }
        })();
    }, [sessionData, update, router]);

    return <LoadingPage/>;
}

export default GoogleAuthPage;