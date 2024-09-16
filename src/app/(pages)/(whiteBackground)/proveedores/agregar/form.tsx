'use client';

import React from "react";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import ProveedorDTO from "@/types/dtos/ProveedorDTO";
import {useModal} from "@/app/hooks/modals/useModal";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import styles from "@public/styles/modules/register.tiposequipo.module.css"; // Cambiar el archivo CSS para usar el mismo
import SchemaProveedor from "@/validations/SchemaProveedor";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {agregarProveedor} from "@/services/ProveedorService";
import {ModalButtonsType} from "@/components/ModalFC";

interface RegisterProveedorFormProps {
    sessionAPIToken: string;
    clientData: UsuarioDTO;
}

interface FormValues extends ProveedorDTO {}

const RegisterProveedorForm: React.FC<RegisterProveedorFormProps> = (props: RegisterProveedorFormProps) => {
    const {createModal} = useModal();

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset
    }: UseFormReturn<FormValues> = useForm<FormValues>({
        resolver: zodResolver(SchemaProveedor),
        mode: 'all',
        defaultValues: {}
    });

    const onSubmit: SubmitHandler<FormValues> = async (formValues: FormValues): Promise<void> => {
        const nuevoProveedor: ProveedorDTO = {
            nombre: formValues.nombre,
            activo: true,
            idInstitucion: props.clientData.idInstitucion
        };

        const response: ProveedorDTO | FetchAPIError = await agregarProveedor(nuevoProveedor, props.sessionAPIToken);

        if (isFetchAPIError(response)) {
            console.error('ERROR - Registro de proveedor - agregarProveedor:', response);
            createModal({
                children: (
                    <div>
                        <h2>Error al registrar el proveedor</h2>
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
                    <h2>Proveedor registrado correctamente</h2>
                </div>
            ),
            buttonsType: ModalButtonsType.CONFIRM
        }).show();

        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.equipoForm}>
            <h2>Registro de Proveedor</h2>
            <div className={styles.userDetailsRe}>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Nombre <span className={styles.requiredField}>*</span></span>
                        <input
                            {...register("nombre", {required: "Este campo es requerido"})}
                            type="text"
                            placeholder="Nombre del Proveedor"
                        />
                    </label>
                    {errors.nombre && <label className={styles.error}>{errors.nombre.message}</label>}
                </div>
                <div className={styles.buttomAe}>
                    <button type="submit">Agregar</button>
                </div>
            </div>
        </form>
    );
};

export default RegisterProveedorForm;
