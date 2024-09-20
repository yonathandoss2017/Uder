import IntervencionDTO from "@/types/dtos/IntervencionDTO";
import React, { ReactElement, useEffect, useState } from "react";
import { useModal } from "@/app/hooks/modals/useModal";
import { SubmitHandler, useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SchemaIntervencion from "@/validations/SchemaIntervencion"; // Asumiendo que existe un esquema de validación
import ChangeEntry from "@/types/ChangeEntry";
import { ModalButtonsType } from "@/components/ModalFC";
import ModalChangesFC from "@/components/ModalChangesFC";
import FetchAPIError, { isFetchAPIError } from "@/types/errors/FetchAPIError";
import { modificarIntervencion } from "@/services/IntervencionService";
import { listarEquipos } from "@/services/EquiposService";
import { listarTiposIntervencion } from "@/services/TipoIntervencionService";
import ComboBoxFC from "@/components/ComboBoxFC";
import styles from "@public/styles/modules/table/table.editformequipo.module.css";

interface EditIntervencionFormProps {
    sessionAPIToken: string;
    editingIntervencion: IntervencionDTO;
    onSave?: (intervencionModified: IntervencionDTO) => void;
    onCancel?: () => void;
}

function EditIntervencionForm(props: Readonly<EditIntervencionFormProps>): ReactElement {
    const { createModal } = useModal();

    // Estados para los equipos y tipos de intervención
    const [equipos, setEquipos] = useState<any[]>([]);
    const [tiposIntervencion, setTiposIntervencion] = useState<any[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors }
    }: UseFormReturn<IntervencionDTO> = useForm<IntervencionDTO>({
        resolver: zodResolver(SchemaIntervencion), // Asumiendo que existe un esquema de validación
        mode: "all",
        defaultValues: {}
    });

    // Cargar equipos y tipos de intervención al montar el componente
    useEffect(() => {
        listarEquipos(props.sessionAPIToken).then((response) => {
            if (isFetchAPIError(response)) {
                createModal({
                    children: <div>Error al cargar los equipos: {response.errorMessage}</div>,
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();
                return;
            }
            setEquipos(response);
        });

        listarTiposIntervencion(props.sessionAPIToken).then((response) => {
            if (isFetchAPIError(response)) {
                createModal({
                    children: <div>Error al cargar los tipos de intervención: {response.errorMessage}</div>,
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();
                return;
            }
            setTiposIntervencion(response);
        });
    }, [props.sessionAPIToken, createModal]);

    // Función para manejar el envío del formulario
    const onSubmit: SubmitHandler<IntervencionDTO> = async (formValues: IntervencionDTO): Promise<void> => {
        const modifiedIntervencion: IntervencionDTO = {
            ...props.editingIntervencion,
            ...formValues
        };

        const changes: ChangeEntry[] = await obtenerCambios(modifiedIntervencion, props.editingIntervencion);

        if (changes.length === 0) {
            createModal({
                children: <p>No se realizaron cambios</p>,
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        createModal({
            title: `Modificando intervención`,
            children: ModalChangesFC(changes),
            async onConfirm(): Promise<void> {
                const response: void | FetchAPIError = await modificarIntervencion(modifiedIntervencion, props.sessionAPIToken);

                if (isFetchAPIError(response)) {
                    createModal({
                        children: <p>Error al modificar intervención: {response.errorMessage}</p>,
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                    return;
                }

                createModal({
                    children: <p>Intervención modificada correctamente</p>,
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();

                if (props.onSave) {
                    props.onSave(modifiedIntervencion);
                }
            },
            onCancel(): void {
                createModal({
                    children: <p>Modificación cancelada</p>,
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();
            }
        }).show();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`${styles.formContainer} ${styles.aparecer}`}>
            <h2>Modificación de Intervención</h2>

            <div className={styles.detailsContainer}>
                <div className={styles.inputBox}>
                    <label className={styles.details}>
                        Fecha y Hora<span className={styles.requiredField}>*</span>
                    </label>
                    <input
                        {...register("fechaHora", { required: "Este campo es requerido" })}
                        type="datetime-local"
                        defaultValue={props.editingIntervencion.fechaHora}
                    />
                    {errors.fechaHora && <label className={styles.error}>{errors.fechaHora.message}</label>}
                </div>

                <div className={styles.inputBox}>
                    <label className={styles.details}>
                        Motivo<span className={styles.requiredField}>*</span>
                    </label>
                    <input
                        {...register("motivo", { required: "Este campo es requerido" })}
                        type="text"
                        defaultValue={props.editingIntervencion.motivo}
                    />
                    {errors.motivo && <label className={styles.error}>{errors.motivo.message}</label>}
                </div>

                <div className={styles.inputBox}>
                    <label className={styles.details}>Comentarios</label>
                    <textarea {...register("comentarios")} defaultValue={props.editingIntervencion.comentarios || ""} />
                </div>

                <div className={styles.inputBox}>
                    <label className={styles.details}>Equipo<span className={styles.requiredField}>*</span></label>
                    <ComboBoxFC
                        message="Seleccione un equipo"
                        elements={equipos.map((equipo) => ({
                            key: equipo.id,
                            value: equipo.nombre
                        }))}
                        selectedKey={props.editingIntervencion.idEquipo}
                        onChange={(e) => (props.editingIntervencion.idEquipo = parseInt(e.target.value))}
                    />
                </div>

                <div className={styles.inputBox}>
                    <label className={styles.details}>Tipo de Intervención<span className={styles.requiredField}>*</span></label>
                    <ComboBoxFC
                        message="Seleccione un tipo de intervención"
                        elements={tiposIntervencion.map((tipo) => ({
                            key: tipo.id,
                            value: tipo.nombre
                        }))}
                        selectedKey={props.editingIntervencion.idTipoIntervencion}
                        onChange={(e) => (props.editingIntervencion.idTipoIntervencion = parseInt(e.target.value))}
                    />
                </div>
            </div>

            <div className={styles.buttomM}>
                <button type="submit">Guardar</button>
                <button type="button" onClick={props.onCancel}>Cancelar</button>
            </div>
        </form>
    );
}

export default EditIntervencionForm;

async function obtenerCambios(editingIntervencion: IntervencionDTO, originalData: IntervencionDTO): Promise<ChangeEntry[]> {
    const changes: ChangeEntry[] = [];

    if (originalData.fechaHora !== editingIntervencion.fechaHora) {
        changes.push({
            field: "Fecha y Hora",
            previousValue: originalData.fechaHora,
            nextValue: editingIntervencion.fechaHora
        });
    }
    if (originalData.motivo !== editingIntervencion.motivo) {
        changes.push({
            field: "Motivo",
            previousValue: originalData.motivo,
            nextValue: editingIntervencion.motivo
        });
    }
    if (originalData.comentarios !== editingIntervencion.comentarios) {
        changes.push({
            field: "Comentarios",
            previousValue: originalData.comentarios || "",
            nextValue: editingIntervencion.comentarios || ""
        });
    }
    if (originalData.idEquipo !== editingIntervencion.idEquipo) {
        changes.push({
            field: "Equipo",
            previousValue: originalData.idEquipo.toString(),
            nextValue: editingIntervencion.idEquipo.toString()
        });
    }
    if (originalData.idTipoIntervencion !== editingIntervencion.idTipoIntervencion) {
        changes.push({
            field: "Tipo de Intervención",
            previousValue: originalData.idTipoIntervencion.toString(),
            nextValue: editingIntervencion.idTipoIntervencion.toString()
        });
    }

    return changes;
}
