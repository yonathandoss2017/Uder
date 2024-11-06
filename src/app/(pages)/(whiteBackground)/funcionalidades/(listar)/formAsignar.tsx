import {ReactElement, useEffect, useState} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import styles from "@public/styles/modules/table/table.editformfuncionalidad.module.css";
import FuncionalidadDTO from "@/types/dtos/FuncionalidadDTO";
import PerfilDTO from "@/types/dtos/PerfilDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {listarPerfiles} from "@/services/PerfilService";
import {asignarFuncionalidad, listarPerfilesFuncionalidad} from "@/services/FuncionalidadService";
import LoadingPage from "@/app/(pages)/loading";
import {useForm, UseFormReturn} from "react-hook-form";
import {ModalButtonsType} from "@/components/ModalFC";
import {useToken} from "@/app/hooks/TokenProvider";

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

    const { sessionAPIToken } = useToken();

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    const {
        register,               // Método para registrar los inputs del formulario
        handleSubmit,           // Método para manejar el envío del formulario
    }:  UseFormReturn<FuncionalidadDTO> = useForm<FuncionalidadDTO>(
    );

    const [perfiles, setPerfiles] = useState<PerfilDTO[]>([]);
    const [perfilesFuncionalidad, setPerfilesFuncionalidad] = useState<PerfilDTO[]>([]);
    const [perfilesSeleccionados, setPerfilesSeleccionados] = useState<PerfilDTO[]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);

    useEffect(() => {

        if(sessionAPIToken === null) return;

        (async (): Promise<void> => {
            const response: PerfilDTO[] | FetchAPIError = await listarPerfiles(sessionAPIToken, {activo: true});
            if (isFetchAPIError(response)) {
                console.error("ERROR - obtenerPerfiles: ", response);
                setPerfiles([]);
                return;
            }
            setPerfiles(response);

            if(props.funcionalidad.id) {
                const response: PerfilDTO[] | FetchAPIError = await listarPerfilesFuncionalidad(props.funcionalidad.id, sessionAPIToken);
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


    }, [props.funcionalidad, props.sessionAPIToken, sessionAPIToken]);

    useEffect(() => {
        console.log("perfiles", perfiles)
        console.log("perfilesFuncionalidad", perfilesFuncionalidad)
    }, [perfilesFuncionalidad, perfiles]);

    useEffect(() => {
        console.log("perfilesSeleccionados", perfilesSeleccionados)
    }, [perfilesSeleccionados]);

    const onSubmit = async (formValues: FormValues): Promise<void> => {

        if (sessionAPIToken == null) return;

        if(!props.funcionalidad.id) return;
        const response: void | FetchAPIError = await asignarFuncionalidad(props.funcionalidad.id, perfilesSeleccionados, sessionAPIToken);
        if (isFetchAPIError(response)) {
            createModal({
                children: (
                    <p>Error al asignar los perfiles a la funcionalidad: {response.errorMessage}</p>
                ),
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            console.error('ERROR - Asignar Perfiles Funcionalidad - formAsignar.tsx - onSubmit - asignarPerfilesFuncionalidad', response);
            return;
        }

        createModal({
            children: (
                <p>Perfiles asignados correctamente</p>
            ),
            buttonsType: ModalButtonsType.CONFIRM
        }).show();
        if (props.onSave) props.onSave(formValues);
    }

    if(!loaded) return <LoadingPage/>
    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`${styles.formContainer} ${styles.aparecer}`}>
            <p style={{ fontWeight: "bold" }}>Asignar funcionalidades</p>
            <div className={styles.detailsContainer}>
                <div className={styles.scroll}>
                    <div className={styles.perfilesContainer}>
                    <label className={styles.details}>Perfiles</label>
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
                        <p>No hay perfiles disponibles para asignar.</p>
                    )}
                    </div>
                </div>
            </div>
            <div className={styles.buttomM}>
            <button type="submit">Guardar</button>
            <button type="button" onClick={props.onCancel}>Cancelar</button>
            </div>
        </form>
    );
}

export default AsignarFuncionalidadesForm;

