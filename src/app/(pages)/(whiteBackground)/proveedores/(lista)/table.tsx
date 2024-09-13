"use client";

import React, {ChangeEvent, MutableRefObject, ReactElement, useEffect, useRef, useState} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import ProveedorDTO from "@/types/dtos/ProveedorDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {darBajaProveedor, listarProveedores} from "@/services/ProveedorService";
import ProveedorFilter from "@/types/filters/ProveedorFilter";
import stylesTable from "@public/styles/modules/table/table.tipoequipos.module.css";
import {ModalInstance} from "@/app/hooks/modals/ModalProvider";
import EditProveedorForm from "@/app/(pages)/(whiteBackground)/proveedores/(lista)/formEdit";
import {ModalButtonsType} from "@/components/ModalFC";

/**
 *  Propiedades del componente TableProveedoresFC
 *  @interface TableProveedoresFCProps
 *  @property {string} sessionAPIToken - Token de la sesión del cliente en la API
 *  @property {boolean} hasPermissionEdit - Indica si el cliente tiene permisos para editar
 *  @property {boolean} hasPermissionBaja - Indica si el cliente tiene permisos para dar de baja
 *  @property {boolean} hasPermissionView - Indica si el cliente tiene permisos para ver
 *  @property {number} idInstitucion - ID de la institución del cliente
 **/

interface TableProveedoresFCProps {
    sessionAPIToken: string;
    hasPermissionEdit: boolean;
    hasPermissionBaja: boolean;
    hasPermissionView: boolean;
    idInstitucion: number;
}

/**
 * Propiedades de los filtros de la tabla
 **/

interface TableSearchTermsProps {
    filter: ProveedorFilter;
}

function TableProveedoresFC(props: Readonly<TableProveedoresFCProps>): ReactElement {

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

    // ----------------------- Lista de proveedores -----------------------
    const [proveedores, setProveedores] = useState<ProveedorDTO[]>([]);

    useEffect((): void => {
        (async (): Promise<void> => {
            const response: ProveedorDTO[] | FetchAPIError = await listarProveedores(props.sessionAPIToken, appliedSearchTerms.filter);

            if (isFetchAPIError(response)) {
                console.error("ERROR - lista de proveedores - table.tsx - listarProveedores", response.errorMessage);
                return;
            }
            console.log(response);
            setProveedores(response);
        })();

    }, [appliedSearchTerms]);

    // Procedimiento que se ejecuta al hacer clic en el botón 'Modificar'
    async function handleEditClick(proveedor: ProveedorDTO): Promise<void> {
        if (!props.hasPermissionEdit) { return; }

        const modalModificar: ModalInstance = createModal({
            children: (
                <EditProveedorForm
                    sessionAPIToken={props.sessionAPIToken}
                    idInstitucion={props.idInstitucion}
                    editingProveedor={proveedor}
                    onSave={(proveedorModified: ProveedorDTO): void => {
                        setProveedores(proveedores.map((p: ProveedorDTO): ProveedorDTO => {
                            return p.id === proveedorModified.id ? proveedorModified : p;
                        }));
                        modalModificar.close();
                        refSearchTermsTimer.current = setTimeout((): void => {
                            setAppliedSearchTerms({ ...appliedSearchTerms });
                        }, 1000);
                    }}
                    onCancel={(): void => {
                        createModal({
                            children: (
                                <p>¿Estás seguro de que deseas cancelar la modificación del proveedor?</p>
                            ),
                            buttonsType: ModalButtonsType.CONFIRM_CANCEL,
                            onConfirm: (): void => {
                                modalModificar.close();
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
    const handleEliminarClick = (proveedorSelected: ProveedorDTO): void => {
        if (!props.hasPermissionBaja) {
            createModal({
                children: (
                    <p>No tienes permisos para dar de baja proveedores</p>
                ),
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        createModal({
            title: "Dando de baja a \"" + proveedorSelected.nombre + "\"",
            children: (
                <>
                    <p>Estas por dar de baja al proveedor <b>&quot;{proveedorSelected.nombre}&quot;</b>.</p>
                    <p>¿Desea continuar?</p>
                </>
            ),
            buttonsType: ModalButtonsType.CONFIRM_CANCEL,
            async onConfirm(): Promise<void> {
                const response: void | FetchAPIError = await darBajaProveedor(proveedorSelected.id as number, props.sessionAPIToken);
                if (isFetchAPIError(response)) {
                    createModal({
                        children: (
                            <p>Error al dar de baja el proveedor: {response.errorMessage}</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                    return;
                }

                proveedorSelected.activo = false;

                createModal({
                    children: (
                        <p>Proveedor &quot;{proveedorSelected.nombre}&quot; dado de baja correctamente</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();

                refSearchTermsTimer.current = setTimeout((): void => {
                    setAppliedSearchTerms({ ...appliedSearchTerms });
                }, 1000);
            },
            onCancel(): void {
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
                    {proveedores.length > 0 ? (
                        <table style={{width: "100%"}}>
                            <thead>
                            <tr>
                                <th>Nombre</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {proveedores.map((proveedor: ProveedorDTO) => (
                                <tr key={proveedor.id}>
                                    <td>{proveedor.nombre}</td>
                                    {props.hasPermissionEdit ? (
                                        <td>
                                            <button onClick={() => handleEditClick(proveedor)}>Modificar</button>
                                        </td>
                                    ) : <td></td>}
                                    {props.hasPermissionBaja ? (
                                        <td>
                                            <button onClick={(): void => handleEliminarClick(proveedor)}>Eliminar</button>
                                        </td>
                                    ) : <td></td>}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : <h3>No se encontraron proveedores</h3>}
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
                                        nombre: event.target.value || undefined
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

export default TableProveedoresFC;
