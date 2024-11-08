// Importa los módulos necesarios
import Table from "./table";
import UsuarioDTO from '@/types/dtos/UsuarioDTO';
import {getServerSession, Session} from 'next-auth';
import authOptions from "@/utils/authOptions";
import {ReactElement} from "react";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import LoadingPage from "@/app/(pages)/loading";
import PerfilDTO from "@/types/dtos/PerfilDTO";
import PermisoEnum from "@/types/enums/PermisoEnum";
import ErrorFC from "@/components/ErrorFC";
import {buscarPerfilPorId} from "@/services/PerfilService";
import {verificarPermiso} from "@/services/SessionService";
import {Metadata} from "next";
import InstitucionDTO from "@/types/dtos/InstitucionDTO";
import {buscarInstitucionPorId} from "@/services/InstitucionService";

// Define la metadata de la página
export const metadata: Metadata = {
    title: 'PInfra DD - Lista de usuarios'
};

// Define la página de lista de usuarios
const UsuariosPage = async (): Promise<ReactElement> => {
    // Obtiene la información de la sesión del cliente (Desde la API)
    const sessionData: Session | null = await getServerSession(authOptions);

    // Obtiene el token de sesión del cliente en la API y sus datos de usuario
    const sessionAPIToken: string | undefined = sessionData?.user?.sessionAPIToken;
    const clientData: UsuarioDTO | undefined = sessionData?.user?.data;

    // Si no se obtiene el token de sesión o el usuario, muestra la página de carga hasta obtenerlos
    if (!sessionAPIToken || !clientData?.id) return <LoadingPage/>

    // Si no tiene permisos para acceder a la página, muestra un mensaje de acceso denegado
    if (!await verificarPermiso(sessionAPIToken, PermisoEnum.OBTENER_USUARIOS)) {
        return <ErrorFC message={"Acceso denegado"}/>;
    }

    // Obtiene los permisos del cliente para la página (Para ver qué opciones habilitar)
    const hasPermissionEdit: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.MODIFICAR_USUARIO);
    const hasPermissionBaja: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.BAJA_USUARIO);
    const hasPermissionReactivar: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.REACTIVAR_USUARIO);
    const hasPermissionObtenerUsuarios: boolean = await verificarPermiso(sessionAPIToken, PermisoEnum.OBTENER_USUARIOS)


    // Retorna el JSX de la página de lista de usuarios
    return (
        <main>
            <Table
                sessionAPIToken={sessionAPIToken}
                clientID={clientData.id}
                client={clientData}
                hasPermissionBaja={hasPermissionBaja}
                hasPermissionEdit={hasPermissionEdit}
                hasPermissionReactivar={hasPermissionReactivar}
                hasPermissionObtenerUsuarios={hasPermissionObtenerUsuarios}

            />
        </main>
    );
}

// Exporta la página de lista de usuarios
export default UsuariosPage;
