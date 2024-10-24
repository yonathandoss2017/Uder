"use client";  // Este es un componente del lado del cliente

// Importa los estilos de la tabla
import stylesTable from "@public/styles/modules/table/table.usuarios.module.css";
// Importa los módulos necesarios
import UsuarioDTO from '@/types/dtos/UsuarioDTO';
import FormModificar from '@/app/(pages)/(whiteBackground)/usuarios/(lista)/formEdit';
import React, {ChangeEvent, MutableRefObject, ReactElement, useEffect, useRef, useState} from "react";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import UsuarioEstadoEnum, {translateUsuarioEstadoEnum} from "@/types/enums/UsuarioEstadoEnum";
import PerfilDTO from "@/types/dtos/PerfilDTO";
import {
    contarUsuariosPorInstitucion,
    darBajaUsuario,
    listarUsuarios,
    reactivarUsuario
} from "@/services/UsuarioService";
import ModalViewUserFC from "@/components/ModalViewUserFC";
import UsuarioFilter from "@/types/filters/UsuarioFilter";
import {useModal} from "@/app/hooks/modals/useModal";
import {ModalButtonsType} from "@/components/ModalFC";
import UsuarioFieldSortEnum from "@/types/enums/UsuarioFieldSortEnum";
import {buscarPerfilPorId, listarPerfiles} from "@/services/PerfilService";
import LoadingPage from "@/app/(pages)/loading";
import {ModalInstance} from "@/app/hooks/modals/ModalProvider";
import ComboBoxFC from "@/components/ComboBoxFC";
import InstitucionDTO from "@/types/dtos/InstitucionDTO";
import {buscarInstitucionPorId} from "@/services/InstitucionService";
import ErrorFC from "@/components/ErrorFC";
import {useToken} from "@/app/hooks/TokenProvider";

/**
 * Propiedades del componente Table
 * @property {string} sessionAPIToken Token de sesión del cliente en la API
 * @property {number} clientID ID del cliente (UsuarioDTO)
 * @property {PerfilDTO} perfilCliente Perfil del cliente
 * @property {boolean} hasPermissionEdit Indica si el cliente tiene permisos para modificar usuarios
 * @property {boolean} hasPermissionBaja Indica si el cliente tiene permisos para dar de baja usuarios
 */
interface TableUsersFCProps {
    sessionAPIToken: string;
    clientID: number;
    client: UsuarioDTO;
    hasPermissionEdit: boolean;
    hasPermissionBaja: boolean;
    hasPermissionReactivar: boolean;
    hasPermissionObtenerUsuarios: boolean
}

/**
 * Propiedades de los filtros de la tabla
 */
interface TableSearchTermsProps {
    size: number;
    page: number;
    fieldSort: UsuarioFieldSortEnum;
    sortDirectionAsc: boolean;
    filter: UsuarioFilter;
}

/**
 * Interfaz que define las entradas de la tabla de usuarios
 * - Esto es para tener a mano el perfil de cada usuario en la tabla y saber si se puede editar o no
 * UsuarioDTO - Datos del usuario
 * PerfilDTO - Perfil del usuario
 */
interface TableRowProps {
    usuario: UsuarioDTO;
    perfil?: PerfilDTO;
}

/**
 * Tabla de usuarios
 *
 * @param {TableUsersFCProps} props Propiedades del componente
 */
