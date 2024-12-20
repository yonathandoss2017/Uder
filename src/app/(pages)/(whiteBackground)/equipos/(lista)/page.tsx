// Importa los módulos necesarios
import TableEquiposFC from './table';
import {getServerSession, Session} from 'next-auth';
import authOptions from "@/utils/authOptions";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import LoadingPage from "@/app/(pages)/loading";
import PermisoEnum from "@/types/enums/PermisoEnum";
import ErrorFC from "@/components/ErrorFC";
import React, {ReactElement} from "react";
import {verificarPermiso} from "@/services/SessionService";
import {Metadata} from "next";

// Define la metadata de la página
export const metadata: Metadata = {
    title: 'PFT - Lista de equipos'
};

// Define la página de lista de equipos ("/equipos")
const EquiposPage = async (): Promise<ReactElement> => {

    // Obtiene la información de la sesión del cliente desde el servidor front (NextAuth)
    const sessionData: Session | null = await getServerSession(authOptions);

    // Obtiene el token de sesión del cliente en la API
    const sessionAPIToken: string | undefined = sessionData?.user?.sessionAPIToken;

    // Obtiene los datos de usuario del cliente
    const clientData: UsuarioDTO | undefined = sessionData?.user?.data;

    // Si no se obtienen los datos se muestra la página de carga
    if (!sessionAPIToken || !clientData) return <LoadingPage/>;

    // Si no tiene permisos para acceder a la página, muestra un mensaje de acceso denegado
    if (!await verificarPermiso(sessionAPIToken, PermisoEnum.OBTENER_EQUIPOS)) {
        return <ErrorFC message={"Acceso denegado"}/>;
    }

    // Obtiene los permisos del cliente para la página (Para ver qué opciones habilitar)
    const hasPermissionEdit: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.MODIFICACION_EQUIPO);
    const hasPermissionBaja: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.BAJA_EQUIPO);
    const hasPermissionView: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.OBTENER_EQUIPOS);

    // Retorna el JSX de la página de lista de usuarios
    return (
        <main>
            <TableEquiposFC
                sessionAPIToken={sessionAPIToken}
                hasPermissionBaja={hasPermissionBaja}
                hasPermissionEdit={hasPermissionEdit}
                hasPermissionView={hasPermissionView}
                idInstitucion={clientData.idInstitucion}
            />
        </main>
    );
}

// Exporta la página de lista de equipos
export default EquiposPage;
