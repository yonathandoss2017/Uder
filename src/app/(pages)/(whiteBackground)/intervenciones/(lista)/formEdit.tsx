import IntervencionDTO from "@/types/dtos/IntervencionDTO";
import React, { ReactElement, useEffect, useState } from "react";
import { useModal } from "@/app/hooks/modals/useModal";
import { SubmitHandler, useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SchemaIntervencion from "@/validations/SchemaIntervencion";
import ChangeEntry from "@/types/ChangeEntry";
import { ModalButtonsType } from "@/components/ModalFC";
import ModalChangesFC from "@/components/ModalChangesFC";
import FetchAPIError, { isFetchAPIError } from "@/types/errors/FetchAPIError";
import { modificarIntervencion } from "@/services/IntervencionService";
import { listarTiposIntervencion } from "@/services/TipoIntervencionService";
import ComboBoxFC from "@/components/ComboBoxFC";
import styles from "@public/styles/modules/table/table.editformequipo.module.css";
import {useToken} from "@/app/hooks/TokenProvider";
import TipoIntervencionDTO from "@/types/dtos/TipoIntervencionDTO";

interface EditIntervencionFormProps {
    sessionAPIToken: string;
    editingIntervencion: IntervencionDTO;
    onSave?: (intervencionModified: IntervencionDTO) => void;
    onCancel?: () => void;
}

interface FormValues extends IntervencionDTO{}

function TrabajarIntervencionForm(props: Readonly<EditIntervencionFormProps>): ReactElement {

    const {sessionAPIToken } = useToken();

    const { createModal } = useModal();
    const [tiposIntervencion, setTiposIntervencion]: [TipoIntervencionDTO[], (value: TipoIntervencionDTO[]) => void] = useState<any[]>([]);

    //Seleccionados
    const [idTipoIntervencionSelected, setIdTipoIntervencionSelected]: [number, (value: number) => void] = useState<number>(props.editingIntervencion.idTipoIntervencion);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    }: UseFormReturn<IntervencionDTO> = useForm<IntervencionDTO>({
        resolver: zodResolver(SchemaIntervencion),
        mode: "all",
        defaultValues: {...props.editingIntervencion}
    });

    console.log("Form errors:", errors);

    useEffect(() => {

        if(sessionAPIToken == null) return;

        (async (): Promise<void> => {
         await listarTiposIntervencion(sessionAPIToken).then((response) => {
            if (isFetchAPIError(response)) {
                createModal({
                    children: <div>Error al cargar los tipos de intervención: {response.errorMessage}</div>,
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();
                return;
            }
            setTiposIntervencion(response);
        });
        })();
    }, [props.sessionAPIToken, sessionAPIToken]);

    const onSubmit: SubmitHandler<FormValues> = async (formValues: FormValues): Promise<void> => {

        console.log("Voy a submitear en formEdit")

        if(sessionAPIToken == null) return;

        const modifiedIntervencion: IntervencionDTO = {
            ...props.editingIntervencion,
            fechaHora: formValues.fechaHora,
            motivo: formValues.motivo,
            comentarios: formValues.comentarios,
            idTipoIntervencion: formValues.idTipoIntervencion,
            idEquipo: props.editingIntervencion.idEquipo
        };

        if (!modifiedIntervencion.id) {
            createModal({
                children: <p>Error: Falta el ID de la intervención</p>,
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        const changes: ChangeEntry[] = await obtenerCambios(
            modifiedIntervencion,
            props.editingIntervencion,
            tiposIntervencion
        );

        if (changes.length === 0) {
            createModal({
                children: <p>No se realizaron cambios</p>,
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        createModal({
            title: `Trabajando intervención`,
            children: ModalChangesFC(changes),
            buttonsType: ModalButtonsType.CONFIRM_CANCEL,
            async onConfirm(): Promise<void> {

                console.log("Voy a modificar la intervencion", modifiedIntervencion)

                const response: void | FetchAPIError = await modificarIntervencion(modifiedIntervencion, sessionAPIToken);

                if (isFetchAPIError(response)) {
                    createModal({
                        children: <p>Error al trabajar intervención: {response.errorMessage}</p>,
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                    return;
                }

                createModal({
                    children: <p>Intervención trabajada correctamente</p>,
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();

                if (props.onSave) {
                    props.onSave(modifiedIntervencion);
                }
            },
            onCancel(): void {
                createModal({
                    children: <p>Trabajo cancelado</p>,
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();
            }
        }).show();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`${styles.formContainer} ${styles.aparecer}`}>
            <h2>Trabajo de Intervención</h2>
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
                    {errors.comentarios &&
                        <label className={styles.error} style={{color: 'red'}}>{errors.comentarios.message}</label>}                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Tipo de Intervención<span className={styles.requiredField}>*</span>
                    <ComboBoxFC
                        register={register("idTipoIntervencion")}
                        selectedKey={props.editingIntervencion.idTipoIntervencion}
                        elements={tiposIntervencion.map((tipo: TipoIntervencionDTO):{key:number, value:string} => ({
                            key: tipo.id as number,
                            value: tipo.nombre
                        }))}
                        message={"Seleccione un tipo de intervención"} /> </label>
                    {errors.idTipoIntervencion &&
                        <label className={styles.error} style={{color: 'red'}}>{errors.idTipoIntervencion.message}</label>}
                </div>
            </div>
            <div className={styles.buttomM}>
                <button type="submit">Guardar</button>
                <button type="button" onClick={props.onCancel}>Cancelar</button>
            </div>
        </form>
    );
}

export default TrabajarIntervencionForm;

async function obtenerCambios(editingIntervencion: IntervencionDTO, originalData: IntervencionDTO, tiposIntervencion: TipoIntervencionDTO[]): Promise<ChangeEntry[]> {

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
            previousValue: originalData.comentarios,
            nextValue: editingIntervencion.comentarios
        });
    }
    if (originalData.idTipoIntervencion != editingIntervencion.idTipoIntervencion) {
       let previosTipoIntervencion: string|undefined = undefined;
       let nextTipoIntervencion: string|undefined = undefined;

         if (originalData.idTipoIntervencion) {
              previosTipoIntervencion = tiposIntervencion.find((tipo: TipoIntervencionDTO) => tipo.id === originalData.idTipoIntervencion)?.nombre;
         }

            if (editingIntervencion.idTipoIntervencion) {
                const idTipoIntervencion = Number(editingIntervencion.idTipoIntervencion);
                nextTipoIntervencion = tiposIntervencion.find((tipo: TipoIntervencionDTO) => tipo.id === idTipoIntervencion)?.nombre;
            }

        changes.push({
                field: "Tipo de Intervención",
                previousValue: previosTipoIntervencion,
                nextValue: nextTipoIntervencion
            });

    }

    return changes;
}
