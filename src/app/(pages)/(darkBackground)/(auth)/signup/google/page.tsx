// ===============================================================================
// Página de autenticación con Google que se renderiza en la ruta "/signup/google"
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
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";
import {ModalButtonsType} from "@/components/ModalFC";
import {useModal} from "@/app/hooks/modals/useModal";
import {existeCorreo} from "@/services/UsuarioService";

// Página de autenticación con Google
const GoogleAuthPageRegister = () => {
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

        // Prócedimiento auto-ejecutable para ejecutar de forma asíncrona
        (async (): Promise<void> => {

            // Si no hay una sesión activa, inicia sesión con Google
            if (!sessionData) {
                await signIn("google", {redirect: false});
            } else { // Si hay una sesión activa
                standby.current = true; // Pone en espera el estado

                // Obtiene el token de autenticación de Google
                const sessionGoogleToken: string | undefined = sessionData.user.sessionGoogleToken as string;

                // Si no se obtiene el token de Google, cierra la sesión y muestra un mensaje de error
                if (!sessionGoogleToken) {
                    createModal({
                        children: (<p>Error al autenticar con Google</p>
                        ), buttonsType: ModalButtonsType.CONFIRM, onClose: async () => {
                            await signOut({redirect: true, callbackUrl: "/login"}); // Cierra la sesión del usuario (NextAuth)
                        },
                        isSidebarOpen: false
                    }).show();
                }

                // Verificamos si existe alguien registrado con ese correo
                const response: boolean = await existeCorreo(sessionData?.user.email as string);
                if (!response) { // Si no hay un usuario con ese correo
                    router.push("/signup"); // Redirige al usuario a la página de registro
                    return;
                }

                createModal({
                    children: (<p>Este correo ya está registrado.</p>
                    ), buttonsType: ModalButtonsType.CONFIRM, onClose: async () => {
                        await signOut({redirect: true, callbackUrl: "/login"}); // Cierra la sesión del usuario (NextAuth)
                    },
                    isSidebarOpen: false
                }).show();

            }
        })();
    }, [sessionData, update, router]);

    return <LoadingPage/>;
}

export default GoogleAuthPageRegister;