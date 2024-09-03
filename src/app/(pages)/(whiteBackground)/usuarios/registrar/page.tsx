// ===============================================================================
// Página de registro de usuario que se renderiza en la ruta "/usuarios/registrar"
// ===============================================================================

// Importa los estilos de la página
import styles from "@public/styles/modules/register.user.module.css";
// Importa los módulos necesarios
import React, {ReactElement} from "react";
import RegisterUserForm from "./form";
import {getServerSession, Session} from "next-auth";
import authOptions from "@/utils/authOptions";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import {Metadata} from "next";
import LoadingPage from "@/app/(pages)/loading";


// Define la metadata de la página
export const metadata: Metadata = {
    title: 'PInfra DD - Registrar usuario'
};

// Define la página de registro de usuario
const RegisterUserPage = async (): Promise<ReactElement> => {

    // Obtiene la información de la sesión del cliente desde el servidor front (NextAuth)
    const sessionData: Session | null = await getServerSession(authOptions);

    // Obtiene el token de sesión del cliente en la API
    const sessionAPIToken: string | undefined = sessionData?.user?.sessionAPIToken;

    // Obtiene los datos de usuario del cliente
    const clientData: UsuarioDTO | undefined = sessionData?.user?.data;

    // Si no se obtienen los datos se muestra la página de carga
    if (!sessionAPIToken || !clientData) return <LoadingPage/>;

    // Retorna la página de registro de usuario
    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <div className={styles.title}>Nuevo usuario</div>
                <RegisterUserForm sessionAPIToken={sessionAPIToken} clientData={clientData}/>
            </div>
        </main>
    );
}

// Exporta la página
export default RegisterUserPage;
