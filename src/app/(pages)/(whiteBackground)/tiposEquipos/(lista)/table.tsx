"use client";

import React, {ChangeEvent, MutableRefObject, ReactElement, useEffect, useRef, useState} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import TipoEquipoDTO from "@/types/dtos/TipoEquipoDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {darBajaTipoEquipo, listarTiposEquipo, reactivarTipoEquipo} from "@/services/TipoEquipoService";
import TipoEquipoFilter from "@/types/filters/TipoEquipoFilter";
import stylesTable from "@public/styles/modules/table/table.tipoequipos.module.css";
import {ModalInstance} from "@/app/hooks/modals/ModalProvider";
import EditTipoEquipoForm from "@/app/(pages)/(whiteBackground)/tiposEquipos/(lista)/formEdit";
import {ModalButtonsType} from "@/components/ModalFC";

/**
 *  Propiedades del componente TableTiposEquiposFC
 *  @interface TableTiposEquipoFCProps
 *  @property {string} sessionAPIToken - Token de la sesión del cliente en la API
 *  @property {boolean} hasPermissionEdit - Indica si el cliente tiene permisos para editar
 *  @property {boolean} hasPermissionBaja - Indica si el cliente tiene permisos para dar de baja
 *  @property {boolean} hasPermissionView - Indica si el cliente tiene permisos para ver
 *  @property {number} idInstitucion - ID de la institución del cliente
 **/

interface TableTiposEquipoFCProps {
    sessionAPIToken: string;
    hasPermissionEdit: boolean;
    hasPermissionBaja: boolean;
    hasPermissionReactivar: boolean;
    hasPermissionView: boolean;
    idInstitucion: number;
}

/**
 * Propiedades de los filtros de la tabla
 **/

interface TableSearchTermsProps{
    filter: TipoEquipoFilter;
}

