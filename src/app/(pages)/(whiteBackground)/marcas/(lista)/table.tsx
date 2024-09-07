"use client";

import MarcaFilter from "@/types/filters/MarcaFilter";
import React, {ChangeEvent, MutableRefObject, ReactElement, useEffect, useRef, useState} from "react";
import { useModal } from "@/app/hooks/modals/useModal";
import MarcaDTO from "@/types/dtos/MarcaDTO";
import FetchAPIError, { isFetchAPIError } from "@/types/errors/FetchAPIError";
import {darBajaMarca, listarMarcas} from "@/services/MarcaService";
import stylesTable from "@public/styles/modules/table/table.equipos.module.css";
import {ModalInstance} from "@/app/hooks/modals/ModalProvider";
import {ModalButtonsType} from "@/components/ModalFC";
import EditMarcaForm from "@/app/(pages)/(whiteBackground)/marcas/(lista)/formEdit";


/**
 *  Propiedades del componente TableTiposEquiposFC
 *  @interface TableMarcaFCProps
 *  @property {string} sessionAPIToken - Token de la sesión del cliente en la API
 *  @property {boolean} hasPermissionEdit - Indica si el cliente tiene permisos para editar
 *  @property {boolean} hasPermissionBaja - Indica si el cliente tiene permisos para dar de baja
 *  @property {boolean} hasPermissionView - Indica si el cliente tiene permisos para ver
 *  @property {number} idInstitucion - ID de la institución del cliente
 **/
interface TableMarcaFCProps {
    sessionAPIToken: string;
    hasPermissionEdit: boolean;
    hasPermissionBaja: boolean;
    hasPermissionView: boolean;
    idInstitucion: number;
}

interface TableSearchTermsProps {
    filter: MarcaFilter;
}

function TableMarcaFC(props: Readonly<TableMarcaFCProps>): ReactElement {

    // ----------------------- Modales -----------------------
    const {createModal} = useModal();

    // ----------------------- Términos de búsqueda  -----------------------
    const [searchTerms, setSearchTerms]: [TableSearchTermsProps, (value: TableSearchTermsProps) => void]
        = useState<TableSearchTermsProps>({
        filter: {activo: true}
    });

    const [appliedSearchTerms, setAppliedSearchTerms]: [TableSearchTermsProps, (value: TableSearchTermsProps) => void]
        = useState<TableSearchTermsProps>(searchTerms);

    const refSearchTermsTimer: MutableRefObject<NodeJS.Timeout | null> = useRef<NodeJS.Timeout | null>(null);

    useEffect((): void => {
        if (refSearchTermsTimer.current !== null) {
            clearTimeout(refSearchTermsTimer.current);
        }

        refSearchTermsTimer.current = setTimeout((): void => {
            setAppliedSearchTerms(searchTerms);
        }, 500);
    }, [searchTerms]);

    // ----------------------- Lista de marcas -----------------------
    const [marcas, setMarca] = useState<MarcaDTO[]>([]);

    useEffect((): void => {
        (async (): Promise<void> => {
            const response: MarcaDTO[] | FetchAPIError = await listarMarcas(props.sessionAPIToken, appliedSearchTerms.filter);

            if (isFetchAPIError(response)) {
                const errorMessage: string = response.errorMessage;
                console.error("ERROR - lista de marcas", errorMessage);
                return;
            }

            setMarca(response);
        })();
    }, [appliedSearchTerms]);

    // Procedimiento que se ejecuta al hacer clic en el botón 'Modificar'
    async function handleEditClick(marca: MarcaDTO): Promise<void> {
        if (!props.hasPermissionEdit) {
            return
        }

        // Crea un modal para modificar el tipo de equipo
        const modalModificar: ModalInstance = createModal({
            children: (
                <EditMarcaForm
                    sessionAPIToken={props.sessionAPIToken}
                    idInstitucion={props.idInstitucion}
                    editingMarca={marca}
                    onSave={(marcaModified: MarcaDTO): void => {
                        if (marcas) {
                            // Actualiza el equipo en la lista
                            setMarca(marcas.map((marca: MarcaDTO): MarcaDTO => {
                                if (marcaModified.id === marca.id) {
                                    return marcaModified;
                                }
                                return marca;
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
                                <p>¿Estás seguro de que deseas cancelar la modificación de la marca?</p>
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
        const handleEliminarClick = (marcaSelected: MarcaDTO): void => {
            if (!props.hasPermissionBaja) { // Si el cliente no tiene permisos para dar de baja, muestra un mensaje de error
                createModal({
                    children: (
                        <p>No tienes permisos para dar de baja la marca</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();

                return;
            }

            // Crea un modal para confirmar la baja de marca
            createModal({
                title: "Dando de baja a \"" + marcaSelected.nombre + "\"",
                children: (
                    <>
                        <p>Estas por dar de baja la marca <b>&quot;{marcaSelected.nombre}&quot;</b>.</p>
                        <p>¿Desea continuar?</p>
                    </>
                ),
                buttonsType: ModalButtonsType.CONFIRM_CANCEL,
                async onConfirm(): Promise<void> { //Acción al confirmar
                    // Realiza la baja de marca en la API
                    const response: void | FetchAPIError = await darBajaMarca(marcaSelected.id as number, props.sessionAPIToken);
                    if (isFetchAPIError(response)) {
                        // Si ocurre un error en la solicitud, muestra un mensaje de error
                        const errorMessage: string = response.errorMessage;
                        createModal({
                            children: (
                                <p>Error al dar de baja de marca: {errorMessage}</p>
                            ),
                            buttonsType: ModalButtonsType.CONFIRM
                        }).show();
                        console.error('ERROR - Dar de baja Marca - table.tsx - handleEliminarClick - darBajamarca', response);
                        return;
                    }

                    marcaSelected.activo = false; // Actualiza el estado de marca a inactivo

                    // Muestra un mensaje de éxito al dar de baja la marca
                    createModal({
                        children: (
                            <p>Marca con nombre: &quot;{marcaSelected.nombre}&quot; dado de baja correctamente</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();

                    refSearchTermsTimer.current = setTimeout((): void => {
                        setAppliedSearchTerms({...appliedSearchTerms}); // Actualiza los términos de búsqueda
                    }, 1000);
                },
                onCancel(): void { //Acción al cancelar
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

    return(
        <div className={stylesTable.containerPage}>
            <div className={stylesTable.containerTable}>
                <div className={stylesTable.scroll}>
                    {marcas.length > 0 ? (
                        <table style={{width: "100%"}}>
                            <thead>
                            <tr>
                                <th>Nombre</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {marcas.map((marca: MarcaDTO) => (
                                <tr key={marca.id}>
                                    <td>{marca.nombre}</td>
                                    {props.hasPermissionEdit ?
                                        <td>
                                            <button onClick={() => handleEditClick(marca)}>Modificar</button>
                                        </td>
                                        :
                                        <td></td>
                                    }
                                    {props.hasPermissionBaja ?
                                        <td>
                                            <button onClick={(): void => handleEliminarClick(marca)}>Eliminar
                                            </button>
                                        </td>
                                        :
                                        <td></td>
                                    }
                                </tr>

                            ))}
                            </tbody>
                        </table>) : <h3>No se encontraron marcas</h3>}
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
    export default TableMarcaFC;
