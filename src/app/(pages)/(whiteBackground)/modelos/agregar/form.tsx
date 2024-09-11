'use client';

import React from "react";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import ModeloDTO from "@/types/dtos/ModeloDTO"; // Importar el DTO del modelo
import {useModal} from "@/app/hooks/modals/useModal";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import styles from "@public/styles/modules/register.tiposequipo.module.css"; // Cambiar el archivo CSS si es necesario
import SchemaModelo from "@/validations/SchemaModelo"; // Importar el esquema de validación para modelos
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {agregarModelo} from "@/services/ModeloService"; // Importar el servicio de modelo
import {ModalButtonsType} from "@/components/ModalFC";

interface RegisterModeloFormProps {
    sessionAPIToken: string;
    clientData: UsuarioDTO;
}

interface FormValues extends ModeloDTO {}

const RegisterModeloForm: React.FC<RegisterModeloFormProps> = (props: RegisterModeloFormProps) => {
    const {createModal} = useModal();

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset
    }: UseFormReturn<FormValues> = useForm<FormValues>({
        resolver: zodResolver(SchemaModelo),
        mode: 'all',
        defaultValues: {}
    });

    const onSubmit: SubmitHandler<FormValues> = async (formValues: FormValues): Promise<void> => {
        const nuevoModel: ModeloDTO = {
            nombre: formValues.nombre,
            activo: formValues.activo,
            idMarca: formValues.idMarca // Cambiar idInstitucion por idMarca
        };

        const response: ModeloDTO | FetchAPIError = await agregarModelo(nuevoModel, props.sessionAPIToken);

        if (isFetchAPIError(response)) {
            console.error('ERROR - Registro de modelo - agregarModelo:', response);
            createModal({
                children: (
                    <div>
                        <h2>Error al registrar el modelo</h2>
                        <p>{response.errorMessage}</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        createModal({
            children: (
                <div>
                    <h2>Modelo registrado correctamente</h2>
                </div>
            ),
            buttonsType: ModalButtonsType.CONFIRM
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
                            {...register("nombre", {required: "Este campo es requerido"})}
                            type="text"
                            placeholder="Nombre del Modelo"
                        />
                    </label>
                    {errors.nombre && <label className={styles.error}>{errors.nombre.message}</label>}
                </div>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>ID Marca <span className={styles.requiredField}>*</span></span>
                        <input
                            {...register("idMarca", {required: "Este campo es requerido"})}
                            type="number"
                            placeholder="ID de la Marca"
                        />
                    </label>
                    {errors.idMarca && <label className={styles.error}>{errors.idMarca.message}</label>}
                </div>
                <div className={styles.buttomAe}>
                    <button type="submit">Agregar</button>
                </div>
            </div>
        </form>
    );
};

export default RegisterModeloForm;
