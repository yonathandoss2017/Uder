// =============================================================================
// Formulario de registro propio del cliente
// =============================================================================

"use client";  // Este es un componente del lado del cliente

// importa los estilos del formulario de registro
import styles from "@public/styles/modules/auth/signupForm.module.css"
// Importa los módulos necesarios
import React, {FormEvent, useEffect, useState} from "react";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import PerfilDTO from "@/types/dtos/PerfilDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import UsuarioEstadoEnum from "@/types/enums/UsuarioEstadoEnum";
import ComboBoxFC from "@/components/ComboBoxFC";
import InstitucionDTO from "@/types/dtos/InstitucionDTO";
import {listarPerfiles, listarPorInstitucion} from "@/services/PerfilService";
import {listarInstituciones} from "@/services/InstitucionService";
import {registrarUsuario} from "@/services/UsuarioService";
import {signOut, useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {Session} from "next-auth";
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";
import SchemaUserRegister from "@/validations/SchemaUserRegister";
import {z} from "zod";
import {useModal} from "@/app/hooks/modals/useModal";
import {ModalButtonsType} from "@/components/ModalFC";

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
 * Formulario de registro propio del cliente
 */
const RegisterFormClient = () => {

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    // Obtiene los datos de sesión y el estado de uso del hook useSession de NextAuth.js
    const {data: sessionData}: { data: Session | null } =
        useSession() as {
            data: Session | null
        };


    // Obtiene el hook de enrutamiento de Next.js
    const router: AppRouterInstance = useRouter();

    useEffect((): void => {
        // Si no hay datos de sesión o mantiene una autenticación con la API (sessionAPIToken)
        // redirecciona al login
        if (!sessionData || sessionData.user.sessionAPIToken) {
            console.error("Redireccionando al login debido a un error en la autenticación con google");
            router.push('/login');
        }

    }, [sessionData, router]);

    // Define los métodos del formulario para manejar los valores y la validación (usando Zod)
    const {register, handleSubmit, formState: {errors}}: UseFormReturn<FormValues> = useForm<FormValues>({
        resolver: zodResolver(SchemaUserRegister.merge(z.object({
            idInstitucion: z
                .preprocess(((val): string => val ? String(val) : ''), // Convierte el valor a string
                    z.string()
                        .min(1, "Debe seleccionar una institución")),
        }))), // Validación con Zod (basado en el esquema SchemaUserRegister)
        mode: 'all', // Estrátegia de validación: 'all', utiliza todas las estrátegias de validación ('onBlur' al salir del campo, 'onChange' al cambiar el valor, 'onSubmit' al enviar el formulario)
        defaultValues: {
            primerNombre: obtenerNombresYApeellidos(sessionData?.user.name as string)[0],
            segundoNombre: obtenerNombresYApeellidos(sessionData?.user.name as string)[1],
            primerApellido: obtenerNombresYApeellidos(sessionData?.user.name as string)[2],
            segundoApellido: obtenerNombresYApeellidos(sessionData?.user.name as string)[3],
            fechaNacimiento: new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0],
            email: sessionData?.user.email as string
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
            idInstitucion: idInstitucionSelected,
        };

        const response: UsuarioDTO | FetchAPIError = await registrarUsuario(usuario, contrasenia, telefono);
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
                            <input type="email" placeholder="Email" value={sessionData?.user.email}
                                   disabled/>
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


// Exporta el formulario de registro propio del cliente
export default RegisterFormClient;


// --------------------------> Funciones auxiliares <--------------------------
/**
 * Obtiene los nombres y apellidos en un arreglo a partir de un nombre completo
 * @param nombreCompleto - Nombre completo del usuario
 */
function obtenerNombresYApeellidos(nombreCompleto: string): string[] {
    let nombreCompletoArr: string[] = nombreCompleto ? nombreCompleto.split(" ") : [];
    let primerNombre: string = nombreCompletoArr[0];
    let segundoNombre: string = "";
    let primerApellido: string;
    let segundoApellido: string = "";

    if (nombreCompletoArr.length >= 4) {
        segundoNombre = nombreCompletoArr[1];
        primerApellido = nombreCompletoArr[2];
        segundoApellido = nombreCompletoArr[3];
    } else if (nombreCompletoArr.length === 3) {
        segundoNombre = nombreCompletoArr[1];
        primerApellido = nombreCompletoArr[2];
    } else {
        primerApellido = nombreCompletoArr[1];
    }

    return [primerNombre, segundoNombre, primerApellido, segundoApellido];
}