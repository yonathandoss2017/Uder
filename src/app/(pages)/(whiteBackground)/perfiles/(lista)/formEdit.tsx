import React, {ReactElement} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import SchemaPerfil from "@/validations/SchemaPerfil";
import styles from "@public/styles/modules/table/table.editformequipo.module.css";
import PerfilDTO from "@/types/dtos/PerfilDTO";
import ChangeEntry from "@/types/ChangeEntry";
import {ModalButtonsType} from "@/components/ModalFC";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import ModalChangesFC from "@/components/ModalChangesFC";
import {modificarPerfil} from "@/services/PerfilService";
import {useToken} from "@/app/hooks/TokenProvider";

interface EditPerfilFormProps {
    sessionAPIToken: string;
    idInstitucion: number;
    editingPerfil: PerfilDTO;
    onSave?: (perfilModified: PerfilDTO) => void;
    onCancel?: () => void;
}

function EditPerfilForm(props: Readonly<EditPerfilFormProps>): ReactElement {

    const {sessionAPIToken } = useToken();

    const {createModal} = useModal();

    const {
        register,
        handleSubmit,
        formState: {errors}
    }: UseFormReturn<PerfilDTO> = useForm<PerfilDTO>({
        resolver: zodResolver(SchemaPerfil),
        mode: 'all',
        defaultValues: {}
    });

    const onSubmit: SubmitHandler<PerfilDTO> = async (formValues: PerfilDTO): Promise<void> => {

        if(sessionAPIToken == null)return;

        const modifiedPerfil: PerfilDTO = {
            ...props.editingPerfil,
            nombre: formValues.nombre,
        };

        const changes: ChangeEntry[] = await obtenerCambios(
            modifiedPerfil,
            props.editingPerfil
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

        createModal({
            title: `Modificando perfil "${props.editingPerfil.nombre}"`,
            children: ModalChangesFC(changes),
            async onConfirm(): Promise<void> {
                const response: void | FetchAPIError = await modificarPerfil(modifiedPerfil, sessionAPIToken);

                if (isFetchAPIError(response)) {
                    createModal({
                        children: (
                            <p>Error al modificar el perfil: {response.errorMessage}</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                    console.error('ERROR - Modificar Perfil - form.tsx - handleSave - modificarPerfil', response);
                    return;
                }

                createModal({
                    children: (
                        <p>Perfil con nombre: &quot;{props.editingPerfil.nombre}&quot; modificado correctamente</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();

                if (props.onSave) {
                    props.onSave(modifiedPerfil);
                }
            },
            onCancel(): void {
                createModal({
                    children: (
                        <p>Modificación cancelada</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();
            }
        }).show();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`${styles.formContainer} ${styles.aparecer}`}>
            <h2>Modificación de Perfil</h2>
            <div className={styles.detailsContainer}>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Nombre<span className={styles.requiredField}>*</span></label>
                    <input
                        {...register("nombre", {required: "Este campo es requerido"})}
                        type="text"
                        placeholder="Nombre del Perfil"
                        className="nombre"
                        defaultValue={props.editingPerfil.nombre}
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

export default EditPerfilForm;

async function obtenerCambios(editingPerfil: PerfilDTO, originalData: PerfilDTO): Promise<ChangeEntry[]> {

    const changes: ChangeEntry[] = [];

    if (originalData.nombre !== editingPerfil.nombre) {
        changes.push({
            field: "Nombre",
            previousValue: originalData.nombre,
            nextValue: editingPerfil.nombre
        });
    }

    return changes;
}
