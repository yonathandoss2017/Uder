"use client";  // Este es un componente del lado del cliente

// Importa los estilos de la página
import styles from "@public/styles/modules/register.user.module.css";
// Importa los módulos necesarios
import React, {useEffect, useState} from "react";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import PerfilDTO from "@/types/dtos/PerfilDTO";
import UsuarioEstadoEnum from "@/types/enums/UsuarioEstadoEnum";
import ComboBoxFC from "@/components/ComboBoxFC";
import SchemaUserRegister from "@/validations/SchemaUserRegister";
import {registrarUsuario} from "@/services/UsuarioService";
import {listarPerfiles, listarPorInstitucion} from "@/services/PerfilService";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {useModal} from "@/app/hooks/modals/useModal";
import {ModalButtonsType} from "@/components/ModalFC";

/**
 * Propiedades del componente
 *
 * @property {string} sessionAPIToken Token de sesión del cliente en la API
 * @property {UsuarioDTO} clientData Datos del usuario cliente (Usuario que está editando)
 */
interface RegisterUserFormProps {
    sessionAPIToken: string;
    clientData: UsuarioDTO;
}

/**
 * Valores del formulario (Hereda los valores de UsuarioDTO) con los campos adicionales de contraseña y teléfono
 *
 * @property {string} contrasenia - Contraseña del usuario
 * @property {string} telefono - Teléfono del usuario
 */
interface FormValues extends UsuarioDTO {
    contrasenia: string;
    telefono: string;
}

/**
 * Formulario de registro de usuarios (no el cliente).
 *
 * @param {RegisterUserFormProps} props - Propiedades del componente
 */
