"use client";  // Este es un componente del lado del cliente

// Importa los estilos del formulario de edición de usuario
import styles from "@public/styles/modules/table/table.editform.module.css";

// Importa los módulos necesarios
import React, {ReactElement, useEffect, useState} from "react";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import UsuarioEstadoEnum, {translateUsuarioEstadoEnum} from "@/types/enums/UsuarioEstadoEnum";
import PerfilDTO from "@/types/dtos/PerfilDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import ChangeEntry from "@/types/ChangeEntry";
import ComboBoxFC from "@/components/ComboBoxFC";
import {mapEnumElements} from "@/utils/Utils";
import SchemaUserEstado from "@/validations/SchemaUserEstado";
import SchemaUser from "@/validations/SchemaUser";
import {buscarPerfilPorId, listarPerfiles} from "@/services/PerfilService";
import {useModal} from "@/app/hooks/modals/useModal";
import {ModalButtonsType} from "@/components/ModalFC";
import ModalChangesFC from "@/components/ModalChangesFC";
import {modificarUsuario} from "@/services/UsuarioService";
import TableTelefonosFC from "@/components/TableTelefonosFC";

/**
 * Propiedades del componente
 * @property {UsuarioDTO} editingUser Usuario a editar (Se va actualizando con los cambios onChange)
 * @property {PerfilDTO} perfilCliente Perfil del usuario que está editando (Para validar permisos)
 * @property {function} onSave Evento que maneja la acción de guardar los cambios
 * @property {function} onCancel Evento que maneja la acción de cancelar la edición
 */
interface EditUserFormProps {
    editingUser: UsuarioDTO;
    perfilCliente?: PerfilDTO;
    isClientAdministrador: boolean;
    sessionAPIToken: string;
    onSave?: (userModified: UsuarioDTO) => void;
    onCancel?: () => void;
}

/**
 * Formulario de edición de usuarios (no el cliente).
 *
 * @param {EditUserFormProps} props - Propiedades del componente
 */
