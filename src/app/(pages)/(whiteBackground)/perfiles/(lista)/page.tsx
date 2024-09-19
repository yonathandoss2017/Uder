import {Metadata} from "next";
import React, {ReactElement} from "react";
import {getServerSession, Session} from "next-auth";
import authOptions from "@/utils/authOptions";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import LoadingPage from "@/app/(pages)/loading";
import {verificarPermiso} from "@/services/SessionService";
import PermisoEnum from "@/types/enums/PermisoEnum";
import ErrorFC from "@/components/ErrorFC";
import TablePerfilesFC from "@/app/(pages)/(whiteBackground)/perfiles/(lista)/table";

export const metadata: Metadata = {
    title: 'PInfra DD - Lista de perfiles'
};

const PerfilesPage = async (): Promise<ReactElement> => {

    const sessionData: Session | null = await getServerSession(authOptions);

    const sessionAPIToken: string | undefined = sessionData?.user?.sessionAPIToken;

    const clientData: UsuarioDTO | undefined = sessionData?.user?.data;

    if (!sessionAPIToken || !clientData) return <LoadingPage/>;

    if (!await verificarPermiso(sessionAPIToken, PermisoEnum.OBTENER_PERFILES)) {
        return <ErrorFC message={"Acceso denegado"}/>;
    }

    const hasPermissionEdit: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.MODIFICAR_PERFIL);
    const hasPermissionBaja: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.BAJA_PERFIL);
    const hasPermissionView: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.OBTENER_PERFILES);

    return (
        <main>
            <TablePerfilesFC
                sessionAPIToken={sessionAPIToken}
                hasPermissionBaja={hasPermissionBaja}
                hasPermissionEdit={hasPermissionEdit}
                hasPermissionView={hasPermissionView}
                idInstitucion={clientData.idInstitucion}
            />
        </main>
    );

}

export default PerfilesPage;
