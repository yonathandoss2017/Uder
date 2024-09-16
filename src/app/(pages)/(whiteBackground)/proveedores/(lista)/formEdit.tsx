import React, {ChangeEvent, ReactElement} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import SchemaProveedor from "@/validations/SchemaProveedor";
import styles from "@public/styles/modules/table/table.editformequipo.module.css";
import ProveedorDTO from "@/types/dtos/ProveedorDTO";
import ChangeEntry from "@/types/ChangeEntry";
import {ModalButtonsType} from "@/components/ModalFC";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import ModalChangesFC from "@/components/ModalChangesFC";
import {modificarProveedor} from "@/services/ProveedorService";

interface EditProveedorFormProps {
    sessionAPIToken: string;
    idInstitucion: number;
    editingProveedor: ProveedorDTO;
    onSave?: (proveedorModified: ProveedorDTO) => void;
    onCancel?: () => void;
}

function EditProveedorForm(props: Readonly<EditProveedorFormProps>): ReactElement {

    const {createModal} = useModal();

    const {
        register,
        handleSubmit,
        formState: {errors}
    }:  UseFormReturn<ProveedorDTO> = useForm<ProveedorDTO>({
        resolver: zodResolver(SchemaProveedor),
        mode: 'all',
        defaultValues: {}
    });

    const onSubmit: SubmitHandler<ProveedorDTO> = async (formValues: ProveedorDTO): Promise<void> => {

        const modifiedProveedor: ProveedorDTO = {
            ...props.editingProveedor,
            nombre: formValues.nombre
        };

        const changes: ChangeEntry[] = await obtenerCambios(
            modifiedProveedor,
            props.editingProveedor
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
            title: `Modificando proveedor "${props.editingProveedor.nombre}"`,
            children: ModalChangesFC(changes),
            async onConfirm(): Promise<void> {
                const response: void | FetchAPIError = await modificarProveedor(modifiedProveedor, props.sessionAPIToken);

                if (isFetchAPIError(response)) {
                    createModal({
                        children: (
                            <p>Error al modificar el proveedor: {response.errorMessage}</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                    console.error('ERROR - Modificar Proveedor - form.tsx - handleSave - modificarProveedor', response);
                    return;
                }

                createModal({
                    children: (
                        <p>Proveedor con nombre: &quot;{props.editingProveedor.nombre}&quot; modificado correctamente</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();

                if (props.onSave) {
                    props.onSave(modifiedProveedor);
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
            <h2>Modificación de Proveedor</h2>
            <div className={styles.detailsContainer}>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Nombre<span className={styles.requiredField}>*</span></label>
                    <input
                        {...register("nombre", {required: "Este campo es requerido"})}
                        type="text"
                        placeholder="Nombre del Proveedor"
                        className="nombre"
                        defaultValue={props.editingProveedor.nombre}
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

export default EditProveedorForm;

async function obtenerCambios(editingProveedor: ProveedorDTO, originalData: ProveedorDTO): Promise<ChangeEntry[]> {

    const changes: ChangeEntry[] = [];

    if (originalData.nombre !== editingProveedor.nombre) {
        changes.push({
            field: "Nombre",
            previousValue: originalData.nombre,
            nextValue: editingProveedor.nombre
        });
    }

    return changes;
}
