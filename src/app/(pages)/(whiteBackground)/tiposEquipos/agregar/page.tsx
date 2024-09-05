
// Importa los estilos de la página
import styles from "@public/styles/modules/register.equipo.module.css";
import {Metadata} from "next";
import {getServerSession, Session} from "next-auth";
import authOptions from "@/utils/authOptions";
import React, {ReactElement} from "react";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import LoadingPage from "@/app/(pages)/loading";
import {verificarPermiso} from "@/services/SessionService";
import PermisoEnum from "@/types/enums/PermisoEnum";
import ErrorFC from "@/components/ErrorFC";
import RegisterTipoEquipoForm from "@/app/(pages)/(whiteBackground)/tiposEquipos/agregar/form";

// Define la metadata de la página
export const metadata: Metadata = {
    title: 'PInfra DD - Agregar tipo de equipo'
};

// Define la página de registro de tipos de equipos
const RegisterTipoEquipoPage = async (): Promise<ReactElement> => {

    // Obtiene la información de la sesión del cliente desde el servidor front (NextAuth)
    const sessionData: Session | null = await getServerSession(authOptions);

    // Obtiene el token de sesión del cliente en la API
    const sessionAPIToken: string | undefined = sessionData?.user?.sessionAPIToken;

    // Obtiene los datos de usuario del cliente
    const clientData: UsuarioDTO | undefined = sessionData?.user?.data;

    // Si no se obtienen los datos se muestra la página de carga
    if (!sessionAPIToken || !clientData) return <LoadingPage/>;

    // Si no tiene permisos para acceder a la página, muestra un mensaje de acceso denegado
    if (!await verificarPermiso(sessionAPIToken, PermisoEnum.ALTA_TIPO_EQUIPO)) {
        return <ErrorFC message={"Acceso denegado"}/>;
    }

    // Retorna la página de registro de equipos
    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <RegisterTipoEquipoForm clientData={clientData} sessionAPIToken={sessionAPIToken}/>
            </div>
        </main>
    );
}


// Exporta la página
export default RegisterTipoEquipoPage;
