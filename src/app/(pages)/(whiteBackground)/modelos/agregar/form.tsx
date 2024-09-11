'use client';

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import ModeloDTO from "@/types/dtos/ModeloDTO";
import MarcaDTO from "@/types/dtos/MarcaDTO";
import { listarMarcas } from "@/services/MarcaService"; // Servicio para listar marcas
import FetchAPIError, { isFetchAPIError } from "@/types/errors/FetchAPIError";
import { agregarModelo } from "@/services/ModeloService";
import { useModal } from "@/app/hooks/modals/useModal";
import { ModalButtonsType } from "@/components/ModalFC";
import SchemaModelo from "@/validations/SchemaModelo"; // Validación del formulario
import styles from "@public/styles/modules/register.tiposequipo.module.css";
import ComboBoxFC from "@/components/ComboBoxFC";

interface RegisterModeloFormProps {
    sessionAPIToken: string;
    clientData: UsuarioDTO;
}

interface FormValues extends ModeloDTO {}

const RegisterModeloForm: React.FC<RegisterModeloFormProps> = (props: RegisterModeloFormProps) => {
    const { createModal } = useModal();
    const [marcas, setMarcas]: [MarcaDTO[], (value: MarcaDTO[]) => void] = useState<MarcaDTO[]>([]);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    }: UseFormReturn<FormValues> = useForm<FormValues>({
        resolver: zodResolver(SchemaModelo),
        mode: "all",
        defaultValues: {},
    });

    const [selectedMarcaId, setSelectedMarcaId]: [number | undefined, (value: number | undefined) => void] = useState<number | undefined>(undefined);
    // Cargar las marcas al montar el componente
    useEffect(() => {
        (async (): Promise<void> => {

            // ------------------- Cargar marcas -------------------

            setMarcas(await listarMarcas(props.sessionAPIToken).then((response: MarcaDTO[] | FetchAPIError): MarcaDTO[] => {
                if (isFetchAPIError(response)) return [];
                return response;
            }));
        })();
    }, [props.sessionAPIToken]);

    const onSubmit: SubmitHandler<FormValues> = async (formValues: FormValues): Promise<void> => {
        const nuevoModel: ModeloDTO = {
            nombre: formValues.nombre,
            activo: formValues.activo,
            idMarca: formValues.idMarca,
        };

        const response: ModeloDTO | FetchAPIError = await agregarModelo(nuevoModel, props.sessionAPIToken);

        if (isFetchAPIError(response)) {
            console.error("ERROR - Registro de modelo - agregarModelo:", response);
            createModal({
                children: (
                    <div>
                        <h2>Error al registrar el modelo</h2>
                        <p>{response.errorMessage}</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM,
            }).show();
            return;
        }

        createModal({
            children: <div> <h2>Modelo registrado correctamente</h2> </div>,
            buttonsType: ModalButtonsType.CONFIRM,
        }).show();

        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.equipoForm}>
            <div className={styles.userDetailsRe}>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Nombre <span className={styles.requiredField}>*</span></span>
                        <input
                            {...register("nombre", { required: "Este campo es requerido" })}
                            type="text"
                            placeholder="Nombre del Modelo"
                        />
                    </label>
                    {errors.nombre && <label className={styles.error}>{errors.nombre.message}</label>}
                </div>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Marca <span className={styles.requiredField}>*</span></span>

                        <ComboBoxFC
                            message={"Seleccione una marca"}
                            elements={marcas.map((marca: MarcaDTO): { key: number, value: string } => ({
                                key: marca.id as number,
                                value: marca.nombre
                            }))}
                            selectedKey={selectedMarcaId}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMarcaId(parseInt(e.target.value))}
                        />
                    </label>

                </div>
                <div className={styles.buttomAe}>
                    <button type="submit">Agregar</button>
                </div>
            </div>
        </form>
    );
};

export default RegisterModeloForm;
