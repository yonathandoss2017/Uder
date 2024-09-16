"use client"; // Este es un componente del lado del cliente

// Importa los módulos necesarios
import {signOut, useSession} from "next-auth/react";
import React, {ReactNode, useEffect} from "react";
import LoadingPage from "@/app/(pages)/loading";
import ErrorFC from "@/components/ErrorFC";
import {ModalButtonsType} from "@/components/ModalFC";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {renovarToken} from "@/services/SessionService";
import {useModal} from "@/app/hooks/modals/useModal";
import {useIdleTimer} from "react-idle-timer";

// Define el componente layout de autenticación
function AuthLayout({children}: Readonly<{ children: ReactNode }>) {

    const {data: session, status, update} = useSession();
    const CHECK_SESSION_EXP_TIME = 10000;
    const SESSION_IDLE_TIME = 10000;
    const BASE_URL = process.env.NEXTAUTH_URL;

    const onUserIdle = () => {
        console.log('IDLE');
    };

    const onUserActive = () => {
        console.log('ACTIVE');
    };

    const {isIdle} = useIdleTimer({
        onIdle: onUserIdle,
        onActive: onUserActive,
        timeout: SESSION_IDLE_TIME, //milliseconds
        throttle: 500
    });

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    useEffect(() => {
        const checkUserSession = setInterval(async () => {
            const expiresTimeTimestamp = Math.floor(new Date(session?.expires || '').getTime());
            const currentTimestamp = Date.now();
            const timeRemaining = expiresTimeTimestamp - currentTimestamp;

            console.log("Expiracion token", session?.expires)

            console.log("Time Remaining:", timeRemaining); // Agrega este log
            console.log("isIdle:", isIdle()); // Agrega este log

            if (!isIdle() && timeRemaining < CHECK_SESSION_EXP_TIME) {

                if (session?.user.sessionAPIToken) {
                    const response: string | FetchAPIError = await renovarToken(session?.user.sessionAPIToken);
                    if (isFetchAPIError(response)) {
                        console.error("ERROR - EquiposPage_renovarToken: ", response);
                        throw new Error(response.errorMessage);
                    }
                    await update();
                }

            } else if(isIdle() && timeRemaining < CHECK_SESSION_EXP_TIME) {
                createModal({
                    children: (
                        <p>Su sesión está por expirar, quiere renovarla?</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM_CANCEL,
                    onConfirm: async (): Promise<void> => {
                        console.log("Renovando token en page");
                        if (session?.user.sessionAPIToken) {
                            const response: string | FetchAPIError = await renovarToken(session?.user.sessionAPIToken);
                            if (isFetchAPIError(response)) {
                                console.error("ERROR - EquiposPage_renovarToken: ", response);
                                throw new Error(response.errorMessage);
                            }
                            session.user.sessionAPIToken = response;
                            session.expires = new Date(Date.now() + 30000).toISOString();
                            //await update();

                        }
                    },
                    onCancel: (): void => {
                        console.log("Cancelando renovación de token");
                        window.location.href = "/logout";
                    }
                }).show();
            }
            else if (timeRemaining < 0) {
                // session has expired, logout the user and display session expiration message
                signOut({callbackUrl: BASE_URL + '/logout', redirect: true});
            }
        }, CHECK_SESSION_EXP_TIME);

        return () => {
            clearInterval(checkUserSession);
        };
    }, [update, session, isIdle]);


// Muestra la página de carga si el estado de la sesión es "loading"
    if (status === "loading") return <LoadingPage/>

// Muestra un mensaje de error si se produce un error de sesión
    if (session?.user?.error === "expired_token") return <ErrorFC customContent={(
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