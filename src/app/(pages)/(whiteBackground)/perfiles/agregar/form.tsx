'use client';

import React from "react";
import PerfilDTO from "@/types/dtos/PerfilDTO";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import {useModal} from "@/app/hooks/modals/useModal";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import styles from "@public/styles/modules/register.tiposequipo.module.css"; // Usamos el mismo archivo CSS que proveedores
import SchemaPerfil from "@/validations/SchemaPerfil";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {agregarPerfil} from "@/services/PerfilService";
import {ModalButtonsType} from "@/components/ModalFC";

interface RegisterPerfilFormProps {
    sessionAPIToken: string;
    clientData: UsuarioDTO;
}

interface FormValues extends PerfilDTO {}

const RegisterPerfilForm: React.FC<RegisterPerfilFormProps> = (props: RegisterPerfilFormProps) => {
    const {createModal} = useModal();

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset
    }: UseFormReturn<FormValues> = useForm<FormValues>({
        resolver: zodResolver(SchemaPerfil),
        mode: 'all',
        defaultValues: {}
    });

    const onSubmit: SubmitHandler<FormValues> = async (formValues: FormValues): Promise<void> => {
        const nuevoPerfil: PerfilDTO = {
            nombre: formValues.nombre,
            activo: formValues.activo ?? true,
            idFuncionalidades: formValues.idFuncionalidades,
            idInstitucion: props.clientData.idInstitucion,
            nivel: formValues.nivel
        };

        const response: PerfilDTO | FetchAPIError = await agregarPerfil(nuevoPerfil, props.sessionAPIToken);

        if (isFetchAPIError(response)) {
            console.error('ERROR - Registro de perfil - agregarPerfil:', response);
            createModal({
                children: (
                    <div>
                        <h2>Error al registrar el perfil</h2>
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
                    <h2>Perfil registrado correctamente</h2>
                </div>
            ),
            buttonsType: ModalButtonsType.CONFIRM
        }).show();

        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.equipoForm}>
            <h2>Registro de Perfil</h2>
            <div className={styles.userDetailsRe}>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Nombre <span className={styles.requiredField}>*</span></span>
                        <input
                            {...register("nombre", {required: "Este campo es requerido"})}
                            type="text"
                            placeholder="Nombre del Perfil"
                        />
                    </label>
                    {errors.nombre && <label className={styles.error}>{errors.nombre.message}</label>}
                </div>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Nivel <span className={styles.requiredField}>*</span></span>
                        <input
                            {...register("nivel", {required: "Este campo es requerido"})}
                            type="number"
                            placeholder="Nivel del Perfil"
                        />
                    </label>
                    {errors.nivel && <label className={styles.error}>{errors.nivel.message}</label>}
                </div>
                <div className={styles.buttomAe}>
                    <button type="submit">Agregar</button>
                </div>
            </div>
        </form>
    );
};

export default RegisterPerfilForm;
