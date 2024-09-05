"use client";  // Este es un componente del lado del cliente

import React from "react";
import { useForm, SubmitHandler, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MarcaDTO from "@/types/dtos/MarcaDTO";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import { useModal } from "@/app/hooks/modals/useModal";
import { agregarMarca } from "@/services/MarcaService";
import FetchAPIError, { isFetchAPIError } from "@/types/errors/FetchAPIError";
import { ModalButtonsType } from "@/components/ModalFC";
import SchemaMarca from "@/validations/SchemaMarca";
import styles from "@public/styles/modules/register.equipo.module.css";

// Definición del tipo FormValues para el formulario
interface FormValues {
    nombre: string;
    activo: boolean;
    idInstitucion: number;
}

// Props del componente
interface RegisterMarcaFormProps {
    sessionAPIToken: string;
    clientData: UsuarioDTO;
}

/**
 * Formulario para registrar una nueva marca
 * @param {RegisterMarcaFormProps} props
 */
const RegisterMarcaForm: React.FC<RegisterMarcaFormProps> = (props: RegisterMarcaFormProps) => {
    // ----------------------- Modales -----------------------
    const { createModal } = useModal();

    // -------------------- Formulario de registro de marca --------------------

    // Obtenemos los métodos y propiedades necesarios del hook useForm para el formulario
    const {
        register,               // Método para registrar los inputs del formulario
        handleSubmit,           // Método para manejar el envío del formulario
        formState: { errors },  // Propiedad que contiene los errores del formulario
        reset
    }: UseFormReturn<FormValues> = useForm<FormValues>({
        resolver: zodResolver(SchemaMarca), // Usamos zodResolver para la validación del formulario
        mode: "all", // Validación en cada cambio de valor y al salir del campo
        defaultValues: {}
    });

    // Función que se ejecuta al enviar el formulario
    const onSubmit: SubmitHandler<FormValues> = async (formValues: FormValues): Promise<void> => {
        const nuevoMarcaDTO: MarcaDTO = {
            nombre: formValues.nombre,
            activo: formValues.activo,
            idInstitucion: props.clientData.idInstitucion,
        };

        // Se registra la marca en la API
        const response: MarcaDTO | FetchAPIError = await agregarMarca(nuevoMarcaDTO, props.sessionAPIToken);

        // Se verifica si hay un error en la respuesta
        if (isFetchAPIError(response)) {
            // Si ocurre un error al registrar marca se muestra un mensaje de error
            console.error('ERROR - Registro de marca - agregarMarca:', response);
            createModal({
                children: (
                    <div>
                        <h2>Error al registrar marca</h2>
                        <p>{response.errorMessage}</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM,
            }).show();
            return;
        }

        // Modal de éxito
        createModal({
            children: (
                <div>
                    <h2>Marca registrada correctamente</h2>
                </div>
            ),
            buttonsType: ModalButtonsType.CONFIRM,
        }).show();
    };

    // ---------------------- Renderizado del formulario ----------------------
    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.marcaForm}>
            <h2>Registro de Marca</h2>
            <div className={styles.userDetailsRe}>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Nombre <span className={styles.requiredField}>*</span></span>
                        <input
                            {...register("nombre", { required: "Este campo es requerido" })}
                            type="text"
                            placeholder="Nombre Marca"
                        />
                    </label>

                    {errors.nombre && (
                        <label className={styles.error}>{errors.nombre.message}</label>
                    )}
                </div>
                <div className={styles.buttomAe}>
                    <button type="submit">Guardar</button>
                </div>
            </div>
        </form>
    );
};

// Exporta el componente
export default RegisterMarcaForm;
