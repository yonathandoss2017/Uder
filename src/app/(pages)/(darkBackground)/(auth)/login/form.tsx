// =============================================================================
// Formulario de inicio de sesión
// =============================================================================

"use client"; // Este es un componente del lado del cliente

import styles from "@public/styles/modules/auth/loginForm.module.css";
// Importa los módulos necesarios
import React, {FormEvent, ReactElement} from "react";
import {signIn, SignInResponse} from "next-auth/react";
import {useRouter} from "next/navigation";
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";
import {ModalButtonsType} from "@/components/ModalFC";
import {useModal} from "@/app/hooks/modals/useModal";

// Define el componente del formulario de inicio de sesión
function LoginForm(): ReactElement {

    // Obtiene el hook de enrutamiento de Next.js
    const router: AppRouterInstance = useRouter();

    const {createModal} = useModal();

    // Procedimiento para manejar el inicio de sesión con credenciales
    const handleCredentialsSignIn = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario (Enviar)

        // Obtiene las credenciales de inicio de sesión
        const credentials: {
            username: string,
            password: string,
        } = {
            username: (e.currentTarget.elements.namedItem("username") as HTMLInputElement).value,
            password: (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value,
        };

        // Inicia sesión con las credenciales proporcionadas
        await signIn(
            'credentials',
            {
                redirect: false, // No redirige por defecto para manejar la redirección manualmente
                ...credentials // Proporciona las credenciales al método de inicio de sesión
            }
        ).then((res: SignInResponse | undefined): void => {
            if (res?.error) {
                createModal({
                    children: (<p>{res?.error}</p>
                    ), buttonsType: ModalButtonsType.CONFIRM,
                    isSidebarOpen: false
                }).show();
            } else {
                router.push("/");
            }
        });
    };

    // Procedimiento para manejar el inicio de sesión con Google
    const handleGoogleSignIn = async (e: FormEvent<HTMLButtonElement>): Promise<void> => {
        e.preventDefault(); // Previene el comportamiento por defecto del botón (enviar el formulario)
        router.push("/login/google") // Redirige al usuario a la página de autenticación con Google
    };

    // Retorna el formulario de inicio de sesión (JSX)
    return (
        <form className={styles.container} onSubmit={handleCredentialsSignIn}>
            <input type="text" name="username" id="user" placeholder="Usuario" required={true}/>
            <input type="password" name="password" id="pass" placeholder="Contraseña" required={true}/>
            <button type="submit">Ingresar</button>
            <p>No tienes una cuenta? <a href={"/signup/google"}>Regístrate</a></p>
            <p>o</p>
            <button className="google" onClick={handleGoogleSignIn}>
                Inicia Sesión con Google
            </button>
        </form>
    );
}

// Exporta el componente del formulario
export default LoginForm;