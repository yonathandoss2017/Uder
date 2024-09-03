// ===============================================================================
// Página de registro del cliente que se renderiza en la ruta "/signup"
// ===============================================================================


// Importa los estilos de la página
import styles from "@public/styles/modules/auth/authPage.module.css";

// Importa los estilos de la página
import stylesForm from "@public/styles/modules/auth/signupForm.module.css";

// Importa los módulos necesarios
import React from "react";
import RegisterFormClient from "./form";
import {Metadata} from "next";

// Define la metadata de la página principal
export const metadata: Metadata = {
    title: 'PInfra DD - Registro Usuario'
};

// Define la página principal de la aplicación
const RegisterPage = () => {
    return (
        <main className={styles.containerWrap}>
            <div className={styles.container}>
                <div className={stylesForm.register}>
                    <h2>Digital Disruption</h2>
                    <RegisterFormClient/>
                </div>
            </div>
        </main>
    );
}

// Exporta la página
export default RegisterPage;
