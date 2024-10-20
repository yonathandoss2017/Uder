import MarcaDTO from "@/types/dtos/MarcaDTO";
import React, {ReactElement} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import SchemaMarca from "@/validations/SchemaMarca";
import ChangeEntry from "@/types/ChangeEntry";
import {ModalButtonsType} from "@/components/ModalFC";
import ModalChangesFC from "@/components/ModalChangesFC";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {modificarMarca} from "@/services/MarcaService";
import styles from "@public/styles/modules/table/table.editformequipo.module.css";
import {useToken} from "@/app/hooks/TokenProvider";


interface EditMarcaFormProps{
    sessionAPIToken: string;
    idInstitucion: number;
    editingMarca: MarcaDTO;
    onSave?: (marcaModified: MarcaDTO) => void;
    onCancel?: () => void;
}

function EditMarcaForm(props: Readonly<EditMarcaFormProps>): ReactElement{

    const {sessionAPIToken } = useToken();

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    // -------------------- Formulario de modificación de tipo de equipo --------------------
    // Obtenemos los métodos y propiedades necesarios del hook useForm para el formulario
    const {
        register,               // Método para registrar los inputs del formulario
        handleSubmit,           // Método para manejar el envío del formulario
        formState: {errors}     // Propiedad que contiene los errores del formulario
    }:  UseFormReturn<MarcaDTO> = useForm<MarcaDTO>({ // Inicializamos useForm con MarcaFormData
        resolver: zodResolver(SchemaMarca),    // Usamos zodResolver para la validación del formulario con el esquema de Zod schemaMarca
        mode: 'all',                            // Configuramos el modo de validación a "all", lo que válida en cada cambio de valor y al salir del campo
        defaultValues: {}
    });

    // Procedimiento que se ejecuta al hacer clic en el botón 'Guardar'
    const onSubmit: SubmitHandler<MarcaDTO> = async (formValues: MarcaDTO): Promise<void> => {

        if (sessionAPIToken == null) return;

        const modifiedMarca: MarcaDTO = {
            ...props.editingMarca, // Copia los valores originales del equipo
            nombre: formValues.nombre
        }

        // Obtiene los cambios realizados
        const changes: ChangeEntry[] = await obtenerCambios(
            modifiedMarca,
            props.editingMarca
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
            title: "Modificando marca \"" + props.editingMarca + "\"",
            children: ModalChangesFC(changes),
            buttonsType: ModalButtonsType.CONFIRM_CANCEL,
            async onConfirm(): Promise<void> {
                // Realiza la modificación de marca en la API
                const response: void | FetchAPIError = await modificarMarca(modifiedMarca, sessionAPIToken);

                if (isFetchAPIError(response)) {
                    createModal({
                        children: (
                            <p>Error al modificar marca: {response.errorMessage}</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                    console.error('ERROR - Modificar Marca - table.tsx - handleSave - modificarMarca', response);
                    return;
                }

                // Muestra un mensaje de éxito al modificar el tipo de equipo
                createModal({
                    children: (
                        <p>Marca con nombre: &quot;{props.editingMarca.nombre}&quot; modificado
                            correctamente</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();

                if (props.onSave) {
                    props.onSave(modifiedMarca);
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
            <h2>Modificacion de Marca</h2>
            <div className={styles.detailsContainer}>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Nombre<span className={styles.requiredField}>*</span></label>
                    <input
                        {...register("nombre", {required: "Este campo es requerido"})}
                        type="text"
                        placeholder="Nombre de la Marca"
                        className="nombre"
                        defaultValue={props.editingMarca.nombre}
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

export default EditMarcaForm;

async function obtenerCambios(editingMarca: MarcaDTO, originalData: MarcaDTO): Promise<ChangeEntry[]>{

    const changes: ChangeEntry[] = [];

    if (originalData.nombre !== editingMarca.nombre) {
        changes.push({
            field: "Nombre",
            previousValue: originalData.nombre,
            nextValue: editingMarca.nombre
        });
    }
    // Retorna la lista de cambios realizados
    return changes;
}