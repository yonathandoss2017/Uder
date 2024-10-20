"use client";

import React, {ChangeEvent, MutableRefObject, ReactElement, useEffect, useRef, useState} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import PerfilDTO from "@/types/dtos/PerfilDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {darBajaPerfil, listarPerfiles} from "@/services/PerfilService";
import PerfilFilter from "@/types/filters/PerfilFilter";
import stylesTable from "@public/styles/modules/table/table.tipoequipos.module.css";
import {ModalInstance} from "@/app/hooks/modals/ModalProvider";
import EditPerfilForm from "@/app/(pages)/(whiteBackground)/perfiles/(lista)/formEdit";
import {ModalButtonsType} from "@/components/ModalFC";
import {useToken} from "@/app/hooks/TokenProvider";

/**
 *  Propiedades del componente TablePerfilesFC
 *  @interface TablePerfilesFCProps
 *  @property {string} sessionAPIToken - Token de la sesión del cliente en la API
 *  @property {boolean} hasPermissionEdit - Indica si el cliente tiene permisos para editar
 *  @property {boolean} hasPermissionBaja - Indica si el cliente tiene permisos para dar de baja
 *  @property {boolean} hasPermissionView - Indica si el cliente tiene permisos para ver
 *  @property {number} idInstitucion - ID de la institución del cliente
 **/

interface TablePerfilesFCProps {
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
    filter: PerfilFilter;
}

function TablePerfilesFC(props: Readonly<TablePerfilesFCProps>): ReactElement {

    // Obtenemos el token de sesión del cliente
    const {sessionAPIToken } = useToken();

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

    // ----------------------- Lista de perfiles -----------------------
    const [perfiles, setPerfiles] = useState<PerfilDTO[]>([]);

    useEffect((): void => {

        if(!sessionAPIToken) return;

        (async (): Promise<void> => {
            const response: PerfilDTO[] | FetchAPIError = await listarPerfiles(sessionAPIToken, appliedSearchTerms.filter);

            if (isFetchAPIError(response)) {
                console.error("ERROR - lista de perfiles - table.tsx - listarPerfiles", response.errorMessage);
                return;
            }

            // Ordenar perfiles por nivel de menor a mayor
            const sortedPerfiles = response.sort((a: PerfilDTO, b: PerfilDTO) => (a.nivel || 0) - (b.nivel || 0));
            setPerfiles(sortedPerfiles);
        })();

    }, [appliedSearchTerms]);

    // Procedimiento que se ejecuta al hacer clic en el botón 'Modificar'
    async function handleEditClick(perfil: PerfilDTO): Promise<void> {
        if (!props.hasPermissionEdit) { return; }

        const modalModificar: ModalInstance = createModal({
            children: (
                <EditPerfilForm
                    sessionAPIToken={props.sessionAPIToken}
                    idInstitucion={props.idInstitucion}
                    editingPerfil={perfil}
                    onSave={(perfilModified: PerfilDTO): void => {
                        setPerfiles(perfiles.map((p: PerfilDTO): PerfilDTO => {
                            return p.id === perfilModified.id ? perfilModified : p;
                        }));
                        modalModificar.close();
                        refSearchTermsTimer.current = setTimeout((): void => {
                            setAppliedSearchTerms({ ...appliedSearchTerms });
                        }, 1000);
                    }}
                    onCancel={(): void => {
                        createModal({
                            children: (
                                <p>¿Estás seguro de que deseas cancelar la modificación del perfil?</p>
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
    const handleEliminarClick = (perfilSelected: PerfilDTO): void => {

        if(!sessionAPIToken) return;

        if (!props.hasPermissionBaja) {
            createModal({
                children: (
                    <p>No tienes permisos para dar de baja perfiles</p>
                ),
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        createModal({
            title: "Dando de baja a \"" + perfilSelected.nombre + "\"",
            children: (
                <>
                    <p>Estás por dar de baja al perfil <b>&quot;{perfilSelected.nombre}&quot;</b>.</p>
                    <p>¿Desea continuar?</p>
                </>
            ),
            buttonsType: ModalButtonsType.CONFIRM_CANCEL,
            async onConfirm(): Promise<void> {
                const response: void | FetchAPIError = await darBajaPerfil(perfilSelected.id as number, sessionAPIToken);
                if (isFetchAPIError(response)) {
                    createModal({
                        children: (
                            <p>Error al dar de baja el perfil: {response.errorMessage}</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                    return;
                }

                perfilSelected.activo = false;

                createModal({
                    children: (
                        <p>Perfil &quot;{perfilSelected.nombre}&quot; dado de baja correctamente</p>
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
                    {perfiles.length > 0 ? (
                        <table style={{width: "100%"}}>
                            <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Nivel</th> {/* Nueva columna para mostrar el nivel */}
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {perfiles.map((perfil: PerfilDTO) => (
                                <tr key={perfil.id}>
                                    <td>{perfil.nombre}</td>
                                    <td>{perfil.nivel}</td> {/* Mostrar el nivel del perfil */}
                                    {props.hasPermissionBaja ? (
                                        <td>
                                            <button onClick={(): void => handleEliminarClick(perfil)}>Eliminar</button>
                                        </td>
                                    ) : <td></td>}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : <h3>No se encontraron perfiles</h3>}
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

export default TablePerfilesFC;
