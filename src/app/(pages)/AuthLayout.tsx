"use client"; // Este es un componente del lado del cliente

// Importa los módulos necesarios
import {signOut, useSession} from "next-auth/react";
import React, {ReactElement, ReactNode, useEffect} from "react";
import LoadingPage from "@/app/(pages)/loading";
import ErrorFC from "@/components/ErrorFC";
import {ModalButtonsType} from "@/components/ModalFC";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {renovarToken} from "@/services/SessionService";
import {useModal} from "@/app/hooks/modals/useModal";
import {useIdleTimer} from "react-idle-timer";
import {usePathname} from "next/navigation";

// Define el componente layout de autenticación
function AuthLayout({children}: Readonly<{ children: ReactNode }>) {

    const {data: session, status, update} = useSession();
    const CHECK_SESSION_EXP_TIME = 15000;
    const SESSION_IDLE_TIME = 10000;
    const [hayToken, setHayToken] = React.useState<boolean>(false);

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

    const [showSessionExpiredError, setShowSessionExpiredError] = React.useState<boolean>(false);
    const [sessionModalActive, setSessionModalActive] = React.useState<boolean>(false);

    const renderSessionExpiredError = (): ReactElement => {
        return (<ErrorFC customContent={(
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
        );
    };

    const sessionModal = createModal({
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
                document.cookie = `sessionToken=${response};path=/;max-age=30;samesite=lax;secure`;
                session.user.sessionAPIToken = response;
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

        if (pathname === "/login" || pathname === "/login/google" || pathname === "/signup" || pathname === "/signup/google") {
            return;

        }
        console.log("HAY TOKEN BOOLEAN", document.cookie.includes('sessionToken'));
        const expiresTimeTimestamp = Date.now() + 30000;
        const checkUserSession = setInterval(async () => {
            const currentTimestamp = Date.now();
            const timeRemaining = expiresTimeTimestamp - currentTimestamp;
            console.log("Time Remaining:", timeRemaining); // Agrega este log
            console.log("isIdle:", isIdle()); // Agrega este log
            console.log("HAY TOKEN BOOLEAN2", document.cookie.includes('sessionToken'));
            if (document.cookie.includes('sessionToken')) {
                setHayToken(true)
                console.log("DENTRO DEL PRIMER IF")
                if (!isIdle() && timeRemaining < CHECK_SESSION_EXP_TIME) {
                    console.log("entre a no idle")
                    if (session?.user.sessionAPIToken) {
                        console.log("no idle con token renovando")
                        const response: string | FetchAPIError = await renovarToken(session?.user.sessionAPIToken);
                        if (isFetchAPIError(response)) {
                            console.error("ERROR - EquiposPage_renovarToken: ", response);
                            throw new Error(response.errorMessage);
                        }
                        document.cookie = `sessionToken=${response};path=/;max-age=30;samesite=lax;secure`;
                        session.user.sessionAPIToken = response;
                    }
                } else if (isIdle() && timeRemaining < CHECK_SESSION_EXP_TIME) {
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
            if (!document.cookie.includes('sessionToken') && pathname !== "/login" && pathname !== "/login/google" && pathname !== "/signup" && pathname !== "/signup/google") {
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
    if (showSessionExpiredError) {
        return renderSessionExpiredError(); // Renderiza el error si la sesión ha expirado
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