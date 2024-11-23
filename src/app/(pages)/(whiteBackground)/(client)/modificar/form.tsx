"use client";  // Este es un componente del lado del cliente

// Importa los módulos necesarios
import React, {ChangeEvent, ReactElement, useState} from "react";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import UsuarioEstadoEnum from "@/types/enums/UsuarioEstadoEnum";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import ChangeEntry from "@/types/ChangeEntry";
import Link from "next/link";
import schemaUserPassword from "@/validations/SchemaUserPassword";
import {z} from "zod";
import {cambiarContrasenia, loginCredentials, modificarCliente} from "@/services/SessionService";
import schemaUser from "@/validations/SchemaUser";
import {ModalButtonsType} from "@/components/ModalFC";
import {useModal} from "@/app/hooks/modals/useModal";
import ModalChangesFC from "@/components/ModalChangesFC";
import TableTelefonosFC from "@/components/TableTelefonosFC";
import {useToken} from "@/app/hooks/TokenProvider";
import {verificarAD} from "@/services/UsuarioService";

/**
 * Propiedades del componente
 * @property {UsuarioDTO} clientData Datos de usuario del cliente
 * @property {string} sessionAPIToken Token de sesión del cliente en la API
 */
interface EditUserFormProps {
    clientData: UsuarioDTO;
    sessionAPIToken: string;
}

/**
 * Define el formulario de edición propia del usuario (cliente)
 */
