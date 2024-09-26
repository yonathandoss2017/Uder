
// Importa los estilos de la página
import styles from "@public/styles/modules/register.equipo.module.css";
import {Metadata} from "next";
import {getServerSession, Session} from "next-auth";
import authOptions from '@/utils/authOptions';
import React, {ReactElement} from "react";
import LoadingPage from "@/app/(pages)/loading";
import {verificarPermiso} from "@/services/SessionService";
import PermisoEnum from "@/types/enums/PermisoEnum";
import ErrorFC from "@/components/ErrorFC";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import RegisterFuncionalidadForm from "@/app/(pages)/(whiteBackground)/funcionalidades/agregar/form";

export const metadata: Metadata = {
    title: 'PFT - Agregar tipo de equipo'
};

const RegisterFuncionalidadPage = async (): Promise<ReactElement> => {

    // Obtiene la información de la sesión del cliente desde el servidor front (NextAuth)
    const sessionData: Session | null = await getServerSession(authOptions);

    // Obtiene el token de sesión del cliente en la API
    const sessionAPIToken: string | undefined = sessionData?.user?.sessionAPIToken;

    // Obtiene los datos de usuario del cliente
    const clientData: UsuarioDTO | undefined = sessionData?.user?.data;

    // Si no se obtienen los datos se muestra la página de carga
    if (!sessionAPIToken || !clientData) return <LoadingPage/>;

    // Si no tiene permisos para acceder a la página, muestra un mensaje de acceso denegado
    if (!await verificarPermiso(sessionAPIToken, PermisoEnum.ALTA_FUNCIONALIDAD)) {
        return <ErrorFC message={"Acceso denegado"}/>;
    }

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <RegisterFuncionalidadForm clientData={clientData} sessionAPIToken={sessionAPIToken}/>
            </div>
        </main>
    );
}

export default RegisterFuncionalidadPage;