function TableTiposEquiposFC(props: Readonly<TableTiposEquipoFCProps>): ReactElement{

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    // ----------------------- Términos de búsqueda  -----------------------

    // Define los términos de búsqueda introducidos por el usuario en tiempo real (searchTerms)
    // y la función para modificarlos (setSearchTerms)
    const [searchTerms, setSearchTerms]: [TableSearchTermsProps, (value: TableSearchTermsProps) => void]
        = useState<TableSearchTermsProps>({
        filter: {activo: true}
    });

    // Define los términos de búsqueda aplicados en la tabla de tipos de equipos (appliedSearchTerms)
    // y la función para modificarlos (setAppliedSearchTerms)
    const [appliedSearchTerms, setAppliedSearchTerms]: [TableSearchTermsProps, (value: TableSearchTermsProps) => void]
        = useState<TableSearchTermsProps>(searchTerms);

    // Define un ref (Referencia mutable) para el temporizador que actualiza los términos de búsqueda aplicados
    // (Ejecuta una acción después de un tiempo determinado)
    const refSearchTermsTimer: MutableRefObject<NodeJS.Timeout | null> = useRef<NodeJS.Timeout | null>(null);

    // Efecto que se ejecuta cuando cambian los términos de búsqueda introducidos por el usuario
    // Reinicia el temporizador para actualizar los términos de búsqueda aplicados con los introducidos por el usuario
    // (Esto evita que se realicen múltiples actualizaciones en un corto período de tiempo, por ejemplo por cada letra que se escribe o borra)
    useEffect((): void => {
        // Si hay un temporizador en ejecución, lo cancela para evitar múltiples ejecuciones
        if (refSearchTermsTimer.current !== null) {
            clearTimeout(refSearchTermsTimer.current);
        }

        // Crea un nuevo temporizador usando requestIdleCallback
        refSearchTermsTimer.current = setTimeout((): void => {
            setAppliedSearchTerms(searchTerms); // Actualiza los términos de búsqueda
        }, 500); // Establece un temporizador de 0.5 segundos

    }, [searchTerms]);

    // ----------------------- Lista de tipos de equipo -----------------------

    //Define la lista de tipos de equipos a mostrar en la tabla
    const [tiposEquipos, setTiposEquipos] = useState<TipoEquipoDTO[]>([]);

    // Efecto que se ejecuta al montar el componente y cuando cambian los términos de búsqueda.
    // Actualiza la lista de tipos de equipo según los términos de búsqueda.
    useEffect((): void => {
        // Procedimiento asíncrono auto-ejecutable para ejecutar código asíncrono
        (async (): Promise<void> => {
            // Obtiene la lista de equipos de la API
            const response: TipoEquipoDTO[] | FetchAPIError = await listarTiposEquipo(props.sessionAPIToken, appliedSearchTerms.filter);

            // Si ocurre un error en la solicitud, muestra un mensaje de error en la consola y no hace nada
            if (isFetchAPIError(response)) {
                const errorMessage: string = response.errorMessage;
                console.error("ERROR - lista de equipos - table.tsx - listarEquipos", errorMessage);
                return;
            }
            // Guarda la lista de equipos
            setTiposEquipos(response);
        })();

    }, [appliedSearchTerms]);

    // Procedimiento que se ejecuta al hacer clic en el botón 'Modificar'
    async function handleEditClick (tipoEquipo: TipoEquipoDTO): Promise<void> {
        if (!props.hasPermissionEdit) {return} // Si el cliente no tiene permisos para modificar, no hace nada

        // Crea un modal para modificar el tipo de equipo
         const modalModificar: ModalInstance = createModal({
            children: (
                <EditTipoEquipoForm
                    sessionAPIToken={props.sessionAPIToken}
                    idInstitucion={props.idInstitucion}
                    editingTipoEquipo={tipoEquipo}
                    onSave={(tipoEquipoModified: TipoEquipoDTO): void => {
                        if (tiposEquipos) {
                            // Actualiza el equipo en la lista
                            setTiposEquipos(tiposEquipos.map((tipoEquipo: TipoEquipoDTO): TipoEquipoDTO => {
                                if (tipoEquipoModified.id === tipoEquipo.id) {
                                    return tipoEquipoModified;
                                }
                                return tipoEquipo;
                            }));
                        }

                        modalModificar.close(); // Cierra el modal

                        // Refresca la lista volviendo a cargar los términos de búsqueda después de 3 segundos
                        refSearchTermsTimer.current = setTimeout((): void => {
                            setAppliedSearchTerms({...appliedSearchTerms}); // Actualiza los términos de búsqueda
                        }, 1000);
                    }}
                    onCancel={(): void => {
                        createModal({
                            children: (
                                <p>¿Estás seguro de que deseas cancelar la modificación del equipo?</p>
                            ),
                            buttonsType: ModalButtonsType.CONFIRM_CANCEL,
                            onConfirm: (): void => {
                                modalModificar.close()
                            }
                        }).show();
                    }}
                />
            ),
            buttonsType: ModalButtonsType.NONE
        });

        modalModificar.show();
    }

    // Procedimiento que se ejecuta al hacer clic en el botón 'Eliminar'
    const handleEliminarClick = (tipoEquipoSelected: TipoEquipoDTO): void => {
        if (!tipoEquipoSelected.activo) { // Si el tipo de equipo está inactivo, entonces se reactiva
            if (!props.hasPermissionReactivar) { // Verifica si el usuario tiene permiso para reactivar
                createModal({
                    children: (
                        <p>No tienes permisos para reactivar el tipo de equipo</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();
                return;
            }

            // Crea un modal para confirmar la reactivación del tipo de equipo
            createModal({
                title: `Reactivando "${tipoEquipoSelected.nombre}"`,
                children: (
                    <>
                        <p>Estás por reactivar el tipo de equipo <b>&quot;{tipoEquipoSelected.nombre}&quot;</b>.</p>
                        <p>¿Desea continuar?</p>
                    </>
                ),
                buttonsType: ModalButtonsType.CONFIRM_CANCEL,
                async onConfirm(): Promise<void> { // Acción al confirmar
                    // Realiza la reactivación del tipo de equipo en la API
                    const response: void | FetchAPIError = await reactivarTipoEquipo(tipoEquipoSelected.id as number, props.sessionAPIToken);
                    if (isFetchAPIError(response)) {
                        // Si ocurre un error en la solicitud, muestra un mensaje de error
                        const errorMessage: string = response.errorMessage;
                        createModal({
                            children: (
                                <p>Error al reactivar el tipo de equipo: {errorMessage}</p>
                            ),
                            buttonsType: ModalButtonsType.CONFIRM
                        }).show();
                        console.error('ERROR - Reactivar Tipo de Equipo - table.tsx - handleEliminarClick - reactivarTipoEquipo', response);
                        return;
                    }

                    tipoEquipoSelected.activo = true; // Actualiza el estado del tipo de equipo a activo

                    // Muestra un mensaje de éxito al reactivar el tipo de equipo
                    createModal({
                        children: (
                            <p>Tipo de equipo con nombre: &quot;{tipoEquipoSelected.nombre}&quot; reactivado correctamente</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();

                    refSearchTermsTimer.current = setTimeout((): void => {
                        setAppliedSearchTerms({...appliedSearchTerms}); // Actualiza los términos de búsqueda
                    }, 1000);
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
        } else { // Si el tipo de equipo está activo, entonces se da de baja
            if (!props.hasPermissionBaja) { // Si el cliente no tiene permisos para dar de baja, muestra un mensaje de error
                createModal({
                    children: (
                        <p>No tienes permisos para dar de baja tipos de equipos</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();
                return;
            }

            // Crea un modal para confirmar la baja del tipo de equipo
            createModal({
                title: `Dando de baja a "${tipoEquipoSelected.nombre}"`,
                children: (
                    <>
                        <p>Estás por dar de baja el tipo de equipo <b>&quot;{tipoEquipoSelected.nombre}&quot;</b>.</p>
                        <p>¿Desea continuar?</p>
                    </>
                ),
                buttonsType: ModalButtonsType.CONFIRM_CANCEL,
                async onConfirm(): Promise<void> { // Acción al confirmar
                    // Realiza la baja del tipo de equipo en la API
                    const response: void | FetchAPIError = await darBajaTipoEquipo(tipoEquipoSelected.id as number, props.sessionAPIToken);
                    if (isFetchAPIError(response)) {
                        // Si ocurre un error en la solicitud, muestra un mensaje de error
                        const errorMessage: string = response.errorMessage;
                        createModal({
                            children: (
                                <p>Error al dar de baja el tipo de equipo: {errorMessage}</p>
                            ),
                            buttonsType: ModalButtonsType.CONFIRM
                        }).show();
                        console.error('ERROR - Dar de baja Tipo de Equipo - table.tsx - handleEliminarClick - darBajaTipoEquipo', response);
                        return;
                    }

                    tipoEquipoSelected.activo = false; // Actualiza el estado del tipo de equipo a inactivo

                    // Muestra un mensaje de éxito al dar de baja el tipo de equipo
                    createModal({
                        children: (
                            <p>Tipo de equipo con nombre: &quot;{tipoEquipoSelected.nombre}&quot; dado de baja correctamente</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();

                    refSearchTermsTimer.current = setTimeout((): void => {
                        setAppliedSearchTerms({...appliedSearchTerms}); // Actualiza los términos de búsqueda
                    }, 1000);
                },
                onCancel(): void { // Acción al cancelar
                    // Muestra un mensaje de cancelación
                    createModal({
                        title: "Baja Cancelada",
                        children: (
                            <p>Baja cancelada</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                }
            }).show();
        }
    };


    return(
        <div className={stylesTable.containerPage}>
            <div className={stylesTable.containerTable}>
                <div className={stylesTable.scroll}>
                    {tiposEquipos.length > 0 ? (
                        <table style={{width: "100%"}}>
                            <thead>
                            <tr>
                                <th>Nombre</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {tiposEquipos.map((tiposEquipo: TipoEquipoDTO) => (
                                <tr key={tiposEquipo.id}>
                                    <td>{tiposEquipo.nombre}</td>
                                    {props.hasPermissionEdit ?
                                        <td>
                                            <button onClick={() => handleEditClick(tiposEquipo)}>Modificar</button>
                                        </td>
                                        :
                                        <td></td>
                                    }
                                    {props.hasPermissionBaja || props.hasPermissionReactivar ? (
                                        <td>
                                            <button onClick={(): void => handleEliminarClick(tiposEquipo)}>
                                                {tiposEquipo.activo ? 'Eliminar' : 'Reactivar'}
                                            </button>
                                        </td>
                                    ) : (
                                        <td></td>
                                    )}
                                </tr>

                            ))}
                            </tbody>
                        </table>) : <h3>No se encontraron equipos</h3>}
                </div>
                <div className={stylesTable.filtersContainer}>
                    <div className={stylesTable.filtersContainerInputs}>
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Buscar por nombre"
                            value={searchTerms.filter.nombre ? searchTerms.filter.nombre : ''}
                            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        nombre: event.target.value ? event.target.value : undefined
                                    }
                                });
                            }}
                        />
                    </div>
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
                            }}/>Activos</label>
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
    );
}

export default TableTiposEquiposFC;


