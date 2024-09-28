'use client';

import React from "react";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import TipoEquipoDTO from "@/types/dtos/TipoEquipoDTO";
import {useModal} from "@/app/hooks/modals/useModal";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import styles from "@public/styles/modules/register.tiposequipo.module.css";
import SchemaTipoEquipo from "@/validations/SchemaTipoEquipo";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {agregarTipoEquipo} from "@/services/TipoEquipoService";
import {ModalButtonsType} from "@/components/ModalFC";

/**
 * Propiedades del componente
 *
 * @property {string} sessionAPIToken Token de sesión del cliente en la API
 * @property {UsuarioDTO} clientData Datos del usuario cliente (Usuario que está editando)
 */
interface RegisterTipoEquipoFormProps {
    sessionAPIToken: string;
    clientData: UsuarioDTO;
}

interface FormValues extends TipoEquipoDTO{

}

/**
 * Formulario de registro de tipos de equipos
 *
 * @param {RegisterTipoEquipoFormProps} props - Propiedades del componente
 */
const RegisterTipoEquipoForm : React.FC<RegisterTipoEquipoFormProps> = (props: RegisterTipoEquipoFormProps) => {

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    // -------------------- Formulario de registro de tipos de equipos --------------------

    // Obtenemos los métodos y propiedades necesarios del hook useForm para el formulario
    const {
        register,               // Método para registrar los inputs del formulario
        handleSubmit,           // Método para manejar el envío del formulario
        formState: {errors},     // Propiedad que contiene los errores del formulario
        reset                   // Método para resetear los valores del formulario
    }: UseFormReturn<FormValues> = useForm<FormValues>({ // Inicializamos useForm
        resolver: zodResolver(SchemaTipoEquipo),    // Usamos zodResolver para la validación del formulario con el esquema de Zod schemaTipoEquipo
        mode: 'all',                            // Configuramos el modo de validación a "all", lo que válida en cada cambio de valor y al salir del campo
        defaultValues: {}
    });

    // Función que se ejecuta al enviar el formulario
    const onSubmit: SubmitHandler<FormValues> = async (formValues: FormValues): Promise<void> => {

        const nuevoTipoEquipo: TipoEquipoDTO = {
            nombre: formValues.nombre,
            activo: true,
            idInstitucion: props.clientData.idInstitucion
        };

        // Se registra el equipo en la API
        const response: TipoEquipoDTO | FetchAPIError = await agregarTipoEquipo(nuevoTipoEquipo, props.sessionAPIToken);

        //Si ocurre un error al registrar el tipo de equipo se muestra un mensaje de error
        if (isFetchAPIError(response)){
            console.error('ERROR - Registro de tipo de equipo - agregarTipoEquipo:', response);
            createModal({
                children: (
                    <div>
                        <h2>Error al registrar el tipo de equipo</h2>
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
                        <h2>Tipo de equipo registrado correctamente</h2>
                </div>
            ),
            buttonsType: ModalButtonsType.CONFIRM
        }).show();

        // Resetea los valores del formulario
        reset();
    }

    // ------------------------------------------------------------------------

    return(
        <form onSubmit={handleSubmit(onSubmit)} className={styles.equipoForm}>
            <h2>Registro de Tipo de Equipo</h2>
            <div className={styles.userDetailsRe}>
            <div className={styles.inputBoxRe}>
                <label className={styles.details}>
                    <span>Nombre <span className={styles.requiredField}>*</span></span>
                    <input
                        {...register("nombre", {required: "Este campo es requerido"})}
                        type="text"
                        placeholder="Nombre del Tipo de Equipo"
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
export default RegisterTipoEquipoForm;




