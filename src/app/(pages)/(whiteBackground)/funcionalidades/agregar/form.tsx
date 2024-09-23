"use client"

import FuncionalidadDTO from "@/types/dtos/FuncionalidadDTO";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import {useModal} from "@/app/hooks/modals/useModal";
import {zodResolver} from "@hookform/resolvers/zod";
import SchemaFuncionalidad from "@/validations/SchemaFuncionalidad";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {ModalButtonsType} from "@/components/ModalFC";
import React from "react";
import styles from "@public/styles/modules/register.tiposequipo.module.css";
import {agregarFuncionalidad} from "@/services/FuncionalidadService";

/**
 * Propiedades del componente
 *
 * @property {string} sessionAPIToken Token de sesión del cliente en la API
 * @property {UsuarioDTO} clientData Datos del usuario cliente (Usuario que está editando)
 */
interface RegisterFuncionalidadFormProps {
    sessionAPIToken: string;
    clientData: UsuarioDTO;
}

interface FormValues extends FuncionalidadDTO{

}

/**
 * Formulario de registro de funcionalidades
 *
 * @param {RegisterFuncionalidadFormProps} props - Propiedades del componente
 */

const RegisterFuncionalidadForm : React.FC<RegisterFuncionalidadFormProps> = (props: RegisterFuncionalidadFormProps) => {

    // ----------------------- Modales -----------------------
    const {createModal} = useModal();

    // -------------------- Formulario de registro de funcionalidades --------------------

    // Obtenemos los métodos y propiedades necesarios del hook useForm para el formulario
    const {
        register,               // Método para registrar los inputs del formulario
        handleSubmit,           // Método para manejar el envío del formulario
        formState: {errors},     // Propiedad que contiene los errores del formulario
        reset                   // Método para resetear los valores del formulario
    }: UseFormReturn<FormValues> = useForm<FormValues>({ // Inicializamos useForm
        resolver: zodResolver(SchemaFuncionalidad),    // Usamos zodResolver para la validación del formulario con el esquema de Zod schemaFuncionalidad
        mode: 'all',                            // Configuramos el modo de validación a "all", lo que válida en cada cambio de valor y al salir del campo
        defaultValues: {}
    });

    // Función que se ejecuta al enviar el formulario
    const onSubmit: SubmitHandler<FormValues> = async (formValues: FormValues): Promise<void> => {

        const nuevaFuncionalidad: FuncionalidadDTO = {
            nombre: formValues.nombre,
            idInstitucion: props.clientData.idInstitucion
        }

        const response: FuncionalidadDTO | FetchAPIError = await agregarFuncionalidad(nuevaFuncionalidad,props.sessionAPIToken);

        //Si ocurre un error al registrar el tipo de equipo se muestra un mensaje de error
        if (isFetchAPIError(response)){
            console.error('ERROR - Registro de funcionalidad - agregarFuncionalidad:', response);
            createModal({
                children: (
                    <div>
                        <h2>Error al registrar la funcionalidad</h2>
                        <p>{response.errorMessage}</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        //Si se registra correctamente
        //Se muestra un mensaje de éxito
        createModal({
            children: (
                <div>
                    <h2>Funcionalidad registrada correctamente</h2>
                </div>
            ),
            buttonsType: ModalButtonsType.CONFIRM
        }).show();

        // Resetea los valores del formulario
        reset();
    }

    return(
        <form onSubmit={handleSubmit(onSubmit)} className={styles.equipoForm}>
            <h2>Registro de Funcionalidad</h2>
            <div className={styles.userDetailsRe}>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Nombre <span className={styles.requiredField}>*</span></span>
                        <input
                            {...register("nombre", {required: "Este campo es requerido"})}
                            type="text"
                            placeholder="Nombre de la funcionalidad"
                        />
                    </label>

                    {errors.nombre &&
                        <label className={styles.error}>{errors.nombre.message}</label>}
                </div>
                <div className={styles.buttomAe}>
                    <button type="submit">Agregar</button>
                </div>
            </div>
        </form>
    )

}

export default RegisterFuncionalidadForm;