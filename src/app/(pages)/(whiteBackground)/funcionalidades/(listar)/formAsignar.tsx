/*import {ChangeEvent, ReactElement, useEffect, useState} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import styles from "@public/styles/modules/table/table.editformequipo.module.css";
import FuncionalidadDTO from "@/types/dtos/FuncionalidadDTO";
import {register} from "next/dist/client/components/react-dev-overlay/pages/client";
import PerfilDTO from "@/types/dtos/PerfilDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";

interface AsignarFuncionalidadesFormProps {
    sessionAPIToken: string;
    idInstitucion: number;
    funcionalidad: FuncionalidadDTO;
    onSave?: (funcionalidadModified: FuncionalidadDTO) => void;
    onCancel?: () => void;
}

interface FormValues extends FuncionalidadDTO{

}

function AsignarFuncionalidadesForm(props: Readonly<AsignarFuncionalidadesFormProps>): ReactElement {

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    const [perfiles, setPerfiles] = useState<PerfilDTO[]>([]);

    useEffect(() => {

        const response: PerfilDTO[] | FetchAPIError = await obtenerPerfilesInstitucion(props.idInstitucion, props.sessionAPIToken);
        if (isFetchAPIError(response)) {
            console.error("ERROR - obtenerPerfiles: ", response);
            setPerfiles([]);
            return;
        }
        setPerfiles(response);
    }, [props.funcionalidad, props.sessionAPIToken]);

    return (
        <form>
            <p>Asignar funcionalidades</p>
            <div className={styles.inputBox}>
                <div className={styles.scroll}>
                    <label className={styles.details}>Permisos</label>
                    {perfiles.length > 0 ? (
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

export default AsignarFuncionalidadesForm;
*/
