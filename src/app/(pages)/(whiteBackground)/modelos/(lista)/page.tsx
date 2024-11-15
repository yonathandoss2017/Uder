import { Metadata } from "next";
import { ReactElement } from "react";
import { getServerSession, Session } from "next-auth";
import authOptions from "@/utils/authOptions";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import LoadingPage from "@/app/(pages)/loading";
import { verificarPermiso } from "@/services/SessionService";
import PermisoEnum from "@/types/enums/PermisoEnum";
import ErrorFC from "@/components/ErrorFC";
import TableModeloFC from "@/app/(pages)/(whiteBackground)/modelos/(lista)/table"; // Cambiado a TableModeloFC

export const metadata: Metadata = {
    title: 'PFT - Lista de modelos',
};

const ModeloPage = async (): Promise<ReactElement> => {
    const sessionData: Session | null = await getServerSession(authOptions);
    const sessionAPIToken: string | undefined = sessionData?.user?.sessionAPIToken;
    const clientData: UsuarioDTO | undefined = sessionData?.user?.data;

    if (!sessionAPIToken || !clientData) return <LoadingPage />;

    if (!(await verificarPermiso(sessionAPIToken, PermisoEnum.OBTENER_MODELOS))) {
        return <ErrorFC message={"Acceso denegado"} />;
    }

    const hasPermissionEdit: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.MODIFICAR_MODELO);
    const hasPermissionBaja: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.BAJA_MODELO);
    const hasPermissionView: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.OBTENER_MODELOS);
    const hasPermissionReactivar: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.REACTIVAR_MARCA);

    return (
        <main>
            <TableModeloFC  // Cambiado a TableModeloFC
                sessionAPIToken={sessionAPIToken}
                hasPermissionBaja={hasPermissionBaja}
                hasPermissionEdit={hasPermissionEdit}
                hasPermissionView={hasPermissionView}
                idInstitucion={clientData.idInstitucion}
                hasPermissionReactivar={hasPermissionReactivar}
            />
        </main>
    );
};

export default ModeloPage;
