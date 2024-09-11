import styles from "@public/styles/modules/register.equipo.module.css";
import {Metadata} from "next";
import {getServerSession, Session} from "next-auth";
import authOptions from "@/utils/authOptions";
import React, {ReactElement} from "react";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import LoadingPage from "@/app/(pages)/loading";
import {verificarPermiso} from "@/services/SessionService";
import PermisoEnum from "@/types/enums/PermisoEnum";
import ErrorFC from "@/components/ErrorFC";
import RegisterModeloForm from "@/app/(pages)/(whiteBackground)/modelos/agregar/form";

export const metadata: Metadata = {
    title: 'PInfra DD - Agregar modelo'
};

const RegisterModeloPage = async (): Promise<ReactElement> => {
    const sessionData: Session | null = await getServerSession(authOptions);
    const sessionAPIToken: string | undefined = sessionData?.user?.sessionAPIToken;
    const clientData: UsuarioDTO | undefined = sessionData?.user?.data;

    if (!sessionAPIToken || !clientData) return <LoadingPage/>;

    if (!await verificarPermiso(sessionAPIToken, PermisoEnum.ALTA_MODELO)) {
        return <ErrorFC message={"Acceso denegado"}/>;
    }

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <RegisterModeloForm clientData={clientData} sessionAPIToken={sessionAPIToken}/>
            </div>
        </main>
    );
};

export default RegisterModeloPage;
