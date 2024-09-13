"use client";

import ModeloFilter from "@/types/filters/ModeloFilter";
import React, { ChangeEvent, MutableRefObject, ReactElement, useEffect, useRef, useState } from "react";
import { useModal } from "@/app/hooks/modals/useModal";
import ModeloDTO from "@/types/dtos/ModeloDTO";
import FetchAPIError, { isFetchAPIError } from "@/types/errors/FetchAPIError";
import { darBajaModelo, listarModelos } from "@/services/ModeloService";
import stylesTable from "@public/styles/modules/table/table.tipoequipos.module.css";
import { ModalInstance } from "@/app/hooks/modals/ModalProvider";
import { ModalButtonsType } from "@/components/ModalFC";
import EditModeloForm from "@/app/(pages)/(whiteBackground)/modelos/(lista)/formEdit";


/**
 *  Propiedades del componente TableModeloFC
 *  @interface TableModeloFCProps
 *  @property {string} sessionAPIToken - Token de la sesión del cliente en la API
 *  @property {boolean} hasPermissionEdit - Indica si el cliente tiene permisos para editar
 *  @property {boolean} hasPermissionBaja - Indica si el cliente tiene permisos para dar de baja
 *  @property {boolean} hasPermissionView - Indica si el cliente tiene permisos para ver
 *  @property {number} idInstitucion - ID de la institución del cliente
 **/
interface TableModeloFCProps {
    sessionAPIToken: string;
    hasPermissionEdit: boolean;
    hasPermissionBaja: boolean;
    hasPermissionView: boolean;
    idInstitucion: number;
}

interface TableSearchTermsProps {
    filter: ModeloFilter;
}

function TableModeloFC(props: Readonly<TableModeloFCProps>): ReactElement {

    // ----------------------- Modales -----------------------
    const { createModal } = useModal();

    // ----------------------- Términos de búsqueda  -----------------------
    const [searchTerms, setSearchTerms]: [TableSearchTermsProps, (value: TableSearchTermsProps) => void]
        = useState<TableSearchTermsProps>({
        filter: { activo: true }
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

    // ----------------------- Lista de modelos -----------------------
    const [modelos, setModelos] = useState<ModeloDTO[]>([]);

    useEffect((): void => {
        (async (): Promise<void> => {

            const response: ModeloDTO[] | FetchAPIError = await listarModelos(props.sessionAPIToken, appliedSearchTerms.filter);

            if (isFetchAPIError(response)) {
                const errorMessage: string = response.errorMessage;
                console.error("ERROR - lista de modelos", errorMessage);
                return;
            }
            console.log(response);
            setModelos(response);
        })();
    }, [appliedSearchTerms]);

    // Procedimiento que se ejecuta al hacer clic en el botón 'Modificar'
    async function handleEditClick(modelo: ModeloDTO): Promise<void> {
        if (!props.hasPermissionEdit) { return; }

        // Crea un modal para modificar el tipo de equipo
        const modalModificar: ModalInstance = createModal({
            children: (
                <EditModeloForm
                    sessionAPIToken={props.sessionAPIToken}
                    idInstitucion={props.idInstitucion}
                    editingModelo={modelo}
                    onSave={(modeloModified: ModeloDTO): void => {
                            setModelos(modelos.map((modelo: ModeloDTO): ModeloDTO => {
                                return modelo.id === modeloModified.id ? modeloModified : modelo;
                            }));
                        modalModificar.close(); // Cierra el modal
                        // Refresca la lista volviendo a cargar los términos de búsqueda después de 3 segundos
                        refSearchTermsTimer.current = setTimeout((): void => {
                            setAppliedSearchTerms({ ...appliedSearchTerms }); // Actualiza los términos de búsqueda
                        }, 1000);
                    }}
                    onCancel={(): void => {
                        createModal({
                            children: (
                                <p>¿Estás seguro de que deseas cancelar la modificación del modelo?</p>
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
    const handleEliminarClick = (modeloSelected: ModeloDTO): void => {
        if (!props.hasPermissionBaja) { // Si el cliente no tiene permisos para dar de baja, muestra un mensaje de error
            createModal({
                children: (
                    <p>No tienes permisos para dar de baja el modelo</p>
                ),
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        // Crea un modal para confirmar la baja de modelo
        createModal({
            title: "Dando de baja a \"" + modeloSelected.nombre + "\"",
            children: (
                <>
                    <p>Estas por dar de baja el modelo <b>&quot;{modeloSelected.nombre}&quot;</b>.</p>
                    <p>¿Desea continuar?</p>
                </>
            ),
            buttonsType: ModalButtonsType.CONFIRM_CANCEL,
            async onConfirm(): Promise<void> { //Acción al confirmar
                // Realiza la baja de modelo en la API
                const response: void | FetchAPIError = await darBajaModelo(modeloSelected.id as number, props.sessionAPIToken);
                if (isFetchAPIError(response)) {
                    // Si ocurre un error en la solicitud, muestra un mensaje de error
                    const errorMessage: string = response.errorMessage;
                    createModal({
                        children: (
                            <p>Error al dar de baja de modelo: {errorMessage}</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                    console.error('ERROR - Dar de baja Modelo - table.tsx - handleEliminarClick - darBajaModelo', response);
                    return;
                }

                modeloSelected.activo = false; // Actualiza el estado de modelo a inactivo

                // Muestra un mensaje de éxito al dar de baja el modelo
                createModal({
                    children: (
                        <p>Modelo con nombre: &quot;{modeloSelected.nombre}&quot; dado de baja correctamente</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();

                refSearchTermsTimer.current = setTimeout((): void => {
                    setAppliedSearchTerms({ ...appliedSearchTerms }); // Actualiza los términos de búsqueda
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

    return (
        <div className={stylesTable.containerPage}>
            <div className={stylesTable.containerTable}>
                <div className={stylesTable.scroll}>
                    {modelos.length > 0 ? (
                        <table style={{ width: "100%" }}>
                            <thead>
                            <tr>
                                <th>Nombre</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {modelos.map((modelo: ModeloDTO) => (
                                <tr key={modelo.id}>
                                    <td>{modelo.nombre}</td>
                                    {props.hasPermissionEdit ?
                                        <td>
                                            <button onClick={() => handleEditClick(modelo)}>Modificar</button>
                                        </td>
                                        :
                                        <td></td>
                                    }
                                    {props.hasPermissionBaja ?
                                        <td>
                                            <button onClick={(): void => handleEliminarClick(modelo)}>Eliminar</button>
                                        </td>
                                        :
                                        <td></td>
                                    }
                                </tr>

                            ))}
                            </tbody>
                        </table>) : <h3>No se encontraron modelos</h3>}
                </div>
                <div className={stylesTable.filtersContainer}>
                    <div className={stylesTable.filtersContainerInputs}>
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Buscar por nombre"
                            value={searchTerms.filter.nombre || ''}
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
                                    filter: { ...searchTerms.filter, activo: true }
                                });
                            }}
                        />Activos
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="activo"
                            value="false"
                            checked={searchTerms.filter.activo === false}
                            onChange={(): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: { ...searchTerms.filter, activo: false }
                                });
                            }}
                        />Dados de baja
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="activo"
                            value="undefined"
                            checked={searchTerms.filter.activo === undefined}
                            onChange={(): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: { ...searchTerms.filter, activo: undefined }
                                });
                            }}
                        />Todos
                    </label>
                </div>
            </div>
        </div>
    );
}

export default TableModeloFC;
