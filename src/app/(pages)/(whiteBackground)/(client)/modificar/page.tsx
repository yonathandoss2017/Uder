// ============================================================================================
// Página de modificación propia del usuario (cliente) que se renderiza en la ruta "/modificar"
// ============================================================================================

// Importa los estilos de la página
import '@public/styles/usuario/users.css';
import '@public/styles/usuario/propio.css';
// Importa los módulos necesarios
import React, {ReactElement} from "react";
import {getServerSession, Session} from 'next-auth';
import authOptions from "@/utils/authOptions";
import LoadingPage from "@/app/(pages)/loading";
import FormEditUser from "@/app/(pages)/(whiteBackground)/(client)/modificar/form";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import PermisoEnum from "@/types/enums/PermisoEnum";
import ErrorFC from "@/components/ErrorFC";
import {verificarPermiso} from "@/services/SessionService";

// Define la metadata de la página
export const metadata = {
    title: 'PFT - Modificar Cuenta'
};

// Define la página de registro de usuario
const EditProfilePage = async (): Promise<ReactElement> => {
    // Obtiene la información de la sesión del cliente (Desde la API)
    const sessionData: Session | null = await getServerSession(authOptions).then(
        (session: Session | null): Session | null => {
            return session;
        }
    );

    // Obtiene el token de sesión del cliente en la API y sus datos de usuario
    const sessionAPIToken: string | undefined = sessionData?.user?.sessionAPIToken;
    const clientData: UsuarioDTO | undefined = sessionData?.user?.data;

    // Si no se obtiene el token de sesión o el usuario, muestra la página de carga hasta obtenerlos
    if (!sessionAPIToken || !clientData?.id) return <LoadingPage />;

    // Si no se puede obtener el perfil del cliente, o no tiene permisos para acceder a la página, muestra un mensaje de acceso denegado
    if (!await verificarPermiso(sessionAPIToken, PermisoEnum.MODIFICAR_USUARIO_PROPIO)) {
        return <ErrorFC message={"Acceso denegado"}/>;
    }

    // Retorna el JSX de la página de registro de usuario
    return (
            <FormEditUser
                clientData={clientData}
                sessionAPIToken={sessionAPIToken}
            />
    );
}

// Exporta la página
export default EditProfilePage;
