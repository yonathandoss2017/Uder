"use client"; // Este es un componente del lado del cliente

// Importa los módulos necesarios
import {signOut, useSession} from "next-auth/react";
import React, {ReactElement, ReactNode, useEffect, useRef, useState} from "react";
import LoadingPage from "@/app/(pages)/loading";
import ErrorFC from "@/components/ErrorFC";
import {ModalButtonsType} from "@/components/ModalFC";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {renovarToken} from "@/services/SessionService";
import {useModal} from "@/app/hooks/modals/useModal";
import {useIdleTimer} from "react-idle-timer";
import {usePathname} from "next/navigation";
import {TokenProvider, useToken} from "@/app/hooks/TokenProvider";

// Define el componente layout de autenticación
function AuthLayout({children}: Readonly<{ children: ReactNode }>) {

    const { sessionAPIToken, setSessionAPIToken } = useToken();

    const {data: session, status, update} = useSession();
    const CHECK_SESSION_EXP_TIME = 15000;
    const RENEW_TOKEN = 60000;
    const SESSION_IDLE_TIME = 30000;
    const [hayToken, setHayToken] = useState<boolean>(false);
    const expiresTimeTimestampRef = useRef<number>(Date.now() + 300000);

    const pathname = usePathname();


    const onUserIdle = () => {
        console.log('IDLE');
    };

    const onUserActive = () => {
        console.log('ACTIVE');
    };

    const {isIdle} = useIdleTimer({
        onIdle: onUserIdle,
        onActive: onUserActive,
        timeout: SESSION_IDLE_TIME,
        throttle: 500
    });

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    const [showSessionExpiredError, setShowSessionExpiredError] = useState<boolean>(false);
    const [sessionModalActive, setSessionModalActive] = useState<boolean>(false);

    const sessionModal = createModal({
        children: (
            <p>Su sesión está por expirar, quiere renovarla?</p>
        ),
        buttonsType: ModalButtonsType.CONFIRM_CANCEL,
        onConfirm: async (): Promise<void> => {
            expiresTimeTimestampRef.current = Date.now() + 300000;
            console.log("Renovando token en page");
            if (session?.user.sessionAPIToken) {
                const response: string | FetchAPIError = await renovarToken(session?.user.sessionAPIToken);
                if (isFetchAPIError(response)) {
                    console.error("ERROR - EquiposPage_renovarToken: ", response);
                    throw new Error(response.errorMessage);
                }
                document.cookie = `sessionToken=${response};path=/;max-age=300;samesite=strict`;
                session.user.sessionAPIToken = response;
                setSessionAPIToken(response);
                setSessionModalActive(false);
            }
        },
        onCancel: (): void => {
            setSessionModalActive(false);
            document.cookie = `sessionToken=;max-age=0;path=/;samesite=lax;secure`;
            signOut({redirect: true, callbackUrl: "/login"})
        }
    });


    useEffect(() => {

        if (pathname === "/login" || pathname === "/login/google" || pathname === "/signup/google" || pathname === "/signup/ad") {
            return;
        }
        console.log("HAY TOKEN BOOLEAN", document.cookie.includes('sessionToken'));
        const checkUserSession = setInterval(async () => {
            const currentTimestamp = Date.now();
            const timeRemaining = expiresTimeTimestampRef.current - currentTimestamp;
            console.log("Time Remaining:", timeRemaining); // Agrega este log
            console.log("isIdle:", isIdle()); // Agrega este log
            console.log("HAY TOKEN BOOLEAN2", document.cookie.includes('sessionToken'));
            if (document.cookie.includes('sessionToken')) {
                setHayToken(true)
                console.log("DENTRO DEL PRIMER IF")
                if (!isIdle() && timeRemaining < RENEW_TOKEN) {
                    console.log("entre a no idle")
                    if (session?.user?.sessionAPIToken && !session.user.error) {
                        console.log("no idle con token renovando")
                        expiresTimeTimestampRef.current = Date.now() + 300000;
                        const response: string | FetchAPIError = await renovarToken(session?.user.sessionAPIToken);
                        if (isFetchAPIError(response)) {
                            console.error("ERROR - EquiposPage_renovarToken: ", response);
                            sessionModal.close();
                            return;
                        }
                        document.cookie = `sessionToken=${response};path=/;max-age=300;samesite=strict`;
                        session.user.sessionAPIToken = response;
                        setSessionAPIToken(response);
                    }
                } else if (isIdle() && timeRemaining < RENEW_TOKEN) {
                    if (!sessionModalActive) {
                        console.log("entre a idle y modal no está activo");
                        setSessionModalActive(true);
                        console.log("modal ", sessionModalActive)
                        console.log("entre a idle")
                        sessionModal.show();
                    }
                }

            }

        }, CHECK_SESSION_EXP_TIME);

        return () => {
            clearInterval(checkUserSession);
        };
    }, [update, session, isIdle, sessionModalActive, pathname, hayToken]);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            console.log("ESTOY DENTRO DEL SEGUNDO USE EFEFECT")
            if (!document.cookie.includes('sessionToken') && pathname !== "/login" && pathname !== "/login/google" && pathname != "/signup/google" && pathname != "/signup/ad") {
                console.log("EN EL PRIMER IF DEL SEGUNDO USE EFFECT")
                console.log("pase el if IF")
                sessionModal.close();
                console.log("DESPUES DE CLOSE")
                setSessionModalActive(false);
                setShowSessionExpiredError(true);
            }
        }, 5000);

        return () => clearInterval(intervalId); // Limpia el intervalo cuando el componente se desmonte
    }, [pathname, sessionModalActive]); // Dependencias del useEffect


// Muestra la página de carga si el estado de la sesión es "loading"
    if (status === "loading") return <LoadingPage/>

// Muestra un mensaje de error si se produce un error de sesión
    // Muestra un mensaje de error si se produce un error de sesión
    if (showSessionExpiredError || session?.user?.error) {
        if(pathname != "/login" && pathname != "/login/google" && pathname != "/signup/google" && pathname != "/signup/ad") {
            signOut({redirect: true, callbackUrl: "/login"})
        }
    }

// Muestra el contenido de la página
    return (
        <>
            {children}
        </>
    )
}

// Exporta el componente
export default AuthLayout;