const RegisterUserForm = (props: RegisterUserFormProps) => {

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    // -------------------- Formulario de registro de usuarios --------------------
    // Define los métodos del formulario para manejar los valores y la validación (usando Zod)
    const {register, handleSubmit, formState: {errors}}: UseFormReturn<FormValues> = useForm<FormValues>({
        resolver: zodResolver(SchemaUserRegister), // Validación con Zod (basado en el esquema SchemaUserRegister)
        mode: 'all', // Estrátegia de validación: 'all', utiliza todas las estrátegias de validación ('onBlur' al salir del campo, 'onChange' al cambiar el valor, 'onSubmit' al enviar el formulario)
        defaultValues: { // Valores por defecto del formulario
            fechaNacimiento: new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0],
        }
    });

    // Lista de perfiles (Elementos del ComboBox de perfiles)
    const [perfiles, setPerfiles]: [PerfilDTO[], (value: PerfilDTO[]) => void] = useState<PerfilDTO[]>([]);

    // Efecto secundario que se ejecuta montar el componente
    useEffect((): void => {

        // Prócedimiento asíncrono autoinvocado que actualiza la lista de perfiles
        (async (): Promise<void> => {
            // Obtiene la lista de perfiles de la API
            const response: PerfilDTO[] | FetchAPIError = await listarPorInstitucion(props.clientData.idInstitucion);

            if (isFetchAPIError(response)) {
                // Si hay un error en la respuesta, muestra un mensaje en la consola y no actualiza la lista de perfiles
                console.error("ERROR - registro de usuario - form.tsx - useEffect - listarPerfiles() - error: ", response.errorMessage);
                return;
            }

            // Actualiza la lista de perfiles;
            setPerfiles(response);
        })();

    }, []);

    // Función que se ejecuta al enviar el formulario
    const onSubmit: SubmitHandler<FormValues> = async (formValues: FormValues): Promise<void> => {
        const telefono: number = Number(formValues.telefono);
        const contrasenia: string = formValues.contrasenia;

        const usuario: UsuarioDTO = {
            primerNombre: formValues.primerNombre,
            segundoNombre: formValues.segundoNombre,
            primerApellido: formValues.primerApellido,
            segundoApellido: formValues.segundoApellido,
            cedula: formValues.cedula,
            fechaNacimiento: formValues.fechaNacimiento,
            email: formValues.email,
            idPerfil: formValues.idPerfil,
            activo: true,
            estado: UsuarioEstadoEnum.NO_VERIFICADO,
            idInstitucion: props.clientData.idInstitucion,
        };

        console.log(formValues.idPerfil)
        await registrarUsuario(usuario, contrasenia, telefono).then((response: UsuarioDTO | FetchAPIError): void => {
            if (isFetchAPIError(response)) {
                console.error("ERROR - registro de usuario - form.tsx - registrarUsuario - error: ", response.errorMessage);
                createModal({
                    children: (
                        <div>
                            <h1>Error al registrar el usuario</h1>
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
                        <h1>Usuario registrado correctamente</h1>
                        <p>Nombre de usuario: {response.nombreUsuario}</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
        });
    }

    // Retorna el formulario
    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.userForm}>
            <div className={styles.detailsContainer}>
                <div className={styles.inputBox}>
                    <label className={styles.details}>
                        <span>Primer Nombre <span className={styles.requiredField}>*</span></span>
                        <input {...register("primerNombre")} type="text" placeholder="Primer Nombre"/>
                    </label>

                    {errors.primerNombre &&
                        <label className={styles.error}>{errors.primerNombre.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>
                        <span>Segundo Nombre</span>
                        <input {...register("segundoNombre")} type="text" placeholder="Segundo Nombre"/>
                    </label>

                    {errors.segundoNombre &&
                        <label className={styles.error}>{errors.segundoNombre.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>
                        <span>Primer Apellido <span className={styles.requiredField}>*</span></span>
                        <input {...register("primerApellido")} type="text" placeholder="Primer Apellido"/>
                    </label>

                    {errors.primerApellido && <label className={styles.error}>{errors.primerApellido.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>
                        <span>Segundo Apellido</span>
                        <input {...register("segundoApellido")} type="text" placeholder="Segundo Apellido"/>
                    </label>

                    {errors.segundoApellido && <label className={styles.error}>{errors.segundoApellido.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>
                        <span>Cédula <span className={styles.requiredField}>*</span></span>
                        <input {...register("cedula")} type="text" pattern="[0-9]*" inputMode="numeric"
                               placeholder="Cédula de identidad"/>
                    </label>

                    {errors.cedula &&
                        <label className={styles.error}>{errors.cedula.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>
                        <span>Fecha de nacimiento <span className={styles.requiredField}>*</span></span>
                        <input {...register("fechaNacimiento")} type="date"
                               max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                        />
                    </label>

                    {errors.fechaNacimiento && <label className={styles.error}>{errors.fechaNacimiento.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>
                        <span>Email <span className={styles.requiredField}>*</span></span>
                        <input {...register("email")} type="email" placeholder="Email"/>
                    </label>

                    {errors.email && <label className={styles.error}>{errors.email.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>
                        <span>Contraseña <span className={styles.requiredField}>*</span></span>
                        <input {...register("contrasenia")} type="password" placeholder="Contraseña"/>
                    </label>

                    {errors.contrasenia && <label className={styles.error}>{errors.contrasenia.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>
                        <span>Telefono <span className={styles.requiredField}>*</span></span>
                        <input {...register("telefono")} type="tel" placeholder="Telefono" onKeyDown={
                            (event: React.KeyboardEvent<HTMLInputElement>): void => {
                                if (isNaN(Number(event.key)) && event.key != 'Backspace') {
                                    event.preventDefault();
                                }
                            }
                        }/>
                    </label>

                    {errors.telefono && <label className={styles.error}>{errors.telefono.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>
                        <span>Perfil <span className={styles.requiredField}>*</span></span>
                        <ComboBoxFC
                            register={register("idPerfil")}
                            elements={perfiles.map((perfil: PerfilDTO): { key: number, value: string } => ({
                                key: perfil.id as number,
                                value: perfil.nombre
                            }))}
                            message={"Seleccione un perfil"}
                        />
                    </label>

                    {errors.idPerfil && <label className={styles.error}>{errors.idPerfil.message}</label>}
                </div>
            </div>
            <div className={styles.buttom}>
                <input type="submit" value="Registrar Usuario"/>
            </div>
        </form>
    );
};

// Exporta el componente
export default RegisterUserForm;