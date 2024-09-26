import { Metadata } from "next";
import { ReactElement } from "react";
import { getServerSession, Session } from "next-auth";
import authOptions from "@/utils/authOptions";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import LoadingPage from "@/app/(pages)/loading";
import { verificarPermiso } from "@/services/SessionService";
import PermisoEnum from "@/types/enums/PermisoEnum";
import ErrorFC from "@/components/ErrorFC";
import TableMarcaFC from "@/app/(pages)/(whiteBackground)/marcas/(lista)/table";

export const metadata: Metadata = {
    title: 'PFT - Lista de equipos',
};

const MarcaPage = async (): Promise<ReactElement> => {
    const sessionData: Session | null = await getServerSession(authOptions);
    const sessionAPIToken: string | undefined = sessionData?.user?.sessionAPIToken;
    const clientData: UsuarioDTO | undefined = sessionData?.user?.data;

    if (!sessionAPIToken || !clientData) return <LoadingPage />;

    if (!(await verificarPermiso(sessionAPIToken, PermisoEnum.OBTENER_MARCAS))) {
        return <ErrorFC message={"Acceso denegado"} />;
    }

    const hasPermissionEdit: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.MODIFICAR_MARCA);
    const hasPermissionBaja: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.BAJA_MARCA);
    const hasPermissionView: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.OBTENER_MARCAS);

    return (
        <main>
            <TableMarcaFC
                sessionAPIToken={sessionAPIToken}
                hasPermissionBaja={hasPermissionBaja}
                hasPermissionEdit={hasPermissionEdit}
                hasPermissionView={hasPermissionView}
                idInstitucion={clientData.idInstitucion}
            />
        </main>
    );
};

export default MarcaPage;
