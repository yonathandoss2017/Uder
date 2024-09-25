import {ReactElement, useEffect, useState} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import styles from "@public/styles/modules/table/table.editformequipo.module.css";
import FuncionalidadDTO from "@/types/dtos/FuncionalidadDTO";
import PerfilDTO from "@/types/dtos/PerfilDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {listarPerfiles} from "@/services/PerfilService";
import {listarPerfilesFuncionalidad} from "@/services/FuncionalidadService";
import LoadingPage from "@/app/(pages)/loading";

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
    const [perfilesFuncionalidad, setPerfilesFuncionalidad] = useState<PerfilDTO[]>([]);
    const [perfilesSeleccionados, setPerfilesSeleccionados] = useState<PerfilDTO[]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);

    useEffect(() => {
        (async (): Promise<void> => {
            const response: PerfilDTO[] | FetchAPIError = await listarPerfiles(props.sessionAPIToken);
            if (isFetchAPIError(response)) {
                console.error("ERROR - obtenerPerfiles: ", response);
                setPerfiles([]);
                return;
            }
            setPerfiles(response);

            if(props.funcionalidad.id) {
                const response: PerfilDTO[] | FetchAPIError = await listarPerfilesFuncionalidad(props.funcionalidad.id);
                if (isFetchAPIError(response)) {
                    console.error("ERROR - obtenerPerfilesFuncionalidad: ", response);
                    setPerfilesFuncionalidad([]);
                    return;
                }
                setPerfilesFuncionalidad(response);
                setPerfilesSeleccionados(response)
            }

            setLoaded(true);
        })();


    }, [props.funcionalidad, props.sessionAPIToken]);

    useEffect(() => {
        console.log("perfiles", perfiles)
        console.log("perfilesFuncionalidad", perfilesFuncionalidad)
    }, [perfilesFuncionalidad, perfiles]);

    useEffect(() => {
        console.log("perfilesSeleccionados", perfilesSeleccionados)
    }, [perfilesSeleccionados]);


    if(!loaded) return <LoadingPage/>
    return (
        <form>
            <p>Asignar funcionalidades</p>
            <div className={styles.inputBox}>
                <div className={styles.scroll}>
                    <label className={styles.details}>Permisos</label>
                    {perfiles.length > 0 ? (
                        <div className={styles.permisosContainer}>
                            {perfiles.map((perfil: PerfilDTO) => (
                                <div className={styles.detailsValue} key={perfil.id}>
                                    <label htmlFor={perfil.nombre}>{perfil.nombre}</label>
                                    <input
                                        type="checkbox"
                                        id={perfil.nombre}
                                        checked={perfilesSeleccionados.some((p) => p.id === perfil.id)}
                                        onChange={
                                            (e) => {
                                                if(e.target.checked) {
                                                    setPerfilesSeleccionados([...perfilesSeleccionados, perfil]);
                                                } else {
                                                    setPerfilesSeleccionados(perfilesSeleccionados.filter((perfilS: PerfilDTO) => perfilS.id !== perfil.id));
                                                }
                                            }
                                        }
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

