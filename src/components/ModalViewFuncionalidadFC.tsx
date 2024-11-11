import FuncionalidadDTO from "@/types/dtos/FuncionalidadDTO";
import React, {ReactElement, useEffect, useState} from "react";
import PermisoEnum from "@/types/enums/PermisoEnum";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {obtenerPermisosFuncionalidad} from "@/services/FuncionalidadService";
import styles from "@public/styles/modules/modal.view.funcionalidad.module.css";
import LoadingPage from "@/app/(pages)/loading";
import stylesTable from "@public/styles/modules/table/table.tipoequipos.module.css";
import {useToken} from "@/app/hooks/TokenProvider";

interface ModalViewFuncionalidadFC{
    funcionalidad: FuncionalidadDTO;
}

const ModalViewFuncionalidadFC = ({funcionalidad}: ModalViewFuncionalidadFC): ReactElement => {

    // Obtenemos el token de sesión del cliente
    const {sessionAPIToken } = useToken();

    const [permisos, setPermisos] = useState<string[]>([]);
    //Bandera de cargando
    const [loaded, setLoaded]: [boolean,(value: boolean) => void] = useState<boolean>(false);

    useEffect(() => {

        if(!sessionAPIToken) return;

        (async (): Promise<void> => {
            const response: string[] | FetchAPIError = await obtenerPermisosFuncionalidad(funcionalidad, sessionAPIToken);
            if (isFetchAPIError(response)) {
                console.error("ERROR - obtenerPermisos: ", response);
                setPermisos([]);
                return;
            }
            setPermisos(response);
        })();
        setLoaded(true);
    }, [funcionalidad, sessionAPIToken]);

    if (!loaded) return <LoadingPage/>;
    return (
        <div className={`${styles.container}`}>
            <div className={stylesTable.scroll}>
                <h2>Datos de la funcionalidad</h2>
                <div className={styles.detailsContainer}>
                    <div className={styles.inputBox}>
                        <label className={styles.details}>Nombre</label>
                        <p className={styles.detailsValue}>{funcionalidad.nombre}</p>
                    </div>
                    {permisos.length > 0 ? (
                        <div className={styles.permisosContainer}>
                            <label className={styles.details}>Permisos</label>
                            {permisos.map((permiso: string, index: number) => (
                                <div className={styles.detailsValue} key={index}>
                                    <p>{permiso}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No hay permisos disponibles para esta funcionalidad.</p>
                    )}
                </div>
            </div>
        </div>
    )

}

export default ModalViewFuncionalidadFC;