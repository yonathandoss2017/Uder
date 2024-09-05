import {Metadata} from "next";
import {ReactElement} from "react";
import {getServerSession, Session} from "next-auth";
import authOptions from "@/utils/authOptions";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import LoadingPage from "@/app/(pages)/loading";
import {verificarPermiso} from "@/services/SessionService";
import PermisoEnum from "@/types/enums/PermisoEnum";
import ErrorFC from "@/components/ErrorFC";

export const metadata: Metadata = {
    title: 'PInfra DD - Lista de equipos'
};

const MarcaPage = async(): Promise<ReactElement> => {

    // Obtiene la información de la sesión del cliente desde el servidor front (NextAuth)
    const sessionData: Session | null = await getServerSession(authOptions);

    // Obtiene el token de sesión del cliente en la API
    const sessionAPIToken: string | undefined = sessionData?.user?.sessionAPIToken;

    // Obtiene los datos de usuario del cliente
    const clientData: UsuarioDTO | undefined = sessionData?.user?.data;

    // Si no se obtienen los datos se muestra la página de carga
    if (!sessionAPIToken || !clientData) return <LoadingPage/>;

    // Si no tiene permisos para acceder a la página, muestra un mensaje de acceso denegado
    if (!await verificarPermiso(sessionAPIToken, PermisoEnum.OBTENER_MARCAS)) {
        return <ErrorFC message={"Acceso denegado"}/>;

        // Obtiene los permisos del cliente para la página (Para ver qué opciones habilitar)
        const hasPermissionEdit: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.MODIFICAR_MARCA);
        const hasPermissionBaja: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.BAJA_MARCA);
        const hasPermissionView: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.OBTENER_MARCAS);

        // Retorna el JSX de la página de lista de usuarios
        return (
            <main>

                <TableTiposEquiposFC
                    sessionAPIToken={sessionAPIToken}
                    hasPermissionBaja={hasPermissionBaja}
                    hasPermissionEdit={hasPermissionEdit}
                    hasPermissionView={hasPermissionView}
                    idInstitucion={clientData.idInstitucion}
                />
            </main>
        );

    }