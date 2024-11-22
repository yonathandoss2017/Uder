"use client"

import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import {useModal} from "@/app/hooks/modals/useModal";
import {signOut, useSession} from "next-auth/react";
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";
import {useRouter} from "next/navigation";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import PerfilDTO from "@/types/dtos/PerfilDTO";
import React, {FormEvent, useEffect, useState} from "react";
import InstitucionDTO from "@/types/dtos/InstitucionDTO";
import {listarInstituciones} from "@/services/InstitucionService";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import styles from "@public/styles/modules/auth/signupForm.module.css";
import ComboBoxFC from "@/components/ComboBoxFC";
import {ModalButtonsType} from "@/components/ModalFC";
import {generarNombreUsuario, registrarConAD, verificarAD} from "@/services/UsuarioService";
import UsuarioEstadoEnum from "@/types/enums/UsuarioEstadoEnum";
import {listarPorInstitucion} from "@/services/PerfilService";
import SchemaUserRegisterAd from "@/validations/SchemaUserRegisterAd";

/**
 * Valores del formulario (Hereda los valores de UsuarioDTO) con los campos adicionales de contraseña y teléfono
 *
 * @property {string} telefono - Teléfono del usuario
 */
interface FormValues extends UsuarioDTO {
    contrasenia: string;
    dominio: string;
    telefono: string;
}

