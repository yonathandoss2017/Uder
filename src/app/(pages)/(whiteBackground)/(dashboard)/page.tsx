// Importa los estilos de la página
import styles from "@public/styles/modules/dashboard.module.css";

// Importa los módulos necesarios
import {getServerSession, Session} from "next-auth";
import authOptions from "@/utils/authOptions";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import React, {ReactElement} from "react";
import LoadingPage from "@/app/(pages)/loading";
import {Metadata} from "next";
import HomeGraphFC from "@/components/HomeGraphFC";
import AuditoriaDTO from "@/types/dtos/AuditoriaDTO";
import OperacionEnum, {translateOperacionEnum} from "@/types/enums/OperacionEnum";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {listarAuditorias} from "@/services/AuditoriaService";

// Define la metadata de la página principal
export const metadata: Metadata = {
    title: 'PInfra DD - Panel Principal',
};

// Define la página principal de la aplicación
const HomePage = async (): Promise<ReactElement> => {

    // Obtiene la información de la sesión del cliente desde el servidor front (NextAuth)
    const sessionData: Session | null = await getServerSession(authOptions);

    // Obtiene el token de sesión del cliente en la API
    const sessionAPIToken: string | undefined = sessionData?.user?.sessionAPIToken;

    // Obtiene los datos de usuario del cliente
    const clientData: UsuarioDTO | undefined = sessionData?.user?.data;

    // Si no se obtienen los datos se muestra la página de carga
    if (!sessionAPIToken || !clientData) return <LoadingPage/>;

    // Obtiene las auditorias del cliente y las ordena por fecha y hora de forma descendente
    const auditorias: AuditoriaDTO[] = await listarAuditorias(sessionAPIToken).then((response: AuditoriaDTO[] | FetchAPIError): AuditoriaDTO[] => {
        if (isFetchAPIError(response)) { // Sí ocurre un error al obtener las auditorias
            console.error("Error al obtener las auditorias: ", response); // Muestra el error en consola
            return []; // Retorna un arreglo vacío
        }

        return response.sort((a: AuditoriaDTO, b: AuditoriaDTO): number => {
            const dateA: number = new Date(a.fechaHora).getTime(); // Convierte la fecha y hora a milisegundos
            const dateB: number = new Date(b.fechaHora).getTime(); // Convierte la fecha y hora a milisegundos

            if (dateA > dateB) { // Si la fecha y hora A es mayor que la fecha y hora B
                return -1; // Retorna -1 (A va antes que B)
            }
            if (dateA < dateB) { // Si la fecha y hora A es menor que la fecha y hora B
                return 1; // Retorna 1 (A va después que B)
            }
            return 0; // Si son iguales retorna 0 (A y B son iguales)
        });
    });

    // Retorna el JSX de la página principal
    return (
        <main className={styles.panelPrincipal}>
            <div className={styles.tituloPP}>
                <h2>Bienvenido {clientData.primerNombre} {clientData.primerApellido}</h2>
                <h4>Panel Principal</h4>
            </div>
            <div className={styles.contenidoPP}>
                <HomeGraphFC sessionAPIToken={sessionAPIToken}/>
                <div className={styles.auditoria}>
                    <h3>Mis auditorías</h3>
                    <div className={styles.asideAuditoria}>
                        {auditorias?.length > 0 ?
                            (auditorias.map((auditoria: AuditoriaDTO) => (
                                    <div key={auditoria.id} className={styles.divAuditoria}>
                                        <p className={styles.auditoriaFecha}>
                                            {new Date(auditoria.fechaHora).toLocaleString('es-ES')}
                                        </p>
                                        <p className={styles.auditoriaOperacion}>{translateOperacionEnum(OperacionEnum[auditoria.operacion])}</p>
                                        <p className={styles.auditoriaCambios}>{auditoria.mensaje}</p>
                                    </div>
                                ))
                            )
                            :
                            (
                                <p>No tienes auditorias registradas</p>
                            )
                        }
                    </div>
                </div>
            </div>
        </main>
    );
}

// Exporta la página
export default HomePage;