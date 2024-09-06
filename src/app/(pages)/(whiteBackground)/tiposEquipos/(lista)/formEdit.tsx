import React, {ChangeEvent, ReactElement} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import SchemaTipoEquipo from "@/validations/SchemaTipoEquipo";
import styles from "@public/styles/modules/table/table.editformequipo.module.css";
import TipoEquipoDTO from "@/types/dtos/TipoEquipoDTO";
import ChangeEntry from "@/types/ChangeEntry";
import {ModalButtonsType} from "@/components/ModalFC";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import ModalChangesFC from "@/components/ModalChangesFC";
import {modificarTipoEquipo} from "@/services/TipoEquipoService";

interface EditTipoEquipoFormProps {
    sessionAPIToken: string;
    idInstitucion: number;
    editingTipoEquipo: TipoEquipoDTO;
    onSave?: (tipoEquipoModified: TipoEquipoDTO) => void;
    onCancel?: () => void;
}



function EditTipoEquipoForm(props: Readonly<EditTipoEquipoFormProps>): ReactElement {

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    // -------------------- Formulario de modificación de tipo de equipo --------------------
    // Obtenemos los métodos y propiedades necesarios del hook useForm para el formulario
    const {
        register,               // Método para registrar los inputs del formulario
        handleSubmit,           // Método para manejar el envío del formulario
        formState: {errors}     // Propiedad que contiene los errores del formulario
    }:  UseFormReturn<TipoEquipoDTO> = useForm<TipoEquipoDTO>({ // Inicializamos useForm con el tipo EquipoFormData
        resolver: zodResolver(SchemaTipoEquipo),    // Usamos zodResolver para la validación del formulario con el esquema de Zod schemaTipoEquipo
        mode: 'all',                            // Configuramos el modo de validación a "all", lo que válida en cada cambio de valor y al salir del campo
        defaultValues: {}
    });

    // Procedimiento que se ejecuta al hacer clic en el botón 'Guardar'
    const onSubmit: SubmitHandler<TipoEquipoDTO> = async (formValues: TipoEquipoDTO): Promise<void> => {

        const modifiedTipoEquipo: TipoEquipoDTO = {
            ...props.editingTipoEquipo, // Copia los valores originales del equipo
            nombre: formValues.nombre
        }

        // Obtiene los cambios realizados
        const changes: ChangeEntry[] = await obtenerCambios(
            modifiedTipoEquipo,
            props.editingTipoEquipo
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
            title: "Modificando tipo de equipo \"" + props.editingTipoEquipo + "\"",
            children: ModalChangesFC(changes),
            async onConfirm(): Promise<void> {
                // Realiza la modificación del tipo de equipo en la API
                const response: void | FetchAPIError = await modificarTipoEquipo(modifiedTipoEquipo, props.sessionAPIToken);

                if (isFetchAPIError(response)) {
                    createModal({
                        children: (
                            <p>Error al modificar el tipo equipo: {response.errorMessage}</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                    console.error('ERROR - Modificar Tipo de Equipo - table.tsx - handleSave - modificarTipoEquipo', response);
                    return;
                }

                // Muestra un mensaje de éxito al modificar el tipo de equipo
                createModal({
                    children: (
                        <p>Tipo de Equipo con nombre: &quot;{props.editingTipoEquipo.nombre}&quot; modificado
                            correctamente</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();

                if (props.onSave) {
                    props.onSave(modifiedTipoEquipo);
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
            <h2>Modificacion de Tipo Equipo</h2>
            <div className={styles.detailsContainer}>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Nombre<span className={styles.requiredField}>*</span></label>
                    <input
                        {...register("nombre", {required: "Este campo es requerido"})}
                        type="text"
                        placeholder="Nombre del Tipo Equipo"
                        className="nombre"
                        defaultValue={props.editingTipoEquipo.nombre}
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

export default EditTipoEquipoForm;

async function obtenerCambios(editingTipoEquipo: TipoEquipoDTO, originalData: TipoEquipoDTO): Promise<ChangeEntry[]> {

    // Lista de cambios en la modificación del usuario
    const changes: ChangeEntry[] = [];

    // ==================================================================

    if (originalData.nombre !== editingTipoEquipo.nombre) {
        changes.push({
            field: "Nombre",
            previousValue: originalData.nombre,
            nextValue: editingTipoEquipo.nombre
        });
    }

    // Retorna la lista de cambios realizados
    return changes;
}