const RegisterFormClientAd = () => {

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    // Obtiene el hook de enrutamiento de Next.js
    const router: AppRouterInstance = useRouter();

    // Define los métodos del formulario para manejar los valores y la validación (usando Zod)
    const {register, handleSubmit, formState: {errors}}: UseFormReturn<FormValues> = useForm<FormValues>({
        resolver: zodResolver(SchemaUserRegisterAd.merge(z.object({
            idInstitucion: z
                .preprocess(((val): string => val ? String(val) : ''), // Convierte el valor a string
                    z.string()
                        .min(1, "Debe seleccionar una institución")),
        }))), // Validación con Zod (basado en el esquema SchemaUserRegister)
        mode: 'all', // Estrátegia de validación: 'all', utiliza todas las estrátegias de validación ('onBlur' al salir del campo, 'onChange' al cambiar el valor, 'onSubmit' al enviar el formulario)
        defaultValues: {
        }
    });

    // Lista de perfiles (Elementos del ComboBox de perfiles)
    const [perfiles, setPerfiles]: [PerfilDTO[], (value: PerfilDTO[]) => void] = useState<PerfilDTO[]>([]);

    // Lista de instituciones (Elementos del ComboBox de instituciones)
    const [instituciones, setInstituciones]: [InstitucionDTO[], (value: InstitucionDTO[]) => void] = useState<InstitucionDTO[]>([]);

    // Define un estado que guarda la institución seleccionada
    const [idInstitucionSelected, setIdInstitucionSelected]: [number, (value: number) => void] = useState<number>(0);

    // Efecto secundario que se ejecuta montar el componente
    useEffect((): void => {

        // Prócedimiento asíncrono autoinvocado que actualiza la lista de instituciones
        (async (): Promise<void> => {
            // Obtiene la lista de instituciones de la API
            await listarInstituciones().then((response: InstitucionDTO[] | FetchAPIError): void => {
                if (isFetchAPIError(response)) {
                    console.error("ERROR - Registro propio - useEffect - listarInstituciones: ", response);
                    return;
                }
                // Actualiza la lista de instituciones
                setInstituciones(response);
            });
        })();

    }, []);

    // Efecto secundario que se ejecuta montar el componente y cuando se actualiza la institución seleccionada
    useEffect((): void => {
        // Prócedimiento asíncrono autoinvocado que actualiza la lista de perfiles y de instituciones
        (async (): Promise<void> => {
            // Obtiene la lista de perfiles de la API
            const response: PerfilDTO[] | FetchAPIError = await listarPorInstitucion(idInstitucionSelected);
            if (isFetchAPIError(response)) {
                console.error("ERROR - Registro propio - useEffect - listarPerfiles: ", response);
                return;
            }
            // Actualiza la lista de perfiles;
            setPerfiles(response);
        })();
    }, [idInstitucionSelected]);

    // Función que se ejecuta al enviar el formulario
    const onSubmit: SubmitHandler<FormValues> = async (formValues: FormValues): Promise<void> => {

        console.log("EN EL SUMBIT")

        const telefono: number = Number(formValues.telefono);

        console.log("DESPUES DE TELEFONO ", telefono)

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
            idInstitucion: idInstitucionSelected,
        };


        console.log("Usuario ", usuario)

        console.log("generar ", formValues.primerNombre, formValues?.segundoNombre, formValues.primerApellido, formValues?.segundoApellido)



        const nombreUsuario: string | FetchAPIError = await generarNombreUsuario(formValues.primerNombre, formValues?.segundoNombre, formValues.primerApellido, formValues?.segundoApellido);


        console.log("Nombre de usuario ", nombreUsuario)

        if (isFetchAPIError(nombreUsuario)) {
            console.error("ERROR - Registro propio - onSubmit - generarNombreUsuario: ", nombreUsuario);
            createModal({
                children: (
                    <div>
                        <h1>Error</h1>
                        <p>{nombreUsuario.errorMessage}</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM,
                isSidebarOpen: false
            }).show();
            return;
        }

        console.log("Nombre de usuario generado: ", nombreUsuario);
        console.log("Contrasenia  ", formValues.contrasenia);
        console.log("Dominio  ", formValues.dominio);

       const existeAd: boolean | FetchAPIError = await verificarAD(nombreUsuario, formValues.contrasenia, formValues.dominio);

       console.log("Existe AD: ", existeAd);

        if (isFetchAPIError(existeAd)) {
            console.error("ERROR - Registro propio - onSubmit - verificarAD: ", existeAd);
            createModal({
                children: (
                    <div>
                        <h1>Error</h1>
                        <p>{existeAd.errorMessage}</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM,
                isSidebarOpen: false
            }).show();
            return
        }

        if (existeAd && !isFetchAPIError(existeAd)) {

            console.log("Usuario existe en AD ", existeAd);
            console.log("Usuario a registrar: ", usuario);
            console.log("Telefono: ", telefono);

            const response: UsuarioDTO | FetchAPIError = await registrarConAD(usuario, telefono);
            if (isFetchAPIError(response)) {
                console.error("ERROR - Registro propio - onSubmit - registrarUsuario: ", response);
                createModal({
                    children: (
                        <div>
                            <h1>Error</h1>
                            <p>{response.errorMessage}</p>
                        </div>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM,
                    isSidebarOpen: false
                }).show();
                return;
            }

            createModal({
                children: (
                    <div>
                        <h1>Usuario registrado correctamente</h1>
                        <p>Nombre de usuario: <b>{response.nombreUsuario}</b></p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM,
                onClose: async (): Promise<void> => {
                    await signOut({redirect: true, callbackUrl: "/login"});
                    router.push("/login");
                },
                isSidebarOpen: false
            }).show();
        } else {
            createModal({
                children: (
                    <div>
                        <h1>Error</h1>
                        <p>El usuario no existe en el dominio</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM,
                isSidebarOpen: false
            }).show();
        }
    }


    async function handleBackToLogin(e: FormEvent<HTMLInputElement>): Promise<void> {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario (Enviar los datos)
        await signOut({redirect: false}) // Cierra la sesión del cliente sin redireccionar
        router.push("/login"); // Redirecciona al login
    }

    // Retorna el JSX del formulario de registro
    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.userForm}>
            <div className={styles.userDetails}>
                <div className={styles.columna}>
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
                            <span>Primer Apellido <span className={styles.requiredField}>*</span></span>
                            <input {...register("primerApellido")} type="text" placeholder="Primer Apellido"/>
                        </label>
                        {errors.primerApellido &&
                            <label className={styles.error}>{errors.primerApellido.message}</label>}
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
                            <span>Email <span className={styles.requiredField}>*</span></span>
                            <input {...register("email")} type="email" placeholder="Email"/>
                        </label>
                        {errors.email &&
                            <label className={styles.error}>{errors.email.message}</label>}
                    </div>
                    <div className={styles.inputBox}>
                        <label className={styles.details}>
                            <span>Telefono <span className={styles.requiredField}>*</span></span>

                            <input {...register("telefono")} type="tel" placeholder="Telefono"
                                   onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>): void => {
                                       if (isNaN(Number(e.key)) && e.key != 'Backspace') {
                                           e.preventDefault();
                                       }
                                   }}
                            />
                        </label>
                        {errors.telefono &&
                            <label className={styles.error}>{errors.telefono.message}</label>}
                    </div>
                </div>
                <div className={styles.columna}>
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
                            <span>Segundo Apellido</span>
                            <input {...register("segundoApellido")} type="text" placeholder="Segundo Apellido"/>
                        </label>

                        {errors.segundoApellido &&
                            <label className={styles.error}
                                   style={{color: 'red'}}>{errors.segundoApellido.message}</label>}
                    </div>
                    <div className={styles.inputBox}>
                        <label className={styles.details}>
                            <span>Fecha de nacimiento <span className={styles.requiredField}>*</span></span>
                            <input {...register("fechaNacimiento")} type="date"
                                   max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                            />
                        </label>
                        {errors.fechaNacimiento &&
                            <label className={styles.error}
                                   style={{color: 'red'}}>{errors.fechaNacimiento.message}</label>}
                    </div>
                    <div className={styles.inputBox}>
                        <label className={styles.details}>
                            <span>Contraseña <span className={styles.requiredField}>*</span></span>
                            <input {...register("contrasenia")} type="password" placeholder="Contraseña"/>
                        </label>
                        {errors.contrasenia &&
                            <label className={styles.error}>{errors.contrasenia.message}</label>}
                    </div>
                    <div className={styles.inputBox}>
                        <label className={styles.details}>
                            <span>Dominio <span className={styles.requiredField}>*</span></span>
                            <input {...register("dominio")} type="text" placeholder="Dominio"/>
                        </label>
                        {errors.dominio &&
                            <label className={styles.error}>{errors.dominio.message}</label>}
                    </div>
                    <div className={styles.inputBox} id="Perfil">
                        <label className={styles.details}>Perfil <span className={styles.requiredField}>*</span></label>
                        {idInstitucionSelected ?
                            (
                                <ComboBoxFC
                                    register={register("idPerfil")}
                                    elements={perfiles.map((perfil: PerfilDTO): { key: number, value: string } => ({
                                        key: perfil.id as number,
                                        value: perfil.nombre
                                    }))}
                                    message={"Seleccione un perfil"}
                                />)
                            :
                            (
                                <select disabled>
                                    <option value="">Seleccione una institución</option>
                                </select>
                            )
                        }
                        {errors.idPerfil &&
                            <label className={styles.error}>{errors.idPerfil.message}</label>}
                    </div>
                </div>
            </div>
            <div className={styles.insitBtn}>
                <label className={styles.details}>
                    <span>Institucion <span className={styles.requiredField}>*</span></span>
                    <ComboBoxFC
                        register={register("idInstitucion")}
                        elements={instituciones.map((institucion: InstitucionDTO): { key: number, value: string } => ({
                            key: institucion.id as number,
                            value: institucion.nombre
                        }))}
                        message={"Selecciona una institución"}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
                            setIdInstitucionSelected(Number(e.target.value));
                        }}
                    />
                </label>
                {errors.idInstitucion &&
                    <label className={styles.error}>{errors.idInstitucion.message}</label>}
            </div>
            <div className={styles.buttom}>
                <input type="submit" value="Registrar Usuario"/>
                <input type="button" value="Volver al login" onClick={handleBackToLogin}/>
            </div>
        </form>
    );
};

export default RegisterFormClientAd;