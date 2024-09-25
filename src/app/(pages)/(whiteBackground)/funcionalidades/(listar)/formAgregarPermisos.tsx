import React, {ChangeEvent, ReactElement, useEffect, useState} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import PermisoEnum from "@/types/enums/PermisoEnum";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {obtenerPermisosFuncionalidad} from "@/services/FuncionalidadService";
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

interface FormValues extends FuncionalidadDTO {
}

function AgregarPermisosForm(props: Readonly<AgregarPermisosFormProps>): ReactElement {

    const {createModal} = useModal();

    //Todos los permisos
    const [permisos, setPermisos] = useState<string[]>([]);
    const [permisosFuncionalidad, setPermisosFuncionalidad]= useState<string[]>([]);
    const [loaded, setLoaded]: [boolean, (value: boolean) => void] = useState<boolean>(false);

    useEffect(() => {
        const allPermisos = Object.entries(PermisoEnum)
            .filter(([key, value]) => typeof value === 'number') // Ensure you're only working with the numeric values.
            .map(([key]) => key); // Extract the keys (permission names).

        setPermisos(allPermisos);
        (async (): Promise<void> => {
            const response: string[] | FetchAPIError = await obtenerPermisosFuncionalidad(props.funcionalidad);
            if (isFetchAPIError(response)) {
                console.error("ERROR - obtenerPermisos: ", response);
                setPermisosFuncionalidad([]);
                return;
            }
            setPermisosFuncionalidad(response);
            setLoaded(true);
        })();

    }, [props.funcionalidad, props.sessionAPIToken]);

    if (!loaded) return <LoadingPage/>

    return (
        <form>
            <p>Asignar permisos</p>
            <div className={styles.inputBox}>
                <div className={styles.scroll}>
                    <label className={styles.details}>Permisos</label>
                    {loaded && permisos.length > 0 ? (
                        <div className={styles.permisosContainer}>
                            {permisos.map((permiso: string, index: number) => (
                                <div className={styles.detailsValue} key={index}>
                                    <label htmlFor={permiso}>{permiso}</label>
                                    <input
                                        type="checkbox"
                                        id={permiso}
                                        checked={permisosFuncionalidad.includes(permiso)}
                                        onChange={() => {
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
        </form>
    );
};

export default AgregarPermisosForm;
