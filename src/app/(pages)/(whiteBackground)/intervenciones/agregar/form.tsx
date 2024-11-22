'use client'
import React, {useEffect, useState} from "react";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {agregarIntervencion} from "@/services/IntervencionService";
import {buscarPorNumSerie, listarEquipos} from "@/services/EquiposService";
import {listarTiposIntervencion} from "@/services/TipoIntervencionService";
import {useModal} from "@/app/hooks/modals/useModal";
import {ModalButtonsType} from "@/components/ModalFC";
import styles from "@public/styles/modules/register.tiposequipo.module.css";
import LoadingPage from "@/app/(pages)/loading";
import ComboBoxFC from "@/components/ComboBoxFC";
import {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {useToken} from "@/app/hooks/TokenProvider";
import {zodResolver} from "@hookform/resolvers/zod";
import SchemaIntervencion from "@/validations/SchemaIntervencion";
import IntervencionDTO from "@/types/dtos/IntervencionDTO";

interface FormValues extends IntervencionDTO{
    numSerieEquipo: string
}

interface RegisterIntervencionFormProps {
    sessionAPIToken: string;
    clientData: { id: number };
}

const RegisterIntervencionForm: React.FC<RegisterIntervencionFormProps> = (props: RegisterIntervencionFormProps) => {

    const {sessionAPIToken } = useToken();

    const { createModal } = useModal();
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset } : UseFormReturn<FormValues> = useForm<FormValues>({
            resolver: zodResolver(SchemaIntervencion),
            mode: 'all'
        }
    );

    const [tiposIntervencion, setTiposIntervencion] = useState<any[]>([]);
    const [selectedTipoIntervencionId, setSelectedTipoIntervencionId] = useState<number | undefined>(undefined);
    const [loaded, setLoaded] = useState<boolean>(false);

    useEffect(() => {

        if(sessionAPIToken==null) return;

        (async (): Promise<void> => {

            const tiposResponse = await listarTiposIntervencion(sessionAPIToken);
            if (isFetchAPIError(tiposResponse)) {
                createModal({
                    children: <div>Error al cargar los tipos de intervención: {tiposResponse.errorMessage}</div>,
                    buttonsType: ModalButtonsType.CONFIRM,
                }).show();
                return;
            }
            setTiposIntervencion(tiposResponse);

            setLoaded(true);
        })();
    }, [sessionAPIToken, createModal]);

    const onSubmit: SubmitHandler<FormValues> = async (formValues: FormValues) => {

        if(sessionAPIToken==null)return;

        if (!selectedTipoIntervencionId) {
            createModal({
                children: (
                    <div>
                        <h2>Error</h2>
                        <p>Debe seleccionar un tipo de intervención</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM,
            }).show();
            return;
        }

        const equipo = await buscarPorNumSerie(formValues.numSerieEquipo, sessionAPIToken);
        if (isFetchAPIError(equipo)) {
            createModal({
                children: (
                    <div>
                        <h2>Error al buscar el equipo</h2>
                        <p>{equipo.errorMessage}</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM,
            }).show();
            return;
        } else if(equipo == null || equipo.id == null){
            createModal({
                children: (
                    <div>
                        <h2>Error al buscar el equipo</h2>
                        <p>No se encontró un equipo con el número de serie ingresado</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM,
            }).show();
        }else {

            const nuevaIntervencion = {
                fechaHora: formValues.fechaHora,
                motivo: formValues.motivo,
                comentarios: formValues.comentarios,
                idEquipo: equipo.id,
                idTipoIntervencion: selectedTipoIntervencionId,
                idUsuario: props.clientData.id
            };

            const response = await agregarIntervencion(nuevaIntervencion, sessionAPIToken);

            if (isFetchAPIError(response)) {
                createModal({
                    children: (
                        <div>
                            <h2>Error al registrar la intervención</h2>
                            <p>{response.errorMessage}</p>
                        </div>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM,
                }).show();
                return;
            }

            createModal({
                children: <div><h2>Intervención registrada correctamente</h2></div>,
                buttonsType: ModalButtonsType.CONFIRM,
            }).show();

            reset();
        }
    };

    if (!loaded) return <LoadingPage />


    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.equipoForm}>
            <h2>Registro de Intervención</h2>
            <div className={styles.userDetailsRe}>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Fecha y Hora <span className={styles.requiredField}>*</span></span>
                        <input
                            {...register("fechaHora", { required: "Este campo es requerido" })}
                            type="datetime-local"
                        />
                    </label>
                    {errors.fechaHora && <label className={styles.error}>{errors.fechaHora.message}</label>}
                </div>

                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Motivo <span className={styles.requiredField}>*</span></span>
                        <input
                            {...register("motivo", { required: "Este campo es requerido" })}
                            type="text"
                            placeholder="Motivo de la Intervención"
                        />
                    </label>
                    {errors.motivo && <label className={styles.error}>{errors.motivo.message}</label>}
                </div>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Tipo de Intervención <span className={styles.requiredField}>*</span></span>
                        <ComboBoxFC
                            message="Seleccione un tipo de intervención"
                            register={register("idTipoIntervencion")}
                            elements={tiposIntervencion.map(tipo => ({
                                key: tipo.id,
                                value: tipo.nombre
                            }))}
                            selectedKey={selectedTipoIntervencionId}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTipoIntervencionId(parseInt(e.target.value))}
                        />
                    </label>
                    {errors.idTipoIntervencion &&
                        <label className={styles.error} style={{color: 'red'}}>{errors.idTipoIntervencion.message}</label>}
                </div>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Número de serie del equipo <span className={styles.requiredField}>*</span></span>
                        <input
                            {...register("numSerieEquipo", { required: "Este campo es requerido" })}
                            type="text"
                            placeholder="Número de serie del equipo"
                        />
                    </label>
                    {errors.numSerieEquipo && <label className={styles.error}>{errors.numSerieEquipo.message}</label>}
                </div>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Comentarios</span>
                        <textarea {...register("comentarios")} placeholder="Comentarios adicionales" />
                        {errors.comentarios && <label className={styles.error}>{errors.comentarios.message}</label>}
                    </label>
                </div>
                <div className={styles.buttomAe}>
                    <button type="submit">Agregar</button>
                </div>
            </div>
        </form>
    );
};

export default RegisterIntervencionForm;
