// ===============================================================================
// Página de inicio de sesión que se renderiza en la ruta "/login"
// ===============================================================================

// Importa los estilos de la página
import styles from "@public/styles/modules/auth/authPage.module.css";
// Importa los módulos necesarios
import React, {ReactElement} from "react";
import LoginForm from "./form";
import {Metadata} from "next";

// Define la metadata de la página principal
export const metadata: Metadata = {
    title: 'PFT - Login'
};

// Define la página de inicio de sesión
const LoginPage = () => {
    // Retorna el contenido de la página (JSX)
    return (
        <main className={styles.containerWrap}>
            <div className={styles.container}>
                <h2>Login</h2>
                <LoginForm/>
            </div>
        </main>
    )
}

// Exporta la página
export default LoginPage;
