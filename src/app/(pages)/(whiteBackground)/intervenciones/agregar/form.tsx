'use client'
import React, {useEffect, useState} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {agregarIntervencion} from "@/services/IntervencionService";
import {listarEquipos} from "@/services/EquiposService";
import {listarTiposIntervencion} from "@/services/TipoIntervencionService";
import {useModal} from "@/app/hooks/modals/useModal";
import {ModalButtonsType} from "@/components/ModalFC";
import styles from "@public/styles/modules/register.tiposequipo.module.css";
import LoadingPage from "@/app/(pages)/loading";
import ComboBoxFC from "@/components/ComboBoxFC";
import {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {useToken} from "@/app/hooks/TokenProvider";
import EquipoFieldSortEnum from "@/types/enums/EquipoFieldSortEnum";

interface FormValues {
    fechaHora: string;
    motivo: string;
    comentarios?: string;
}

interface RegisterIntervencionFormProps {
    sessionAPIToken: string;
    clientData: { id: number };
}

const RegisterIntervencionForm: React.FC<RegisterIntervencionFormProps> = (props: RegisterIntervencionFormProps) => {

    const {sessionAPIToken } = useToken();

    const { createModal } = useModal();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();

    const [equipos, setEquipos] = useState<any[]>([]);
    const [selectedEquipoId, setSelectedEquipoId] = useState<number | undefined>(undefined);
    const [selectedEquipoName, setSelectedEquipoName] = useState<string | undefined>(undefined);
    const [tiposIntervencion, setTiposIntervencion] = useState<any[]>([]);
    const [selectedTipoIntervencionId, setSelectedTipoIntervencionId] = useState<number | undefined>(undefined);
    const [loaded, setLoaded] = useState<boolean>(false);

    // Paginación
    const [paginaActual, setPaginaActual] = useState<number>(1);
    const equiposPorPagina = 5;

    useEffect(() => {

        if(sessionAPIToken==null) return;

        (async (): Promise<void> => {
            const equiposResponse = await listarEquipos(sessionAPIToken, equiposPorPagina, 1,EquipoFieldSortEnum.NOMBRE, true, {activo: true});
            if (isFetchAPIError(equiposResponse)) {
                createModal({
                    children: <div>Error al cargar los equipos: {equiposResponse.errorMessage}</div>,
                    buttonsType: ModalButtonsType.CONFIRM,
                }).show();
                return;
            }
            setEquipos(equiposResponse);

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

        if (!selectedEquipoId || !selectedTipoIntervencionId) {
            createModal({
                children: (
                    <div>
                        <h2>Error</h2>
                        <p>Debe seleccionar un equipo</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM,
            }).show();
            return;
        }

        const nuevaIntervencion = {
            fechaHora: formValues.fechaHora,
            motivo: formValues.motivo,
            comentarios: formValues.comentarios,
            idEquipo: selectedEquipoId,
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
    };

    if (!loaded) return <LoadingPage />

    // Función para abrir el modal y seleccionar un equipo
    const openEquipoModal = () => {
        const modalInstance = createModal({
            children: (
                <div>
                    <h2>Seleccionar Equipo</h2>
                    <ul>
                        {equipos.slice((paginaActual - 1) * equiposPorPagina, paginaActual * equiposPorPagina).map(equipo => (
                            <li key={equipo.id} onClick={() => handleSelectEquipo(equipo, modalInstance)}>
                                {equipo.nombre}
                            </li>
                        ))}
                    </ul>
                    <div>
                        <button onClick={handleAnterior} disabled={paginaActual === 1}>
                            Anterior
                        </button>
                        <button onClick={handleSiguiente} disabled={paginaActual * equiposPorPagina >= equipos.length}>
                            Siguiente
                        </button>
                    </div>
                </div>
            ),
            buttonsType: ModalButtonsType.NONE // Sin botones adicionales, solo la lista de equipos
        });
        modalInstance.show(); // Mostrar el modal
    };
    const handleSelectEquipo = (equipo: any, modalInstance: any) => {
        setSelectedEquipoId(equipo.id);
        setSelectedEquipoName(equipo.nombre); // Mostrar el nombre del equipo seleccionado
        modalInstance.close(); // Cerrar el modal una vez seleccionado el equipo
    };

    // Navegación entre páginas
    const handleSiguiente = () => {
        if (paginaActual * equiposPorPagina < equipos.length) {
            setPaginaActual(prevPage => prevPage + 1);
        }
    };

    const handleAnterior = () => {
        if (paginaActual > 1) {
            setPaginaActual(prevPage => prevPage - 1);
        }
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
                        <button type="button" onClick={openEquipoModal}>
                            {selectedEquipoName ? `Equipo: ${selectedEquipoName}` : "Seleccionar equipo"}
                        </button>
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
