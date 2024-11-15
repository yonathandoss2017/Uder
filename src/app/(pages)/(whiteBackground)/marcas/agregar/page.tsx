// Define la metadata de la página
import {Metadata} from "next";
import React, {ReactElement} from "react";
import RegisterMarcaForm from "./form";
import {getServerSession, Session} from "next-auth";
import authOptions from "@/utils/authOptions";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import LoadingPage from "@/app/(pages)/loading";
import {verificarPermiso} from "@/services/SessionService";
import PermisoEnum from "@/types/enums/PermisoEnum";
import ErrorFC from "@/components/ErrorFC";
import styles from "@public/styles/modules/register.equipo.module.css";

export const metadata: Metadata = {
    title: 'PFT - Agregar equipo'
};

const RegisterMarcaPage = async(): Promise<ReactElement> => {

    // Obtiene la información de la sesión del cliente desde el servidor front (NextAuth)
    const sessionData: Session | null = await getServerSession(authOptions);

    // Obtiene el token de sesión del cliente en la API
    const sessionAPIToken: string | undefined = sessionData?.user?.sessionAPIToken;

    // Obtiene los datos de usuario del cliente
    const clientData: UsuarioDTO | undefined = sessionData?.user?.data;

    // Si no se obtienen los datos se muestra la página de carga
    if (!sessionAPIToken || !clientData) return <LoadingPage/>;

    // Si no tiene permisos para acceder a la página, muestra un mensaje de acceso denegado
    if (!await verificarPermiso(sessionAPIToken, PermisoEnum.ALTA_MARCA)){
        return <ErrorFC message={"Acceso denegado"}/>;
    }

    // Retorna la página de registro de equipos
    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <RegisterMarcaForm clientData={clientData} sessionAPIToken={sessionAPIToken}/>
            </div>
        </main>
    );
}

// Exporta la página
export default RegisterMarcaPage;
