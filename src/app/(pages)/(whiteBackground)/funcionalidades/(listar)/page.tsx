import {Metadata} from "next";
import {ReactElement} from "react";
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
    const sessionData: Session | null = await getServerSession(authOptions);
    const sessionAPIToken: string | undefined = sessionData?.user?.sessionAPIToken;
    const clientData: UsuarioDTO | undefined = sessionData?.user?.data;

    if (!sessionAPIToken || !clientData) return <LoadingPage />;

    if (!(await verificarPermiso(sessionAPIToken, PermisoEnum.OBTENER_FUNCIONALIDADES))) {
        return <ErrorFC message={"Acceso denegado"} />;
    }

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
