// Importaciones necesarias
import styles from "@public/styles/modules/register.tiposequipo.module.css"; // Asegúrate de que la ruta sea correcta
import { Metadata } from "next"; // Importar Metadata de Next.js
import { getServerSession, Session } from "next-auth"; // Importar para manejar sesiones
import authOptions from "@/utils/authOptions"; // Opciones de autenticación
import React, { ReactElement } from "react"; // Importar React
import LoadingPage from "@/app/(pages)/loading"; // Componente de carga
import { verificarPermiso } from "@/services/SessionService"; // Verificación de permisos
import PermisoEnum from "@/types/enums/PermisoEnum"; // Enum de permisos
import ErrorFC from "@/components/ErrorFC"; // Componente para mostrar errores
import RegisterIntervencionForm from "@/app/(pages)/(whiteBackground)/intervenciones/agregar/form"; // Componente del formulario
import UsuarioDTO from "@/types/dtos/UsuarioDTO"; // DTO del usuario

// Metadata de la página
export const metadata: Metadata = {
    title: 'PFT - Agregar intervención'
};

// Componente de página principal
const RegisterIntervencionPage = async (): Promise<ReactElement> => {
    const sessionData: Session | null = await getServerSession(authOptions);
    const sessionAPIToken: string | undefined = sessionData?.user?.sessionAPIToken;
    const clientData: UsuarioDTO | undefined = sessionData?.user?.data;

    // Verifica si el token o los datos del usuario no están disponibles
    if (!sessionAPIToken || !clientData || clientData.id === undefined) {
        return <LoadingPage />;
    }

    // Verifica si el usuario tiene el permiso requerido
    if (!await verificarPermiso(sessionAPIToken, PermisoEnum.ALTA_INTERVENCION)) {
        return <ErrorFC message={"Acceso denegado"} />;
    }

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <RegisterIntervencionForm sessionAPIToken={sessionAPIToken} clientData={{ id: clientData.id }} />
            </div>
        </main>
    );
};

// Asegúrate de que el componente se exporta correctamente
export default RegisterIntervencionPage;
