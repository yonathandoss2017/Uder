import React, {ChangeEvent, ReactElement, useEffect, useState} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import PermisoEnum from "@/types/enums/PermisoEnum";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {obtenerPermisosFuncionalidad} from "@/services/FuncionalidadService";
import FuncionalidadDTO from "@/types/dtos/FuncionalidadDTO";
import styles from "@public/styles/modules/table/table.tipoequipos.module.css";
import {set, useForm, UseFormReturn} from "react-hook-form";
import {inspect} from "util";

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

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    //Todos los permisos disponibles
    const [permisos, setPermisos] = useState<{ nombre: string, valor: number }[]>([]); // Array de objetos con nombre y valor del permiso
    //Los permisos de la funcionalidad
    const [permisosFuncionalidad, setPermisosFuncionalidad] = useState<Set<number>>(
        new Set(Array.isArray(props.funcionalidad.permisos) ? props.funcionalidad.permisos : [])
    );

    //Bandera de cargando
    const [loaded, setLoaded]: [boolean,(value: boolean) => void] = useState<boolean>(false);

    // Para manejar el formulario
    const { register, handleSubmit } = useForm<FormValues>({ //
        defaultValues: {
            ...props.funcionalidad, // Inicializamos el formulario con los valores de la funcionalidad
        },
    });

    // Obtener los permisos de la funcionalidad
    useEffect(() => {
        (async (): Promise<void> => {
            // Obtenemos los permisos de la funcionalidad
            const response: number[] | FetchAPIError = await obtenerPermisosFuncionalidad(props.funcionalidad);
            if (isFetchAPIError(response)) { // Si hay un error
                console.error("ERROR - obtenerPermisos: ", response);
                setPermisosFuncionalidad(new Set()); // Vaciamos la lista de permisos si hay error
                return;
            }
            const permisosSet = new Set(response); // Creamos un Set a partir de la respuesta
            setPermisosFuncionalidad(permisosSet); // Asignamos los permisos obtenidos
        })();
        setLoaded(true); // Marcamos como cargado
    }, [props.funcionalidad, props.sessionAPIToken]);


    useEffect(() => {
        const permisosEnum = Object.keys(PermisoEnum)
            .filter(key => isNaN(Number(key))) // Filtramos solo los nombres
            .map(key => ({
                nombre: key,
                valor: PermisoEnum[key as keyof typeof PermisoEnum] // Obtener el valor numérico del enum
            }));

        setPermisos(permisosEnum); // Almacenar el array de objetos { nombre, valor }
    }, [props.funcionalidad, props.sessionAPIToken]);



    // Manejar el cambio de los checkboxes
    const handleCheckBoxChange = (permiso: number) => {
        // Actualizamos los permisos de la funcionalidad
        setPermisosFuncionalidad((prevPermisosFuncionalidad) => { // Obtenemos los permisos actuales
            // Creamos un nuevo set con los permisos actuales
            const newPermisosFuncionalidad = new Set(prevPermisosFuncionalidad);
            // Si el permiso ya está en la funcionalidad, lo eliminamos
            if (newPermisosFuncionalidad.has(permiso)) {
                // Eliminamos el permiso
                newPermisosFuncionalidad.delete(permiso);
            } else {
                // Si no está, lo agregamos
                newPermisosFuncionalidad.add(permiso);
            }
            // Devolvemos el nuevo set de permisos
            return newPermisosFuncionalidad;
        })
    }

    // Procedimiento que se ejecuta al hacer clic en el botón 'Guardar'
    const onSumbit = async (data: FormValues) => {
        // Creamos un objeto con los datos de la funcionalidad actualizados
        const updateFunconalidad: FuncionalidadDTO = {
            ...data, // Copiamos los datos del formulario
            permisos: permisosFuncionalidad, // Actualizamos los permisos
        };
        props.onSave?.(updateFunconalidad); // Llamamos a la función onSave con la funcionalidad actualizada
    };

    return (
        <form onSubmit={handleSubmit(onSumbit)}>
            <p>Asignar permisos</p>
            <div className={styles.inputBox}>
                <div className={styles.scroll}>
                    <label className={styles.details}>Permisos</label>
                    {permisos.length > 0 ? (
                        permisos.map(({ nombre, valor }, index: number) => (
                            <div key={index}>
                                <label htmlFor={nombre}>{nombre}</label>
                                <input
                                    type="checkbox"
                                    id={nombre}
                                    checked={permisosFuncionalidad.has(valor)} // Comprobamos si el permiso ya está en la funcionalidad
                                    onChange={() => handleCheckBoxChange(valor)} // Pasamos el valor numérico en lugar del nombre
                                />
                            </div>
                        ))
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