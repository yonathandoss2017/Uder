import FuncionalidadDTO from "@/types/dtos/FuncionalidadDTO";
import React, {ReactElement} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import SchemaFuncionalidad from "@/validations/SchemaFuncionalidad";
import ChangeEntry from "@/types/ChangeEntry";
import {ModalButtonsType} from "@/components/ModalFC";
import ModalChangesFC from "@/components/ModalChangesFC";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import styles from "@public/styles/modules/table/table.editformequipo.module.css";
import {modificarFuncionalidad} from "@/services/FuncionalidadService";
import {useToken} from "@/app/hooks/TokenProvider";

interface EditFuncionalidadFormProps {
    sessionAPIToken: string;
    idInstitucion: number;
    editingFuncionalidad: FuncionalidadDTO;
    onSave?: (funcionalidadModified: FuncionalidadDTO) => void;
    onCancel?: () => void;
}

function EditFuncionalidadForm(props: Readonly<EditFuncionalidadFormProps>): ReactElement {

    const { sessionAPIToken } = useToken();

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    // -------------------- Formulario de modificación de funcionalidades--------------------
    // Obtenemos los métodos y propiedades necesarios del hook useForm para el formulario
    const {
        register,               // Método para registrar los inputs del formulario
        handleSubmit,           // Método para manejar el envío del formulario
        formState: {errors}     // Propiedad que contiene los errores del formulario
    }:  UseFormReturn<FuncionalidadDTO> = useForm<FuncionalidadDTO>({ // Inicializamos useForm con el tipo EquipoFormData
        resolver: zodResolver(SchemaFuncionalidad),    // Usamos zodResolver para la validación del formulario con el esquema de Zod schemaTipoEquipo
        mode: 'all',                            // Configuramos el modo de validación a "all", lo que válida en cada cambio de valor y al salir del campo
        defaultValues: {}
    });

    // Procedimiento que se ejecuta al hacer clic en el botón 'Guardar'
    const onSubmit: SubmitHandler<FuncionalidadDTO> = async (formValues: FuncionalidadDTO): Promise<void> => {

        if(sessionAPIToken == null) return;

        const modifiedFuncionalidad: FuncionalidadDTO = {
            ...props.editingFuncionalidad, // Copia los valores originales del equipo
            nombre: formValues.nombre
        }

        // Obtiene los cambios realizados
        const changes: ChangeEntry[] = await obtenerCambios(
            modifiedFuncionalidad,
            props.editingFuncionalidad
        );

        if (changes.length === 0) {
            createModal({
                children: (
                    <p>No se realizaron cambios</p>
                ),
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        // Muestra un mensaje de confirmación antes de modificar y guarda la respuesta
        createModal({
            title: `Modificando funcionalidad "${props.editingFuncionalidad.nombre}"`,
            children: ModalChangesFC(changes),
            buttonsType: ModalButtonsType.CONFIRM_CANCEL,
            async onConfirm(): Promise<void> {
                console.log("ID INSTITUCION", modifiedFuncionalidad.idInstitucion);
                // Realiza la modificación del tipo de equipo en la API
                const response: void | FetchAPIError = await modificarFuncionalidad(modifiedFuncionalidad,sessionAPIToken);

                if (isFetchAPIError(response)) {
                    createModal({
                        children: (
                            <p>Error al modificar la funcionalidad: {response.errorMessage}</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                    console.error('ERROR - Modificar Funcionalidad - table.tsx - handleSave - modificarFuncionalidad', response);
                    return;
                }

                // Muestra un mensaje de éxito al modificar la funcionalidad
                createModal({
                    children: (
                        <p>Funcionalidad con nombre: &quot;{props.editingFuncionalidad.nombre}&quot; modificado
                            correctamente</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();

                if (props.onSave) {
                    props.onSave(modifiedFuncionalidad);
                }
            },
            onCancel(): void {
                createModal({
                    children: (
                        <p>Motivo: Modificación cancelada</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();
            }
        }).show();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`${styles.formContainer} ${styles.aparecer}`}>
            <h2>Modificacion de Funcionalidad</h2>
            <div className={styles.detailsContainer}>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Nombre<span className={styles.requiredField}>*</span></label>
                    <input
                        {...register("nombre", {required: "Este campo es requerido"})}
                        type="text"
                        placeholder="Nombre de la funcionalidad"
                        className="nombre"
                        defaultValue={props.editingFuncionalidad.nombre}
                    />
                    {errors.nombre &&
                        <label className={styles.error} style={{color: 'red'}}>{errors.nombre.message}</label>}
                </div>
            </div>

            <div className={styles.buttomM}>
                <button type="submit">Guardar</button>
                <button type="button" onClick={props.onCancel}>Cancelar</button>
            </div>
        </form>
    );

}

export default EditFuncionalidadForm;


async function obtenerCambios(editingFuncionalidad: FuncionalidadDTO, originalData: FuncionalidadDTO): Promise<ChangeEntry[]> {

    // Lista de cambios en la modificación del usuario
    const changes: ChangeEntry[] = [];

    // ==================================================================

    if (originalData.nombre !== editingFuncionalidad.nombre) {
        changes.push({
            field: "Nombre",
            previousValue: originalData.nombre,
            nextValue: editingFuncionalidad.nombre
        });
    }

    // Retorna la lista de cambios realizados
    return changes;
}