function FormEditUser(props: Readonly<EditUserFormProps>): ReactElement {

    // Obtenemos el token de sesión del cliente
    const {sessionAPIToken } = useToken();

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    // Obtenemos los métodos y propiedades necesarios del hook useForm para el formulario
    const {
        register,               // Método para registrar los inputs del formulario
        handleSubmit,           // Método para manejar el envío del formulario
        formState: {errors}     // Propiedad que contiene los errores del formulario
    }: UseFormReturn<UsuarioDTO> = useForm<UsuarioDTO>({ // Inicializamos useForm con el tipo EquipoFormData
        resolver: zodResolver(schemaUser),                                     // Usamos zodResolver para la validación del formulario con el esquema de Zod SchemaUserEstado
        mode: 'all',                              // Configuramos el modo de validación a "all", lo que válida en cada cambio de valor y al salir del campo
        defaultValues: props.clientData,          // Valores por defecto del formulario
    });

    // Define el estado de los datos originales del cliente (clientDataOriginal)
    const [clientDataOriginal]: [UsuarioDTO, (value: UsuarioDTO) => void] = useState<UsuarioDTO>({...props.clientData});

    // Define el estado de los datos del cliente (clientData) y la función para modificarlo (setClientData)
    const [clientData, setClientData]: [UsuarioDTO, (value: UsuarioDTO) => void]
        = useState<UsuarioDTO>({...props.clientData});

    // Define el estado de la contraseña actual y la función para modificarla (setContrasenia)
    let [contrasenia, setContrasenia]: [string, (value: string) => void] = useState<string>("");
    // Define el estado de la nueva contraseña y la función para modificarla (setNuevaContrasenia)
    let [nuevaContrasenia, setNuevaContrasenia]: [string, (value: string) => void] = useState<string>("");

    // Define el estado del dominio actual y la función para modificarlo (setDominio)
    let [dominio, setDominio]: [string, (value: string) => void] = useState<string>("");

    // ----------------------- Eventos del formulario de edición propia del usuario -----------------------

    // Procedimiento que se ejecuta al hacer clic en el botón 'Guardar'
    const onSubmit: SubmitHandler<UsuarioDTO> = async (formValues: UsuarioDTO): Promise<void> => {

        if(!sessionAPIToken) return;

        // Obtiene los cambios realizados en el formulario
        const changes: ChangeEntry[] = await obtenerCambios(formValues, clientDataOriginal, nuevaContrasenia.length > 0);

        // Si no se realizaron cambios, muestra un mensaje y retorna
        if (changes.length === 0) {
            createModal({
                children: (
                    <div>
                        <h3>Modificación cancelada</h3>
                        <p>No se realizaron cambios en el usuario.</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        // Si no se ingresó la contraseña, muestra un mensaje y retorna
        if (contrasenia.length == 0) {
            createModal({
                children: (
                    <div>
                        <h3>Contraseña requerida</h3>
                        <p>Debes ingresar tu contraseña para poder modificar tus datos.</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        // Define una bandera para verificar si la contraseña actual es correcta
        let resultActualPassword: boolean = true;

        if (dominio.length != 0) {
            if (clientData.nombreUsuario != null) {
                const verificarAd = await verificarAD(clientData.nombreUsuario, contrasenia, dominio)

                if (isFetchAPIError(verificarAd)) {
                    createModal({
                        children: (
                            <div>
                                <h3>Error al verificar con el Active Directory</h3>
                            </div>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                    return;
                }

                if (!verificarAd) {
                    resultActualPassword = false;
                }

            }
        } else {
            // Verifica si la contraseña actual es correcta intentando hacer login con las credenciales del usuario
            const loginResult = await loginCredentials(clientData.nombreUsuario as string, contrasenia);
            if (isFetchAPIError(loginResult)) {
                resultActualPassword = false;
            }
        }

        // Si la contraseña actual no es correcta, muestra un mensaje y retorna
        if (!resultActualPassword) {
            createModal({
                children: (
                    <div>
                        <h3>Contraseña incorrecta</h3>
                        <p>La contraseña actual no es correcta.</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        // Muestra un mensaje de confirmación antes de modificar el usuario
        createModal({
            title: "Modificando tus datos", // Título del modal
            children: ModalChangesFC(changes), // Muestra los cambios realizados en el usuario
            buttonsType: ModalButtonsType.CONFIRM_CANCEL,
            onConfirm: async (): Promise<void> => {
                // Si la nueva contraseña es igual a la actual, muestra un mensaje y retorna
                if (contrasenia == nuevaContrasenia) {
                    createModal({
                        children: (
                            <div>
                                <h3>Error al modificar los datos</h3>
                                <p>No puedes volver a poner la misma contraseña.</p>
                            </div>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                    return;
                }

                if (nuevaContrasenia.length>0) {
                    // Verifica que la nueva contraseña cumpla con las validaciones del esquema de Zod (SchemaUserPassword)
                    try {
                        schemaUserPassword.parse({contrasenia: nuevaContrasenia});
                    } catch (err) { // Sí hay un error entonces la validación falló
                        if (err instanceof z.ZodError) { // Si el error es de tipo ZodError (Error de validación de Zod)
                            // Muestra un mensaje con los errores de validación
                            createModal({
                                children: (
                                    <div>
                                        <h3>Error al modificar los datos</h3>
                                        <p>La nueva contraseña no cumple con los requisitos mínimos.</p>
                                        <br/>
                                        <p>Errores:</p>
                                        <ul>
                                            {err.issues.map((issue: z.ZodIssue, index: number) => (
                                                <li key={index + 1}>{issue.message}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ),
                                buttonsType: ModalButtonsType.CONFIRM
                            }).show();
                        }
                        return; // Retorna sin hacer nada
                    }

                    // Cambia la contraseña del usuario
                    await cambiarContrasenia(contrasenia, nuevaContrasenia, sessionAPIToken).then((response: void | FetchAPIError): void => {
                        if (isFetchAPIError(response)) {
                            // Si hay un error al cambiar la contraseña, muestra un mensaje y retorna
                            createModal({
                                children: (
                                    <div>
                                        <h3>Error al cambiar la contraseña</h3>
                                        <p>{response.errorMessage}</p>
                                    </div>
                                ),
                                buttonsType: ModalButtonsType.CONFIRM
                            }).show();
                        }
                    });
                }
                // Modifica los datos del usuario
                await modificarCliente(clientData, sessionAPIToken).then((response: void | FetchAPIError): void => {
                    if (isFetchAPIError(response)) {
                        console.error("ERROR - Modificación propia del usuario - modificarCliente: ", response);
                        createModal({
                            children: (
                                <div>
                                    <h3>Error al modificar los datos</h3>
                                    <p>{response.errorMessage}</p>
                                </div>
                            ),
                            buttonsType: ModalButtonsType.CONFIRM
                        }).show();
                        return;
                    }
                    // Si se modificó correctamente, muestra un mensaje de éxito
                    createModal({
                        children: (
                            <div>
                                <h3>Datos modificados</h3>
                                <p>Los datos del usuario se han modificado correctamente.</p>
                            </div>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                });
            },
            onCancel: (): void => {
                createModal({
                    children: (
                        <div>
                            <h3>Modificación cancelada</h3>
                            <p>La modificación de tus datos ha sido cancelada.</p>
                        </div>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();
            }
        }).show();
    }

    // Procedimiento que se ejecuta al cambiar el valor de un campo del formulario
    function handleInputChange(event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>): void {
        if (!clientData) return; // Si no hay un usuario en edición, retorna

        // Obtiene el nombre y el valor del campo que se está editando
        let {name, value}: {
            name: string,
            value: string | number | boolean | Date | UsuarioEstadoEnum | undefined
        } = event.target;

        // Si el valor es un string vacío, se establece como undefined (Para que la base de datos lo interprete como NULL)
        if (value?.length === 0) value = undefined;

        // Si value es un numero
        if (value && !isNaN(Number(value))) value = Number(value);

        // Actualiza el estado del usuario que se está editando
        setClientData({
            ...clientData, // Copia los datos del usuario que se está editando
            [name]: value // Actualiza el campo que se está editando
        });
    }


    function handleBtnTelefonos(): void {
        createModal({
            children: (<TableTelefonosFC usuario={props.clientData} sessionAPIToken={props.sessionAPIToken}/>),
            buttonsType: ModalButtonsType.CLOSE
        }).show();
    }


    // Retorna el JSX del formulario de edición propia del usuario
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="aparecer" id="user-form-mp">
            <h2>Modificación de Usuario</h2>
            <h3>{clientData.nombreUsuario}</h3>
            <div className="user-details-mp">
                <div className="input-box-mp">
                    <label className="details">Primer Nombre<span className="required-field">*</span></label>
                    <input
                        {...register("primerNombre")}
                        type="text"
                        placeholder="Primer Nombre"
                        className="nombre"
                        onChange={handleInputChange}
                    />
                    {errors.primerNombre &&
                        <label className="error">{errors.primerNombre.message}</label>}
                </div>
                <div className="input-box-mp">
                    <label className="details">Segundo Nombre</label>
                    <input
                        {...register("segundoNombre")}
                        type="text"
                        placeholder="Segundo Nombre"
                        className="nombre"
                        onChange={handleInputChange}
                    />
                    {errors.segundoNombre &&
                        <label className="error">{errors.segundoNombre.message}</label>}
                </div>
                <div className="input-box-mp">
                    <label className="details">Primer Apellido <span className="required-field">*</span></label>
                    <input
                        {...register("primerApellido")}
                        type="text"
                        placeholder="Primer Apellido"
                        className="apellido"
                        onChange={handleInputChange}
                    />
                    {errors.primerApellido &&
                        <label className="error">{errors.primerApellido.message}</label>}
                </div>
                <div className="input-box-mp">
                    <label className="details">Segundo Apellido</label>
                    <input
                        {...register("segundoApellido")}
                        type="text"
                        placeholder="Segundo Apellido"
                        className="apellido"
                        onChange={handleInputChange}
                    />
                    {errors.segundoApellido &&
                        <label className="error">{errors.segundoApellido.message}</label>}
                </div>
                <div className="input-box-mp">
                    <label className="details">Cédula <span className="required-field">*</span></label>
                    <input
                        {...register("cedula")}
                        type="number"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        placeholder="Cédula de identidad"
                        className="ci"
                        onChange={handleInputChange}
                    />
                    {errors.cedula &&
                        <label className="error">{errors.cedula.message}</label>}
                </div>
                <div className="input-box-mp">
                    <label className="details">Contraseña <span className="required-field">*</span></label>
                    <input id={"contrasenia"} type="password" placeholder="Contraseña"
                           className="contrasenia"
                           onChange={(event: ChangeEvent<HTMLInputElement>) => setContrasenia(event.target.value)}
                    />
                </div>
                <div className="input-box-mp">
                    <label className="details">Nueva Contraseña <span className="required-field"></span></label>
                    <input id={"nuevaContrasenia"} type="password" placeholder="Contraseña"
                           className="contrasenia"
                           onChange={(event: ChangeEvent<HTMLInputElement>) => setNuevaContrasenia(event.target.value)}
                    />
                </div>
                <div className="input-box-mp">
                    <label className="details">
                        <span>Dominio <span className="required-field"></span></span>  </label>
                        <input id={"dominio"} type="text" placeholder="Dominio"
                        onChange={(event: ChangeEvent<HTMLInputElement>) => setDominio(event.target.value)}
                        />
                </div>
                <div className="input-box-mp">
                    <label className="details">Fecha de nacimiento <span className="required-field">*</span></label>
                    <input
                        {...register("fechaNacimiento")}
                        type="date"
                        className="f-nacimiento"
                        onChange={handleInputChange}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    />
                    {errors.fechaNacimiento &&
                        <label className="error">{errors.fechaNacimiento.message}</label>}
                </div>
            </div>
            <div className="input-box-mp-te">
                <label className="details"><span className="required-field"></span></label>
                <button type="button" onClick={(event: React.MouseEvent<HTMLButtonElement>): void => {
                    event.preventDefault();
                    handleBtnTelefonos();
                }}>* Telefonos
                </button>
            </div>
            <div className="buttom-mp">
                <button type="submit">Guardar</button>
                <Link href={"/"}>
                    <button type="button">Cancelar</button>
                </Link>
            </div>
        </form>
    );
}

// Exporta el componente
export default FormEditUser;

// --------------------------> Funciones auxiliares <--------------------------

/**
 * Obtiene los cambios realizados en el formulario de edición del usuario
 * @param editingUser Datos del usuario editado
 * @param originalData Datos originales del usuario
 * @param hasChangedPassword Indica si se ha cambiado la contraseña
 */
async function obtenerCambios(editingUser: UsuarioDTO, originalData: UsuarioDTO, hasChangedPassword: boolean): Promise<ChangeEntry[]> {
    const changes: ChangeEntry[] = [];

    if (hasChangedPassword) {
        changes.push({
            field: "Contraseña",
            previousValue: "********",
            nextValue: "********"
        });
    }

    if (editingUser.primerNombre != originalData.primerNombre) {
        changes.push({
            field: "Primer nombre",
            previousValue: originalData.primerNombre,
            nextValue: editingUser.primerNombre
        });
    }

    if (originalData.segundoNombre !== editingUser.segundoNombre && (originalData.segundoNombre || editingUser.segundoNombre)) {
        changes.push({
            field: "Segundo nombre",
            previousValue: originalData.segundoNombre || "",
            nextValue: editingUser.segundoNombre || ""
        });
    }

    if (editingUser.primerApellido != originalData.primerApellido) {
        changes.push({
            field: "Primer apellido",
            previousValue: originalData.primerApellido,
            nextValue: editingUser.primerApellido
        });
    }

    if (originalData.segundoApellido !== editingUser.segundoApellido && (originalData.segundoApellido || editingUser.segundoApellido)) {
        changes.push({
            field: "Segundo apellido",
            previousValue: originalData.segundoApellido || "",
            nextValue: editingUser.segundoApellido || ""
        });
    }

    if (originalData.cedula != editingUser.cedula) {
        changes.push({
            field: "Cédula",
            previousValue: originalData.cedula,
            nextValue: editingUser.cedula
        });
    }

    if (originalData.fechaNacimiento != editingUser.fechaNacimiento) {
        changes.push({
            field: "Fecha de nacimiento",
            previousValue: originalData.fechaNacimiento,
            nextValue: editingUser.fechaNacimiento
        });
    }

    return changes;
}
