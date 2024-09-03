"use client";  // Este es un componente del lado del cliente

// Importa los estilos del formulario de edición de usuario
import stylesTelefono from "@public/styles/modules/modal.telefono.module.css"

// Importa los módulos necesarios
import React, {ChangeEvent, ReactElement, useEffect, useState} from "react";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import TelefonoDTO, {formatTelefono} from "@/types/dtos/TelefonoDTO";
import {SafeParseReturnType, ZodIssue} from "zod";
import SchemaUserPhone from "@/validations/SchemaUserPhone";
import {agregarTelefono, eliminarTelefono, obtenerTelefonosPorUsuario} from "@/services/TelefonoService";
import {useModal} from "@/app/hooks/modals/useModal";
import {ModalButtonsType} from "@/components/ModalFC";

/**
 * Propiedades del componente
 * @property {UsuarioDTO} usuario Usuario a modificar telefonos (Se va actualizando con los cambios onChange)
 * @property {string} sessionAPIToken Token de sesión del cliente en la API
 */
interface TableTelefonosFCProps {
    usuario: UsuarioDTO;
    sessionAPIToken: string;
}

/**
 * Formulario de
 *
 * @param {TableTelefonosFCProps} props - Propiedades del componente
 */
function TableTelefonosFC(props: Readonly<TableTelefonosFCProps>): ReactElement {

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    // ----------------------- Modal de teléfonos -----------------------
    const [telefonos, setTelefonos]: [TelefonoDTO[], (value: TelefonoDTO[]) => void] = useState<TelefonoDTO[]>([]);
    const [nuevoTelefono, setNuevoTelefono]: [string, (value: string) => void] = useState<string>("");

    // Efecto que se ejecuta al montar el componente
    // Actualiza la lista de perfiles y teléfonos del usuario
    useEffect((): void => {

        // Procedimiento asíncrono auto-ejecutable que actualiza la lista de perfiles y teléfonos
        (async (): Promise<void> => {

            // Obtiene la lista de teléfonos del usuario
            await obtenerTelefonosPorUsuario(props.usuario.id as number, props.sessionAPIToken).then((response: TelefonoDTO[] | FetchAPIError): void => {
                if (isFetchAPIError(response)) {
                    console.error('Error al obtener los teléfonos del usuario:', response);
                    setTelefonos([]);
                    return;
                }
                setTelefonos(response); // Actualiza la lista de teléfonos
            });

        })();

    }, []);

    // Procedimiento que se ejecuta al hacer clic en el botón 'Agregar' en el modal de teléfonos
    const handleAgregarTelefono = async (): Promise<void> => {
        // Válida el nuevo teléfono con el esquema de Zod (SchemaUserPhone)
        const validationResponse: SafeParseReturnType<{ [x: string]: any; }, { [x: string]: any; }>
            = SchemaUserPhone.safeParse({telefono: nuevoTelefono});

        // Si no es válido, muestra un mensaje de error y retorna
        if (!validationResponse.success) {
            const errors: ZodIssue[] = validationResponse.error.errors;
            createModal({
                children: (
                    <div>
                        <h3>Error al agregar el teléfono</h3>
                        <p>El número de teléfono no es válido.</p>
                        <br/>
                        {errors.map((error: ZodIssue, index: number) => (
                            <p key={index + 1}> - {error.message}</p>
                        ))}
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        // Pregunta al cliente si está seguro de agregar el teléfono
        createModal({
            children: (
                <div>
                    <h3>Confirmación</h3>
                    <p>¿Está seguro de agregar el número de teléfono: <b>{nuevoTelefono}</b> al
                        usuario <b>{props.usuario.nombreUsuario}</b>?</p>
                </div>
            ),
            buttonsType: ModalButtonsType.CONFIRM_CANCEL,
            async onConfirm(): Promise<void> {
                // Define el objeto DTO con los datos del nuevo teléfono
                const nuevoTelefonoDTO: TelefonoDTO = {
                    idUsuario: props.usuario.id as number,
                    telefono: Number(nuevoTelefono)
                }

                // Agrega el teléfono a la base de datos
                await agregarTelefono(nuevoTelefonoDTO, props.sessionAPIToken).then((response: TelefonoDTO | FetchAPIError): void => {

                    if (isFetchAPIError(response)) {
                        console.error('Error al agregar el teléfono:', response);
                        createModal({
                            children: (
                                <div>
                                    <h3>Error al agregar el teléfono</h3>
                                    <p>Hubo un problema al agregar el número de teléfono. Por favor, inténtelo de
                                        nuevo.</p>
                                    <br/>
                                    <p>Detalles del error:</p>
                                    <div>
                                        <pre>{JSON.stringify(response, null, 2)}</pre>
                                    </div>
                                </div>
                            ),
                            buttonsType: ModalButtonsType.CONFIRM
                        }).show();
                        return;
                    }

                    // Si se agregó correctamente, actualiza el componente
                    setTelefonos([...telefonos, response]); // Agrega el teléfono a la lista de teléfonos
                    setNuevoTelefono(""); // Limpia el campo de texto
                    createModal({
                        children: (
                            <div>
                                <h3>Teléfono agregado</h3>
                                <p>El número de teléfono <b>{response.telefono}</b> se agregó con éxito al
                                    usuario <b>{props.usuario.nombreUsuario}</b>.</p>
                            </div>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                });
            },
            onCancel(): void {
                createModal({
                    children: (
                        <div>
                            <h3>Operación cancelada</h3>
                            <p>La operación de agregar el teléfono ha sido cancelada.</p>
                        </div>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();
            }
        }).show();

    }

    // Procedimiento que se ejecuta al hacer clic en el botón 'Eliminar' de un teléfono
    async function handleEliminarTelefono(idTelefono: number): Promise<void> {
        // Verifica si hay más de un teléfono, si no, muestra un mensaje y retorna
        if (telefonos.length <= 1) {
            createModal({
                children: (
                    <div>
                        <h3>Operación cancelada</h3>
                        <p>No puedes eliminar el último teléfono del usuario.</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        // Pregunta al cliente si está seguro de eliminar el teléfono
        createModal({
            children: (
                <div>
                    <h3>Confirmación</h3>
                    <p>¿Está seguro de eliminar el número de teléfono con ID: <b>{idTelefono}</b>?</p>
                </div>
            ),
            buttonsType: ModalButtonsType.CONFIRM_CANCEL,
            onConfirm: async (): Promise<void> => {
                const response: void | FetchAPIError = await eliminarTelefono(idTelefono, props.sessionAPIToken);
                if (isFetchAPIError(response)) {
                    console.error('Error al eliminar el teléfono:', response);
                    createModal({
                        children: (
                            <div>
                                <h3>Error al eliminar el teléfono</h3>
                                <p>Hubo un problema al eliminar el número de teléfono. Por favor, inténtelo de
                                    nuevo.</p>
                                <br/>
                                <p>Detalles del error:</p>
                                <div>
                                    <pre>{JSON.stringify(response, null, 2)}</pre>
                                </div>
                            </div>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    });
                    return;
                }
                // Si se eliminó correctamente, actualiza el componente
                setTelefonos(telefonos.filter((tel: TelefonoDTO): boolean => tel.id !== idTelefono)); // Elimina el teléfono de la lista
                createModal({
                    children: (
                        <div>
                            <h3>Teléfono eliminado</h3>
                            <p>El número de teléfono ha sido eliminado con éxito.</p>
                        </div>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();
            }
        }).show();
    }

    // ------------------------------------------------------------------------

    // Retorna el JSX del componente (Formulario de edición de usuario)
    return (
        <>
            <h3>Teléfonos del Usuario</h3>
            {/* Tabla de teléfonos */}
            {telefonos.length === 0 ? (
                    <div>
                        <p>Sin teléfonos registrados</p>
                    </div>
                ) :
                (
                    <table>
                        <thead>
                        <tr>
                            <th>Número</th>
                            <th/>
                        </tr>
                        </thead>
                        <tbody>
                        {telefonos.map((telefono: TelefonoDTO) => (
                            <tr key={telefono.id}>
                                {/*Sí el numero de telefono empieza por 0, entonces formato xxx xxx xxx, si no tiene 0 xxxx xxxx*/}
                                <td>
                                    {formatTelefono(telefono.telefono)}
                                </td>
                                <td>
                                    <button className={stylesTelefono.btnEliminar} type="button"
                                            onClick={() => telefono.id && handleEliminarTelefono(telefono.id)}>Eliminar
                                    </button>
                                </td>
                            </tr>

                        ))}
                        </tbody>
                    </table>
                )}
            <div className={stylesTelefono.agregarTel}>
                <input
                    type="text"
                    value={nuevoTelefono}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNuevoTelefono(e.target.value)}
                    placeholder="Nuevo Teléfono"/>
                <button
                    type="button"
                    onClick={() => handleAgregarTelefono()}>
                    Agregar
                </button>
            </div>
        </>
    );
}

// Exporta el componente (Formulario de edición de usuario)
export default TableTelefonosFC;