function EditUserForm(props: Readonly<EditUserFormProps>): ReactElement {

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    // -------------------- Formulario de edición de usuario --------------------

    // Obtenemos los métodos y propiedades necesarios del hook useForm para el formulario
    const {
        register,               // Método para registrar los inputs del formulario
        handleSubmit,           // Método para manejar el envío del formulario
        formState: {errors}     // Propiedad que contiene los errores del formulario
    }: UseFormReturn<UsuarioDTO> = useForm<UsuarioDTO>({ // Inicializamos useForm con el tipo EquipoFormData
        resolver: zodResolver(SchemaUser.and(SchemaUserEstado)),    // Usamos zodResolver para la validación del formulario con el esquema de Zod SchemaUserEstado
        mode: 'all',                              // Configuramos el modo de validación a "all", lo que válida en cada cambio de valor y al salir del campo
        defaultValues: props.editingUser,         // Valores por defecto del formulario
    });

    // ----------------------- Perfiles -----------------------

    // Define el estado de la lista de perfiles para el combobox
    const [perfiles, setPerfiles]: [PerfilDTO[], (value: PerfilDTO[]) => void] = useState<PerfilDTO[]>([]);

    // Efecto que se ejecuta al montar el componente
    // Actualiza la lista de perfiles y teléfonos del usuario
    useEffect((): void => {

        // Procedimiento asíncrono auto-ejecutable que actualiza la lista de perfiles y teléfonos
        (async (): Promise<void> => {

            // Obtiene la lista de perfiles para el combobox
            await listarPerfiles(props.sessionAPIToken).then((response: PerfilDTO[] | FetchAPIError): void => {
                if (isFetchAPIError(response)) {
                    console.error('Error al obtener los perfiles:', response);
                    setPerfiles([]);
                    return;
                }

                if (props.isClientAdministrador) {
                    setPerfiles(response);
                    return;
                }

                const perfilCliente: PerfilDTO | undefined = props.perfilCliente;

                if (!perfilCliente) {
                    setPerfiles([]);
                    return;
                }

                // Filtrar perfiles con nivel mayor al del cliente (Para evitar que el cliente se asigne un perfil superior al suyo)
                const perfiles: PerfilDTO[] = response.filter((profile: PerfilDTO): boolean => profile.nivel > perfilCliente.nivel);

                // Actualiza la lista de perfiles
                setPerfiles(perfiles);
            });

        })();

    }, []);

    // ----------------------- Eventos del formulario de edición de usuario ----------------------------

    // Define la función que maneja el envío del formulario
    const onSubmit: SubmitHandler<UsuarioDTO> = async (formValues: UsuarioDTO): Promise<void> => {

        if (formValues.segundoNombre === "") formValues.segundoNombre = undefined;
        if (formValues.segundoApellido === "") formValues.segundoApellido = undefined;

        if (!formValues.idPerfil) {
            formValues.idPerfil = undefined;
        }

        const userModified: UsuarioDTO = {
            ...props.editingUser, // Copia los datos originales del usuario (id, nombreUsuario, etc.)
            ...formValues // Copia los datos modificados del usuario (primerNombre, segundoNombre, etc.)
        }

        // Obtiene la lista de cambios realizados en el usuario
        const changes: ChangeEntry[] = await obtenerCambios(userModified, props.editingUser);

        // Si no hay cambios, no se realiza la modificación
        if (changes.length === 0) {
            createModal({
                children: (
                    <div>
                        <h3>Operación cancelada</h3>
                        <p>No se realizaron cambios en el usuario.</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }


        // Muestra un modal de confirmación antes de modificar el usuario
        createModal({
            title: "Modificando a \"" + props.editingUser.nombreUsuario + "\"", // Título del modal
            children: ModalChangesFC(changes), // Muestra los cambios realizados en el usuario
            buttonsType: ModalButtonsType.CONFIRM_CANCEL,
            async onConfirm(): Promise<void> { // Acción al confirmar
                // Realiza la modificación del usuario en la API
                const response: void | FetchAPIError = await modificarUsuario(userModified, props.sessionAPIToken)

                if (isFetchAPIError(response)) {
                    const errorMessage: string = response.errorMessage;
                    // Muestra un mensaje de error al modificar el usuario
                    createModal({
                        children: (
                            <p>Error al modificar el usuario: {errorMessage}</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();

                    console.error("ERROR - pages/usuarios/lista/formEdit.tsx - onSubmit - modificarUsuario", response);
                    return;
                }

                // Muestra un mensaje de éxito al modificar el usuario
                createModal({
                    children: (
                        <p>Usuario <b>&quot;{props.editingUser.nombreUsuario}&quot;</b> modificado correctamente</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();

                if (props.onSave) {
                    props.onSave(userModified);
                }
            },
            onCancel: (): void => { // Acción al cancelar
                // Muestra un mensaje de cancelación
                createModal({
                    children: (
                        <p>Modificación cancelada</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();
            }
        }).show();

    }

    // ------------------------------------------------------------------------

    function handleBtnTelefonos(): void {
        createModal({
            children: (<TableTelefonosFC usuario={props.editingUser} sessionAPIToken={props.sessionAPIToken}/>),
            buttonsType: ModalButtonsType.CLOSE
        }).show();
    }

    // Retorna el JSX del componente (Formulario de edición de usuario)
    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`${styles.container} ${styles.aparecer}`}>
            <h2>Modificación de Usuario</h2>
            <h3>{props.editingUser.nombreUsuario}</h3>
            <div className={styles.detailsContainer}>
                <div className={styles.inputBox}>
                    <label className={styles.details}>
                        <span>Primer Nombre<span className={styles.requiredField}>*</span></span>
                        <input
                            {...register("primerNombre")}
                            type="text"
                            placeholder="Primer Nombre"
                            defaultValue={props.editingUser.primerNombre}
                        /></label>

                    {errors.primerNombre &&
                        <label className={styles.error}
                               style={{color: 'red'}}>{errors.primerNombre.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>
                        <span>Segundo Nombre</span>
                        <input
                            {...register("segundoNombre")}
                            type="text"
                            placeholder="Segundo Nombre"
                            defaultValue={props.editingUser.segundoNombre ? props.editingUser.segundoNombre : ''}
                        /></label>

                    {errors.segundoNombre &&
                        <label className={styles.error}
                               style={{color: 'red'}}>{errors.segundoNombre.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>
                        <span>Primer Apellido <span className={styles.requiredField}>*</span></span>
                        <input
                            {...register("primerApellido")}
                            type="text"
                            placeholder="Primer Apellido"
                            defaultValue={props.editingUser.primerApellido}
                        /></label>

                    {errors.primerApellido &&
                        <label className={styles.error}
                               style={{color: 'red'}}>{errors.primerApellido.message}</label>}
                </div>
                <div className={`${styles.inputBox}`}>
                    <label className={styles.details}>
                        <span>Segundo Apellido</span>
                        <input
                            {...register("segundoApellido")}
                            type="text"
                            placeholder="Segundo Apellido"
                            defaultValue={props.editingUser.segundoApellido ? props.editingUser.segundoApellido : ''}
                        />
                    </label>
                    {errors.segundoApellido &&
                        <label className={styles.error}
                               style={{color: 'red'}}>{errors.segundoApellido.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>
                        <span>Cédula <span className={styles.requiredField}>*</span></span>
                        <input
                            {...register("cedula")}
                            type="number"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            placeholder="Cédula de identidad"
                            defaultValue={props.editingUser.cedula}
                        /></label>

                    {errors.cedula &&
                        <label className={styles.error}>{errors.cedula.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>
                        <span>Fecha de nacimiento <span className={styles.requiredField}>*</span></span>
                        <input
                            {...register("fechaNacimiento")}
                            type="date"
                            defaultValue={props.editingUser.fechaNacimiento ? new Date(props.editingUser.fechaNacimiento).toISOString().split('T')[0] : ''}
                            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}/></label>

                    {errors.fechaNacimiento &&
                        <label className={styles.error}
                               style={{color: 'red'}}>{errors.fechaNacimiento.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <button type="button" onClick={() => handleBtnTelefonos()
                    }>* Teléfonos
                    </button>
                </div>
                <div className={styles.inputBox} id="Perfil">
                    <label className={styles.details}>
                        <span>Pefil <span className={styles.requiredField}>*</span></span>
                        <ComboBoxFC
                            register={register("idPerfil")}
                            selectedKey={props.editingUser.idPerfil}
                            elements={perfiles.map((perfil: PerfilDTO): { key: number; value: string; } => ({
                                key: perfil.id as number,
                                value: perfil.nombre
                            }))}
                            message={"Seleccione un perfil"}/></label>

                    {errors.idPerfil &&
                        <label className={styles.error}>{errors.idPerfil.message}</label>}
                </div>
                <div className={styles.inputBox} id="Estado">
                    <label className={styles.details}>
                        <span>Estado <span className={styles.requiredField}>*</span></span>
                        <ComboBoxFC
                            register={register("estado")}
                            selectedKey={props.editingUser.estado}
                            elements={mapEnumElements(UsuarioEstadoEnum, translateUsuarioEstadoEnum)}/></label>
                </div>
            </div>
            <div className={styles.buttomM}>
                <button type="submit">Guardar</button>
                <button type="button" onClick={props.onCancel}>Cancelar</button>
            </div>
        </form>
    );
}

// Exporta el componente (Formulario de edición de usuario)
export default EditUserForm;


// --------------------------> Funciones auxiliares <--------------------------

/**
 * Obtiene los cambios realizados en el usuario
 * @param editingUser Objeto con los datos del usuario editado
 * @param originalData Datos originales del usuario
 */
async function obtenerCambios(editingUser: UsuarioDTO, originalData: UsuarioDTO): Promise<ChangeEntry[]> {

    // Lista de cambios en la modificación del usuario
    const changes: ChangeEntry[] = [];


    // ==================================================================

    // Verifica si hay cambios en el perfil del usuario
    if (editingUser.idPerfil != originalData.idPerfil) {
        let previousPerfilName: string | undefined = undefined;
        let newPerfilName: string | undefined = undefined;

        if (originalData.idPerfil) {
            await buscarPerfilPorId(originalData.idPerfil).then(async (response: PerfilDTO | FetchAPIError): Promise<void> => {
                if (isFetchAPIError(response)) {
                    console.error('Error al obtener el perfil anterior:', response);
                    return;
                }
                previousPerfilName = response.nombre;
            });
        }

        if (editingUser.idPerfil) {
            await buscarPerfilPorId(editingUser.idPerfil).then(async (response: PerfilDTO | FetchAPIError): Promise<void> => {
                if (isFetchAPIError(response)) {
                    console.error('Error al obtener el nuevo perfil:', response);
                    return;
                }
                newPerfilName = response.nombre;
            });
        }

        // Agrega el cambio a la lista de cambios
        changes.push({
            field: "Perfil",
            previousValue: previousPerfilName,
            nextValue: newPerfilName
        });
    }

    // Verifica si hay cambios en el primer nombre del usuario
    if (editingUser.primerNombre != originalData.primerNombre) {
        changes.push({
            field: "Primer nombre",
            previousValue: originalData.primerNombre,
            nextValue: editingUser.primerNombre
        });
    }

    // Verifica si hay cambios en el segundo nombre del usuario
    if (editingUser.segundoNombre != originalData.segundoNombre) {
        changes.push({
            field: "Segundo nombre",
            previousValue: originalData.segundoNombre,
            nextValue: editingUser.segundoNombre
        });
    }

    // Verifica si hay cambios en el primer apellido del usuario
    if (editingUser.primerApellido != originalData.primerApellido) {
        changes.push({
            field: "Primer apellido",
            previousValue: originalData.primerApellido,
            nextValue: editingUser.primerApellido
        });
    }

    // Verifica si hay cambios en el segundo apellido del usuario
    if (originalData.segundoApellido != editingUser.segundoApellido) {
        changes.push({
            field: "Segundo apellido",
            previousValue: originalData.segundoApellido,
            nextValue: editingUser.segundoApellido
        });
    }

    // Verifica si hay cambios en la cédula del usuario
    if (originalData.cedula != editingUser.cedula) {
        changes.push({
            field: "Cédula",
            previousValue: originalData.cedula,
            nextValue: editingUser.cedula
        });
    }

    // Verifica si hay cambios en la fecha de nacimiento del usuario
    if (originalData.fechaNacimiento != editingUser.fechaNacimiento) {
        changes.push({
            field: "Fecha de nacimiento",
            previousValue: new Date(originalData.fechaNacimiento).toISOString().split('T')[0],
            nextValue: new Date(editingUser.fechaNacimiento).toISOString().split('T')[0]
        });
    }

    // Verifica si hay cambios en el estado del usuario
    if (originalData.estado != editingUser.estado) {
        changes.push({
            field: "Estado",
            previousValue: translateUsuarioEstadoEnum(originalData.estado),
            nextValue: translateUsuarioEstadoEnum(editingUser.estado)
        });
    }

    // Retorna la lista de cambios realizados
    return changes;
}
