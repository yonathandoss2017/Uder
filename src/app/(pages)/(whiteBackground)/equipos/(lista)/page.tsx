// Importa los módulos necesarios
import { getServerSession, Session } from 'next-auth';
import authOptions from "@/utils/authOptions";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import LoadingPage from "@/app/(pages)/loading";
import React, {ReactElement} from "react";
import { Metadata } from "next";
import EquiposComponent from "@/components/EquiposComponent";

// Define la metadata de la página
export const metadata: Metadata = {
    title: 'PInfra DD - Lista de equipos'
};

// Define la página de lista de equipos ("/equipos")
const EquiposPage = async (): Promise<ReactElement> => {
    // Obtiene la información de la sesión del cliente desde el servidor front (NextAuth)
    const sessionData: Session | null = await getServerSession(authOptions);

    // Obtiene el token de sesión del cliente en la API
    const sessionAPIToken: string | undefined = sessionData?.user?.sessionAPIToken;

    // Obtiene los datos de usuario del cliente
    const clientData: UsuarioDTO | undefined = sessionData?.user?.data;

    // Si no se obtienen los datos se muestra la página de carga
    if (!sessionAPIToken || !clientData) return <LoadingPage />;

    // Retorna el JSX de la página de lista de usuarios
    return <EquiposComponent sessionAPIToken={sessionAPIToken} clientData={clientData} />;
};

// Exporta la página de lista de equipos
export default EquiposPage;
