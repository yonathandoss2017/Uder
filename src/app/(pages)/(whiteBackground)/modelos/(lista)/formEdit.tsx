import ModeloDTO from "@/types/dtos/ModeloDTO";
import React, {ReactElement} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import SchemaModelo from "@/validations/SchemaModelo";
import ChangeEntry from "@/types/ChangeEntry";
import {ModalButtonsType} from "@/components/ModalFC";
import ModalChangesFC from "@/components/ModalChangesFC";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {modificarModelo} from "@/services/ModeloService";
import styles from "@public/styles/modules/table/table.editformequipo.module.css";
import {useToken} from "@/app/hooks/TokenProvider";


interface EditModeloFormProps {
    sessionAPIToken: string;
    idInstitucion: number;
    editingModelo: ModeloDTO;
    onSave?: (modeloModified: ModeloDTO) => void;
    onCancel?: () => void;
}

function EditModeloForm(props: Readonly<EditModeloFormProps>): ReactElement {

    // Obtiene el token de sesión del cliente
    const {sessionAPIToken } = useToken();

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    // -------------------- Formulario de modificación de modelo --------------------
    const {
        register,               // Método para registrar los inputs del formulario
        handleSubmit,           // Método para manejar el envío del formulario
        formState: {errors}     // Propiedad que contiene los errores del formulario
    }: UseFormReturn<ModeloDTO> = useForm<ModeloDTO>({ // Inicializamos useForm con ModeloDTO
        resolver: zodResolver(SchemaModelo),    // Usamos zodResolver para la validación del formulario con el esquema de Zod SchemaModelo
        mode: 'all',                            // Configuramos el modo de validación a "all", lo que válida en cada cambio de valor y al salir del campo
        defaultValues: {}
    });

    // Procedimiento que se ejecuta al hacer clic en el botón 'Guardar'
    const onSubmit: SubmitHandler<ModeloDTO> = async (formValues: ModeloDTO): Promise<void> => {

        if(sessionAPIToken == null) return;

        const modifiedModelo: ModeloDTO = {
            ...props.editingModelo, // Copia los valores originales del modelo
            nombre: formValues.nombre
        }

        // Obtiene los cambios realizados
        const changes: ChangeEntry[] = await obtenerCambios(
            modifiedModelo,
            props.editingModelo
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
            title: `Modificando modelo "${props.editingModelo.nombre}"`,
            children: ModalChangesFC(changes),
            buttonsType: ModalButtonsType.CONFIRM_CANCEL,
            async onConfirm(): Promise<void> {
                // Realiza la modificación de modelo en la API
                const response: void | FetchAPIError = await modificarModelo(modifiedModelo, sessionAPIToken);

                if (isFetchAPIError(response)) {
                    createModal({
                        children: (
                            <p>Error al modificar modelo: {response.errorMessage}</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                    console.error('ERROR - Modificar Modelo - table.tsx - handleSave - modificarModelo', response);
                    return;
                }

                // Muestra un mensaje de éxito al modificar el modelo
                createModal({
                    children: (
                        <p>Modelo con nombre: &quot;{props.editingModelo.nombre}&quot; modificado
                            correctamente</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();

                if (props.onSave) {
                    props.onSave(modifiedModelo);
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
            <h2>Modificacion de Modelo</h2>
            <div className={styles.detailsContainer}>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Nombre<span className={styles.requiredField}>*</span></label>
                    <input
                        {...register("nombre", {required: "Este campo es requerido"})}
                        type="text"
                        placeholder="Nombre del Modelo"
                        className="nombre"
                        defaultValue={props.editingModelo.nombre}
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

export default EditModeloForm;

async function obtenerCambios(editingModelo: ModeloDTO, originalData: ModeloDTO): Promise<ChangeEntry[]> {

    const changes: ChangeEntry[] = [];

    if (originalData.nombre !== editingModelo.nombre) {
        changes.push({
            field: "Nombre",
            previousValue: originalData.nombre,
            nextValue: editingModelo.nombre
        });
    }
    // Retorna la lista de cambios realizados
    return changes;
}
