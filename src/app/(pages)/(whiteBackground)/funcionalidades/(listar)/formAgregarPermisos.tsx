import React, { ChangeEvent, ReactElement, useEffect, useState } from "react";
import { useModal } from "@/app/hooks/modals/useModal";
import PermisoEnum from "@/types/enums/PermisoEnum";
import FetchAPIError, { isFetchAPIError } from "@/types/errors/FetchAPIError";
import { obtenerPermisosFuncionalidad } from "@/services/FuncionalidadService";
import FuncionalidadDTO from "@/types/dtos/FuncionalidadDTO";
import styles from "@public/styles/modules/table/table.tipoequipos.module.css";
import LoadingPage from "@/app/(pages)/loading";

interface AgregarPermisosFormProps {
    sessionAPIToken: string;
    idInstitucion: number;
    funcionalidad: FuncionalidadDTO;
    onSave?: (funcionalidadModified: FuncionalidadDTO) => void;
    onCancel?: () => void;
}

function AgregarPermisosForm(props: Readonly<AgregarPermisosFormProps>): ReactElement {
    const { createModal } = useModal();

    // Obtener los nombres de los permisos del enum
    const permisosNames = Object.keys(PermisoEnum).filter((key) => isNaN(Number(key)));
    console.log("TODOS PERMISOS", permisosNames)

    const [permisosFuncionalidad, setPermisosFuncionalidad] = useState<String[]>([]);
    const [permisosNombres, setPermisosNombres] = useState<string[]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);

    useEffect(() => {
        (async (): Promise<void> => {
            const response: String[] | FetchAPIError = await obtenerPermisosFuncionalidad(props.funcionalidad);
            if (isFetchAPIError(response)) {
                console.error("ERROR - obtenerPermisos: ", response);
                setPermisosFuncionalidad([]);
                setPermisosNombres([]);
                setLoaded(true);
                return;
            }
            setPermisosFuncionalidad(response);
            console.log("PERMISOS FUNCIONALIDAD", permisosFuncionalidad)

            //setPermisosNombres(response);
            console.log("PERMISOS FUN NOMBRES", permisosNombres)
            setLoaded(true);
        })();
    }, [props.funcionalidad]);

    console.log("PERMISOS FUNCIONALIDAD", permisosFuncionalidad)
    console.log("PERMISOS FUN NOMBRES", permisosNombres)

    if (!loaded) return <LoadingPage />;


    return (
        <form>
            <p>Asignar permisos</p>
            <div className={styles.inputBox}>
                <div className={styles.scroll}>
                    <label className={styles.details}>Permisos</label>
                    {permisosNames.length > 0 ? (
                        <div className={styles.permisosContainer}>
                            {permisosNames.map((permiso: string, index: number) => (
                                <div className={styles.detailsValue} key={index}>
                                    <label htmlFor={permiso}>{permiso}</label>
                                    <input
                                        type="checkbox"
                                        id={permiso}
                                        checked={permisosNombres.includes(permiso)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setPermisosNombres([...permisosNombres, permiso]);
                                            } else {
                                                setPermisosNombres(permisosNombres.filter((p) => p !== permiso));
                                            }
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No hay permisos disponibles para asignar.</p>
                    )}
                </div>
            </div>
            <button type="submit">Guardar</button>
            <button type="button" onClick={props.onCancel}>
                Cancelar
            </button>
        </form>
    );
}

export default AgregarPermisosForm;
