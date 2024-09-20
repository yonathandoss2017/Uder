import { Metadata } from "next";
import { ReactElement } from "react";
import { getServerSession, Session } from "next-auth";
import authOptions from "@/utils/authOptions";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import LoadingPage from "@/app/(pages)/loading";
import { verificarPermiso } from "@/services/SessionService";
import PermisoEnum from "@/types/enums/PermisoEnum";
import ErrorFC from "@/components/ErrorFC";
import TableIntervencionFC from "@/app/(pages)/(whiteBackground)/intervenciones/(lista)/table";

export const metadata: Metadata = {
    title: 'PInfra DD - Lista de Intervenciones',
};

const IntervencionPage = async (): Promise<ReactElement> => {
    const sessionData: Session | null = await getServerSession(authOptions);
    const sessionAPIToken: string | undefined = sessionData?.user?.sessionAPIToken;
    const clientData: UsuarioDTO | undefined = sessionData?.user?.data;

    if (!sessionAPIToken || !clientData) return <LoadingPage />;

    if (!(await verificarPermiso(sessionAPIToken, PermisoEnum.OBTENER_INTERVENCIONES))) {
        return <ErrorFC message={"Acceso denegado"} />;
    }

    const hasPermissionEdit: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.TRABAJAR_INTERVENCION);
    const hasPermissionView: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.OBTENER_INTERVENCIONES);

    return (
        <main>
            <TableIntervencionFC
                sessionAPIToken={sessionAPIToken}
                hasPermissionEdit={hasPermissionEdit}
                hasPermissionView={hasPermissionView}
            />
        </main>
    );
};

export default IntervencionPage;