function TableUsersFC(props: Readonly<TableUsersFCProps>): ReactElement {

    // Obtenemos el token de sesión del cliente
    const {sessionAPIToken } = useToken();

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    // ----------------------- Términos de búsqueda  -----------------------


    const [currentPage, setCurrentPage] = useState<number>(1);
    const [npage, setNpage] = useState<number>(1);

    const [idAdministrador, setIdAdministrador] = useState<number>(0);
    const [perfilCliente, setPerfilCliente] = useState<PerfilDTO | undefined>(undefined);

    const recordsPerPage: number = 5;

    useEffect(() => {

        if(sessionAPIToken == null) return;

        const obtenerDatosCliente = async () => {
            try {
                // Obtiene la institución del cliente
                const institucion: InstitucionDTO | FetchAPIError = await buscarInstitucionPorId(props.client.idInstitucion, sessionAPIToken);

                if (institucion && !isFetchAPIError(institucion)){
                    setIdAdministrador(institucion.idAdministrador as number);
                }


                // Si ocurre un error al obtener la institución, muestra un mensaje de error
                if (isFetchAPIError(institucion)) {
                    console.error("ERROR - lista de usuarios - page.tsx - buscarInstitucionPorId: ", institucion);
                    return <ErrorFC message={institucion.errorMessage} />;
                }

                if (props.client.idPerfil) {
                    console.log("iddelperfil", props.client.idPerfil)
                    const response: PerfilDTO | FetchAPIError = await buscarPerfilPorId(props.client.idPerfil, sessionAPIToken);
                    if (isFetchAPIError(response)) {
                        console.error("ERROR - lista de usuarios - page.tsx - buscarPerfilPorId: ", response);
                    } else {
                        setPerfilCliente(response)
                    }
                }

                // Aquí puedes manejar lo que harás con los datos de la institución y el perfilCliente
                // Por ejemplo, actualizar el estado o realizar otras acciones
            } catch (error) {
                console.error("ERROR - lista de usuarios - page.tsx - obtenerDatosCliente: ", error);
            }
        };

        obtenerDatosCliente();
    }, [props.sessionAPIToken]);


    // Define los términos de búsqueda introducidos por el usuario en tiempo real (searchTerms)
    // y la función para modificarlos (setSearchTerms)
    const [searchTerms, setSearchTerms]: [TableSearchTermsProps, (value: TableSearchTermsProps) => void]
        = useState<TableSearchTermsProps>({
        size: recordsPerPage,
        page: currentPage,
        fieldSort: UsuarioFieldSortEnum.NOMBRE_USUARIO,
        sortDirectionAsc: true,
        filter: {activo: true}
    });

    // Define los términos de búsqueda aplicados en la tabla de usuarios (appliedSearchTerms)
    // y la función para modificarlos (setAppliedSearchTerms)
    const [appliedSearchTerms, setAppliedSearchTerms]: [TableSearchTermsProps, (value: TableSearchTermsProps) => void]
        = useState<TableSearchTermsProps>(searchTerms);

    // Define un ref (Referencia mutable) para el temporizador que actualiza los términos de búsqueda aplicados
    // (Ejecuta una acción después de un tiempo determinado)
    const refSearchTermsTimer: MutableRefObject<NodeJS.Timeout | null> = useRef<NodeJS.Timeout | null>(null);


    // Efecto que se ejecuta cuando cambian los términos de búsqueda introducidos por el usuario
    // Reinicia el temporizador para actualizar los términos de búsqueda aplicados con los introducidos por el usuario
    // (Esto evita que se realicen múltiples actualizaciones en un corto período de tiempo, ósea por cada letra que se escribe o borra)
    useEffect((): void => {

        // Si hay un temporizador en ejecución, lo cancela para evitar múltiples ejecuciones
        if (refSearchTermsTimer.current !== null) {
            clearTimeout(refSearchTermsTimer.current);
        }

        // Crea un nuevo temporizador usando requestIdleCallback
        refSearchTermsTimer.current = setTimeout((): void => {
            setAppliedSearchTerms(searchTerms); // Actualiza los términos de búsqueda
        }, 500); // Establece un temporizador de 0.5 segundo

    }, [searchTerms]);

    // ----------------------- Lista de usuarios -----------------------

    // Define la lista de usuarios a mostrar en la tabla (users) y la función para modificarla (setUsers)
    const [users, setUsers]: [UsuarioDTO[] | null, (value: UsuarioDTO[]) => void] = useState<UsuarioDTO[] | null>(null);

    // Define la lista de elementos de la tabla de usuarios (tableRows) y la función para modificarla (setTableRows)
    const [tableRows, setTableRows]: [TableRowProps[] | null, (value: TableRowProps[]) => void] = useState<TableRowProps[] | null>(null);

    // Efecto que se ejecuta al montar el componente y cuando cambian los términos de búsqueda.
    // Actualiza la lista de usuarios según los términos de búsqueda.
    useEffect((): void => {

        if(sessionAPIToken==null) return;

        (async (): Promise<void> => {
            const response: UsuarioDTO[] | FetchAPIError = await listarUsuarios(
                sessionAPIToken,
                appliedSearchTerms.size,
                appliedSearchTerms.page,
                appliedSearchTerms.fieldSort,
                appliedSearchTerms.sortDirectionAsc,
                appliedSearchTerms.filter
            );

            if (isFetchAPIError(response)) {
                const errorMessage: string = response.errorMessage;
                console.error("ERROR - lista de usuarios - table.tsx - listarUsuarios", errorMessage);
                return;
            }
            setUsers(response);
        })();
    }, [appliedSearchTerms, sessionAPIToken]);


    // Efecto que se ejecuta cuando cambia la lista de usuarios.
    // Actualiza la lista de elementos de la tabla de usuarios
    useEffect((): void => {
        if(sessionAPIToken == null) return;
        if (!users) return; // Si no hay usuarios, no hace nada

        // Procedimiento asíncrono auto-ejecutable para ejecutar código asíncrono
        (async (): Promise<void> => {
            // Crea una lista de elementos de la tabla de usuarios a partir de la lista de usuarios
            const newTableRows: TableRowProps[] = [];

            for (const usuario of users) {
                // Si el usuario no tiene un perfil lo agrega sin perfil
                if (!usuario.idPerfil) {
                    newTableRows.push({usuario});
                    continue;
                }

                console.log("antes de romperse")
                // Obtiene el perfil del usuario
                const perfil: PerfilDTO | FetchAPIError = await buscarPerfilPorId(usuario.idPerfil, sessionAPIToken);
                console.log("despues de romperse")
                // Si ocurre un error en la solicitud, muestra un mensaje de error en la consola y no lo agrega
                if (isFetchAPIError(perfil)) {
                    const errorMessage: string = perfil.errorMessage;
                    console.error("ERROR - lista de usuarios - table.tsx - buscarPerfilPorId", errorMessage);
                    continue;
                }

                // Agrega el usuario con su perfil
                newTableRows.push({usuario, perfil});
            }

            // Actualiza la lista de elementos de la tabla de usuarios
            setTableRows(newTableRows);
            calcularPaginas();
        })();

    }, [users, sessionAPIToken]);

    // ----------------------- Lista de perfiles -----------------------

    //Define la lista de perfiles para el combobox
    const perfiles: MutableRefObject<PerfilDTO[]> = useRef<PerfilDTO[]>([]);

    useEffect(() => {

        if(sessionAPIToken==null) return;

        (async (): Promise<void> => {
            //Obtener perfiles
            await listarPerfiles(sessionAPIToken).then((response: PerfilDTO[] | FetchAPIError): void => {
                if (isFetchAPIError(response)) {
                    console.error("ERROR - lista de usuarios - table.tsx - listarPerfiles", response.errorMessage);
                    return;
                }
                // Actualiza la lista de perfiles
                perfiles.current = response;
            });
        })();
    }, [props, sessionAPIToken]);

    //Metodo para calcular páginas disponibles
    function calcularPaginas(): void {

        if(sessionAPIToken==null) return;

        contarUsuariosPorInstitucion(sessionAPIToken, appliedSearchTerms.filter)
            .then((response: number | FetchAPIError) => {
                if (isFetchAPIError(response)) { //Si hay error
                    console.error("ERROR: " + response.errorMessage)
                    return 0;
                }

                //La cantidad de páginas es el total de usuarios dividido la cantidad de usuarios por página que se muestran
                const totalPages: number = Math.ceil(response / recordsPerPage)
                setNpage(totalPages); //Seteamos el número de páginas
                if (totalPages > 0 && currentPage > totalPages) { //Si el total de páginas es mayor a 0 y la página actual es mayor al total de las páginas
                    setCurrentPage(totalPages); //Seteamos la pagina actual a la ultima pagina
                }
            })
            .catch(error => {
                console.error("Error al calcular las páginas:", error);
            });
    }

    //Se ejecuta cada vez que cambia la página actual
    useEffect(() => {
        setSearchTerms({
            ...searchTerms,
            page: currentPage //Sea actualizan los parametros de búsqueda
        });

    }, [currentPage, sessionAPIToken]); //Cuando cambia la página


    // ----------------------- Eventos de la tabla de usuarios -----------------------

    // Procedimiento que se ejecuta al hacer click en el boton "Ver"

    function handleVerClick(user: UsuarioDTO): void {
        if (!props.hasPermissionObtenerUsuarios) return; //Si el cliente no tiene permisos para ver, no hace nada
        createModal({
            children: <ModalViewUserFC user={user} idAdministrador={idAdministrador}/> // Renderiza el componente como JSX
            , buttonsType: ModalButtonsType.CLOSE // Botón de cerrar
        }).show();
    }

    // Procedimiento que se ejecuta al hacer click en el botón 'Modificar'
    async function handleEditClick(user: UsuarioDTO): Promise<void> {
        if (!props.hasPermissionEdit) return; // Si el cliente no tiene permisos para modificar, no hace nada

        const modalModificar: ModalInstance = createModal({
            children: <FormModificar editingUser={user}
                                     perfilCliente={perfilCliente}
                                     sessionAPIToken={props.sessionAPIToken}
                                     isClientAdministrador={idAdministrador === props.clientID}
                                     onCancel={(): void => {
                                         createModal({
                                             children: (
                                                 <p>¿Estás seguro de que deseas cancelar la modificación del
                                                     usuario?</p>
                                             ),
                                             buttonsType: ModalButtonsType.CONFIRM_CANCEL,
                                             onConfirm: (): void => {
                                                 modalModificar.close()
                                             }
                                         }).show();
                                     }}
                                     onSave={(userModified: UsuarioDTO): void => {
                                         if (tableRows) {
                                             // Actualiza el usuario en la lista de usuarios
                                             setTableRows(tableRows.map((tableRow: TableRowProps) => {
                                                 if (tableRow.usuario.id === userModified.id) {
                                                     return {usuario: userModified};
                                                 }
                                                 return tableRow;
                                             }));
                                         }

                                         modalModificar.close(); // Cierra el modal

                                         // Refresca la lista de usuarios volviendo a cargar los términos de búsqueda después de 3 segundos
                                         refSearchTermsTimer.current = setTimeout((): void => {
                                             setAppliedSearchTerms({...appliedSearchTerms}); // Actualiza los términos de búsqueda
                                         }, 3000);
                                     }}
            />, buttonsType: ModalButtonsType.NONE
        });

        modalModificar.show();
    }

    // Procedimiento que se ejecuta al hacer clic en el checkbox de 'Activo' / 'Dado de baja' de un usuario
    async function handleAltaClick(usuario: UsuarioDTO, perfilUsuario?: PerfilDTO): Promise<void> {
        if(sessionAPIToken==null) return;
        if (!usuario.id) return; // Si el usuario no tiene un ID, no hace nada (No debería pasar)

        if (usuario.id === props.clientID) return; // Si el usuario es el cliente, no hace nada (No puede darse de baja a sí mismo)

        // Si el usuario está activo, se da de baja; si no, se reactiva
        if (usuario.activo) {
            // Si el cliente no tiene permisos para dar de baja, muestra un mensaje de error
            if (!props.hasPermissionBaja) {
                createModal({
                    children: (
                        <p>No tienes permisos para dar de baja usuarios</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();

                return;
            }

            // Sí el usuario a dar de baja es el administrador o un usuario con el mismo o mayor nivel de perfil
            // que el cliente, muestra un mensaje de error
            if (usuario.id === idAdministrador || (props.clientID != idAdministrador && (perfilUsuario && perfilCliente && perfilCliente.nivel >= perfilUsuario.nivel))) {
                createModal({
                    children: (
                        <p>No tienes permisos para dar de baja a este usuario</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();

                return;
            }

            // Muestra un modal de confirmación antes de dar de baja al usuario
            createModal({
                title: "Dando de baja a \"" + usuario.nombreUsuario + "\"",
                children: (
                    <>
                        <p>Estas por dar de baja al usuario <b>&quot;{usuario.nombreUsuario}&quot;</b>.</p>
                        <p>¿Desea continuar?</p>
                    </>
                ),
                buttonsType: ModalButtonsType.CONFIRM_CANCEL,
                async onConfirm(): Promise<void> { // Acción al confirmar
                    // Da de baja al usuario en la API
                    const response: void | FetchAPIError = await darBajaUsuario(usuario.id as number, sessionAPIToken);
                    if (isFetchAPIError(response)) {
                        const errorMessage: string = response.errorMessage;
                        // Muestra un mensaje de error al dar de baja al usuario
                        createModal({
                            children: (
                                <p>Error al dar de baja al usuario: {errorMessage}</p>
                            ),
                            buttonsType: ModalButtonsType.CONFIRM
                        }).show();
                        console.error("ERROR - lista de usuarios - table.tsx - handleAltaClick - darBajaUsuario", errorMessage);
                        return;
                    }

                    usuario.activo = false; // Actualiza el estado del usuario

                    // Muestra un mensaje de éxito al dar de baja al usuario
                    createModal({
                        children: (
                            <p>Usuario <b>&quot;{usuario.nombreUsuario}&quot;</b> dado de baja correctamente</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();

                    // Refresca la lista de usuarios volviendo a cargar los términos de búsqueda después de 3 segundos
                    refSearchTermsTimer.current = setTimeout((): void => {
                        setAppliedSearchTerms({...appliedSearchTerms}); // Actualiza los términos de búsqueda
                    }, 3000);
                },
                onCancel: (): void => { // Acción al cancelar
                    // Muestra un mensaje de cancelación
                    createModal({
                        title: "Baja cancelada",
                        children: (
                            <p>Baja cancelada</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                }
            }).show();
        } else {
            if (!props.hasPermissionReactivar) return; // Si el cliente no tiene permisos para reactivar, no hace nada

            // Muestra un modal de confirmación antes de reactivar al usuario
            createModal({
                title: "Reactivando a \"" + usuario.nombreUsuario + "\"",
                children: (
                    <>
                        <p>Estas por reactivar al usuario <b>&quot;{usuario.nombreUsuario}&quot;</b>.</p>
                        <p>¿Desea continuar?</p>
                    </>
                ),
                buttonsType: ModalButtonsType.CONFIRM_CANCEL,
                async onConfirm(): Promise<void> { // Acción al confirmar
                    // Reactiva al usuario en la API
                    const response: void | FetchAPIError = await reactivarUsuario(usuario.id as number, sessionAPIToken);

                    if (isFetchAPIError(response)) {
                        const errorMessage: string = response.errorMessage;
                        // Muestra un mensaje de error al reactivar al usuario
                        createModal({
                            children: (
                                <p>Error al reactivar al usuario: {errorMessage}</p>
                            ),
                            buttonsType: ModalButtonsType.CONFIRM
                        }).show();
                        console.error("ERROR - lista de usuarios - table.tsx - handleAltaClick - reactivarUsuario", errorMessage);
                        return;
                    }

                    usuario.activo = true; // Actualiza el estado del usuario

                    // Muestra un mensaje de éxito al reactivar al usuario
                    createModal({
                        children: (
                            <p>Usuario <b>&quot;{usuario.nombreUsuario}&quot;</b> reactivado correctamente</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();

                    // Refresca la lista de usuarios volviendo a cargar los términos de búsqueda después de 3 segundos
                    refSearchTermsTimer.current = setTimeout((): void => {
                        setAppliedSearchTerms({...appliedSearchTerms}); // Actualiza los términos de búsqueda
                    }, 3000);
                },
                onCancel(): void { // Acción al cancelar
                    // Muestra un mensaje de cancelación
                    createModal({
                        children: (
                            <p>Reactivación cancelada</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                }
            }).show();
        }
    }

// --------------------------------------------------------------------------------------------

// Si los elementos de la tabla no se han cargado, muestra la página de carga
    if (!tableRows) return <LoadingPage/>

// Retorna el JSX del componente (Tabla de usuarios)
    return (
        <div className={stylesTable.containerPage}>
            {/*Tabla de usuarios*/}
            <div className={stylesTable.containerTable}>

                <div className={stylesTable.scroll}>     {tableRows.length > 0 ? (
                    <table>
                        <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Correo</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Perfil</th>
                            <th>Estado</th>
                            <th></th>
                            <th></th>
                            <th>Activo</th>
                        </tr>
                        </thead>
                        <tbody>

                        {tableRows.map(({usuario, perfil}: TableRowProps) => (
                            <tr key={usuario.id}>
                                <td>{usuario.nombreUsuario}</td>
                                <td>{usuario.email}</td>
                                <td>{usuario.primerNombre} {usuario.segundoNombre}</td>
                                <td>{usuario.primerApellido} {usuario.segundoApellido}</td>
                                {perfil && (
                                    <td>{perfil.nombre}</td>
                                )}
                                {!perfil && (
                                    <td>{idAdministrador === usuario.id ? "Administrador" : "Sin perfil"}</td>
                                )}
                                {usuario.activo ?
                                    (
                                        <td>{translateUsuarioEstadoEnum(usuario.estado)}</td>
                                    )
                                    :
                                    (
                                        <td>Dado de baja</td>
                                    )
                                }

                                {props.hasPermissionObtenerUsuarios ?
                                    <td>
                                        <button onClick={() => handleVerClick(usuario)}>Ver</button>
                                    </td>
                                    :
                                    <td></td>
                                }
                                <td>
                                    {props.hasPermissionEdit && usuario.id !== props.clientID && usuario.id !== idAdministrador && (
                                        <>
                                            {(idAdministrador === props.clientID || !perfil || (perfilCliente && perfilCliente.nivel < perfil.nivel)) && (
                                                <button onClick={() => handleEditClick(usuario)}>
                                                    Modificar
                                                </button>
                                            )}
                                        </>
                                    )}
                                </td>
                                <td>
                                    {usuario.id !== props.clientID && (
                                        <input
                                            {...(usuario.activo ? {checked: true} : {checked: false})}
                                            type="checkbox"
                                            onChange={() => handleAltaClick(usuario, perfil)}
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <h3>No se encontraron usuarios</h3>
                )}
                </div>

                {tableRows.length > 0 && (
                    <div className={stylesTable.pagination}>
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}

                        >
                            Anterior
                        </button>

                        {currentPage > 4 && (
                            <>
                                <button
                                    key={1}
                                    onClick={() => setCurrentPage(1)}
                                >
                                    {1}
                                </button>
                                <span>...</span>
                            </>
                        )}

                        {Array.from({length: 3}, (_, index) => {

                            const num = currentPage - (index + 1);
                            if (num < 1 || currentPage == 1) return;
                            return (
                                <button
                                    key={num}
                                    onClick={() => setCurrentPage(num)}
                                >
                                    {num}
                                </button>
                            )
                        }).reverse()}

                        <button
                            key={currentPage}
                            className={stylesTable.activePage}
                        >
                            {currentPage}
                        </button>

                        {Array.from({length: 3}, (_, index) => {
                            const num = currentPage + (index + 1);
                            if (num > npage) return;
                            return (
                                <button
                                    key={num}
                                    onClick={() => setCurrentPage(num)}
                                >
                                    {num}
                                </button>
                            )
                        })}

                        {currentPage < npage - 3 && (
                            <>
                                <span>...</span>
                                <button
                                    key={npage}
                                    onClick={() => setCurrentPage(npage)}
                                >
                                    {npage}
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === npage}
                        >
                            Siguiente
                        </button>

                    </div>
                )}

                <div className={stylesTable.filtersContainer}>
                    <div className={stylesTable.filtersContainerInputs}>
                        <input
                            type="text"
                            name="nombreUsuario"
                            placeholder="Buscar por usuario"
                            value={searchTerms.filter.nombreUsuario ? searchTerms.filter.nombreUsuario : ""}
                            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        nombreUsuario: event.target.value ? event.target.value : undefined
                                    }
                                });
                            }}
                        />
                        <input
                            type="text"
                            name="email"
                            placeholder="Buscar por correo"
                            value={searchTerms.filter.email ? searchTerms.filter.email : ""}
                            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        email: event.target.value ? event.target.value : undefined
                                    }
                                });
                            }}
                        />
                        <input
                            type="text"
                            name="primerNombre"
                            placeholder="Buscar por primer nombre"
                            value={searchTerms.filter.primerNombre ? searchTerms.filter.primerNombre : ""}
                            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        primerNombre: event.target.value ? event.target.value : undefined
                                    }
                                });
                            }}
                        />
                        <input
                            type="text"
                            name="segundoNombre"
                            placeholder="Buscar por segundo nombre"
                            value={searchTerms.filter.segundoNombre ? searchTerms.filter.segundoNombre : ""}
                            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        segundoNombre: event.target.value ? event.target.value : undefined
                                    }
                                });
                            }}
                        />
                        <input
                            type="text"
                            name="primerApellido"
                            placeholder="Buscar por primer apellido"
                            value={searchTerms.filter.primerApellido ? searchTerms.filter.primerApellido : ""}
                            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        primerApellido: event.target.value ? event.target.value : undefined
                                    }
                                });
                            }}
                        />
                        <input
                            type="text"
                            name="segundoApellido"
                            placeholder="Buscar por segundo apellido"
                            value={searchTerms.filter.segundoApellido ? searchTerms.filter.segundoApellido : ""}
                            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        segundoApellido: event.target.value ? event.target.value : undefined
                                    }
                                });
                            }}
                        />

                        <ComboBoxFC
                            message={"Todos los perfiles"}
                            messageSelectable={true}
                            elements={perfiles.current.map((perfil: PerfilDTO): {
                                key: number,
                                value: string
                            } => ({
                                key: perfil.id as number,
                                value: perfil.nombre
                            }))}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        perfil: e.target.value !== "" ? perfiles.current.find((perfil: PerfilDTO):
                                        boolean => perfil.id === Number(e.target.value))?.nombre : undefined
                                    }
                                });
                            }}
                        />
                        <select
                            name="estado"
                            value={searchTerms.filter.estado ? searchTerms.filter.estado : ""}
                            onChange={(event: ChangeEvent<HTMLSelectElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        estado: event.target.value as UsuarioEstadoEnum
                                    }
                                });
                            }}
                        >
                            <option value="">Todos los estados</option>
                            {Object.values(UsuarioEstadoEnum).map((estado) => (
                                <option key={estado} value={estado}>
                                    {estado}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={stylesTable.filtersContainerButtons}>
                        <label>
                            <input
                                type="radio"
                                name="activo"
                                value="true"
                                checked={searchTerms.filter.activo === true}
                                onChange={(): void => {
                                    setSearchTerms({
                                        ...searchTerms,
                                        filter: {
                                            ...searchTerms.filter,
                                            activo: true
                                        }
                                    });
                                }}/>Usuarios activos</label>
                        <label>
                            <input
                                type="radio"
                                name="activo"
                                value="false"
                                checked={searchTerms.filter.activo === false}
                                onChange={(): void => {
                                    setSearchTerms({
                                        ...searchTerms,
                                        filter: {
                                            ...searchTerms.filter,
                                            activo: false
                                        }
                                    });
                                }}/>Dados de baja</label>
                        <label>
                            <input
                                type="radio"
                                name="activo"
                                value="undefined"
                                checked={searchTerms.filter.activo === undefined}
                                onChange={(): void => {
                                    setSearchTerms({
                                        ...searchTerms,
                                        filter: {
                                            ...searchTerms.filter,
                                            activo: undefined
                                        }
                                    });
                                }}
                            />Todos</label>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Exporta el componente (Tabla de usuarios)
export default TableUsersFC;

