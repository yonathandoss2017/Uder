import FuncionalidadDTO from "@/types/dtos/FuncionalidadDTO";
import React, {ReactElement, useEffect, useState} from "react";
import PermisoEnum from "@/types/enums/PermisoEnum";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {obtenerPermisosFuncionalidad} from "@/services/FuncionalidadService";
import styles from "@public/styles/modules/modal.view.funcionalidad.module.css";
import LoadingPage from "@/app/(pages)/loading";

interface ModalViewFuncionalidadFC{
    funcionalidad: FuncionalidadDTO;
    sessionAPIToken: string;
}

const ModalViewFuncionalidadFC = ({funcionalidad, sessionAPIToken}: ModalViewFuncionalidadFC): ReactElement => {

    const [permisos, setPermisos] = useState<PermisoEnum[]>([]);
    //Bandera de cargando
    const [loaded, setLoaded]: [boolean,(value: boolean) => void] = useState<boolean>(false);

    useEffect(() => {
        (async (): Promise<void> => {
            const response: PermisoEnum[] | FetchAPIError = await obtenerPermisosFuncionalidad(funcionalidad);
            console.log("Estos son los permisos", response);
            if (isFetchAPIError(response)) {
                console.error("ERROR - obtenerPermisos: ", response);
                setPermisos([]);
                return;
            }
            setPermisos(response);
        })();
        setLoaded(true);
    }, [funcionalidad, sessionAPIToken]);

    if (!loaded) return <LoadingPage />;
    return (
        <div className={`${styles.container}`}>
            <h2>Datos de la funcionalidad</h2>
            <div className={styles.detailsContainer}>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Nombre</label>
                    <p className={styles.detailsValue}>{funcionalidad.nombre}</p>
                </div>
                {permisos.length > 0 ? (
                    <div className={styles.permisosContainer}>
                        <label className={styles.details}>Permisos</label>
                        {permisos.map((permiso: PermisoEnum, index: number) => (
                            <div className={styles.detailsValue} key={index}>
                                <p >{permiso.valueOf()}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No hay permisos disponibles para esta funcionalidad.</p>
                )}
            </div>
        </div>
    )

}

export default ModalViewFuncionalidadFC;