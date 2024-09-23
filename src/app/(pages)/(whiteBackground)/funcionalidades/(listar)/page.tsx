import {Metadata} from "next";
import React, {ReactElement} from "react";
import {getServerSession, Session} from "next-auth";
import authOptions from "@/utils/authOptions";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import LoadingPage from "@/app/(pages)/loading";
import {verificarPermiso} from "@/services/SessionService";
import PermisoEnum from "@/types/enums/PermisoEnum";
import ErrorFC from "@/components/ErrorFC";
import TableFuncionalidadFC from "@/app/(pages)/(whiteBackground)/funcionalidades/(listar)/table";

export const metadata: Metadata = {
    title: 'PFT - Lista de equipos',
};

const FuncionalidadPage = async (): Promise<ReactElement> => {
    // Obtiene la información de la sesión del cliente desde el servidor front (NextAuth)
    const sessionData: Session | null = await getServerSession(authOptions);

    // Obtiene el token de sesión del cliente en la API
    const sessionAPIToken: string | undefined = sessionData?.user?.sessionAPIToken;

    // Obtiene los datos de usuario del cliente
    const clientData: UsuarioDTO | undefined = sessionData?.user?.data;

    // Si no se obtienen los datos se muestra la página de carga
    if (!sessionAPIToken || !clientData) return <LoadingPage/>;

    if (!(await verificarPermiso(sessionAPIToken, PermisoEnum.OBTENER_FUNCIONALIDADES))) {
        return <ErrorFC message={"Acceso denegado"} />;
    }

    console.log("CLIENT DATA", clientData.idInstitucion);

    const hasPermissionEdit: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.MODIFICAR_FUNCIONALIDAD);
    const hasPermissionBaja: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.BAJA_FUNCIONALIDAD);
    const hasPermissionView: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.OBTENER_FUNCIONALIDADES);

    return (
        <main>
            <TableFuncionalidadFC
                sessionAPIToken={sessionAPIToken}
                hasPermissionBaja={hasPermissionBaja}
                hasPermissionEdit={hasPermissionEdit}
                hasPermissionView={hasPermissionView}
                idInstitucion={clientData.idInstitucion}
            />
        </main>
    );
};

export default FuncionalidadPage;
