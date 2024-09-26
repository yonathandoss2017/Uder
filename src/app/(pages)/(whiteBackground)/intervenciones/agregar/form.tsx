'use client';

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { agregarIntervencion } from "@/services/IntervencionService"; // Importar la función de agregar intervención
import { listarEquipos } from "@/services/EquiposService"; // Importar la función para listar equipos
import { listarTiposIntervencion } from "@/services/TipoIntervencionService"; // Importar la función para listar tipos de intervención
import { useModal } from "@/app/hooks/modals/useModal";
import { ModalButtonsType } from "@/components/ModalFC";
import ComboBoxFC from "@/components/ComboBoxFC"; // Componente para listas desplegables
import FetchAPIError, { isFetchAPIError } from "@/types/errors/FetchAPIError"; // Asegúrate de importar esto
import styles from "@public/styles/modules/register.tiposequipo.module.css"; // Importar el CSS de modelo

interface FormValues {
    fechaHora: string;
    motivo: string;
    comentarios?: string;
}

interface RegisterIntervencionFormProps {
    sessionAPIToken: string; // Token de autenticación
    clientData: { id: number }; // Datos del usuario logueado
}

const RegisterIntervencionForm: React.FC<RegisterIntervencionFormProps> = ({ sessionAPIToken, clientData }) => {
    const { createModal } = useModal();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();

    // Estados para los equipos y tipos de intervención
    const [equipos, setEquipos] = useState<any[]>([]);
    const [selectedEquipoId, setSelectedEquipoId] = useState<number | undefined>(undefined);
    const [tiposIntervencion, setTiposIntervencion] = useState<any[]>([]);
    const [selectedTipoIntervencionId, setSelectedTipoIntervencionId] = useState<number | undefined>(undefined);

    // Cargar equipos y tipos de intervención al montar el componente
    useEffect(() => {
        // Cargar equipos
        listarEquipos(sessionAPIToken)
            .then((response) => {
                if (isFetchAPIError(response)) {
                    createModal({
                        children: <div>Error al cargar los equipos: {response.errorMessage}</div>,
                        buttonsType: ModalButtonsType.CONFIRM,
                    }).show();
                    return;
                }
                setEquipos(response);
            });

        // Cargar tipos de intervención
        listarTiposIntervencion(sessionAPIToken)
            .then((response) => {
                if (isFetchAPIError(response)) {
                    createModal({
                        children: <div>Error al cargar los tipos de intervención: {response.errorMessage}</div>,
                        buttonsType: ModalButtonsType.CONFIRM,
                    }).show();
                    return;
                }
                setTiposIntervencion(response);
            });
    }, [sessionAPIToken, createModal]);

    // Función de envío del formulario
    const onSubmit: SubmitHandler<FormValues> = async (formValues: FormValues) => {
        if (!selectedEquipoId || !selectedTipoIntervencionId) {
            createModal({
                children: (
                    <div>
                        <h2>Error</h2>
                        <p>Debe seleccionar un equipo y un tipo de intervención</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM,
            }).show();
            return;
        }

        // Crear el objeto con los datos de la intervención
        const nuevaIntervencion = {
            fechaHora: formValues.fechaHora,
            motivo: formValues.motivo,
            comentarios: formValues.comentarios,
            idEquipo: selectedEquipoId,
            idTipoIntervencion: selectedTipoIntervencionId,
            idUsuario: clientData.id // Añadir el ID del usuario logueado
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

        // Mostrar mensaje de éxito
        createModal({
            children: <div> <h2>Intervención registrada correctamente</h2> </div>,
            buttonsType: ModalButtonsType.CONFIRM,
        }).show();

        reset(); // Reinicia el formulario después del éxito
    };

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
                            elements={tiposIntervencion.map(tipo => ({
                                key: tipo.id,
                                value: tipo.nombre
                            }))}
                            selectedKey={selectedTipoIntervencionId}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTipoIntervencionId(parseInt(e.target.value))}
                        />
                    </label>
                </div>

                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Equipo <span className={styles.requiredField}>*</span></span>
                        <ComboBoxFC
                            message="Seleccione un equipo"
                            elements={equipos.map(equipo => ({
                                key: equipo.id,
                                value: equipo.nombre
                            }))}
                            selectedKey={selectedEquipoId}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedEquipoId(parseInt(e.target.value))}
                        />
                    </label>
                </div>

                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Comentarios</span>
                        <textarea {...register("comentarios")} placeholder="Comentarios adicionales" />
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
