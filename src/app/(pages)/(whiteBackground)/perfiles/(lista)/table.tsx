"use client";

import React, {ChangeEvent, MutableRefObject, ReactElement, useEffect, useRef, useState} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import PerfilDTO from "@/types/dtos/PerfilDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {darBajaPerfil, listarPerfiles, reactivarPerfil} from "@/services/PerfilService"; // Asegúrate de importar `reactivarPerfil`
import PerfilFilter from "@/types/filters/PerfilFilter";
import stylesTable from "@public/styles/modules/table/table.tipoequipos.module.css";
import {ModalButtonsType} from "@/components/ModalFC";
import {useToken} from "@/app/hooks/TokenProvider";

interface TablePerfilesFCProps {
    sessionAPIToken: string;
    hasPermissionEdit: boolean;
    hasPermissionBaja: boolean;
    hasPermissionReactivar: boolean;
    hasPermissionView: boolean;
    idInstitucion: number;
}

interface TableSearchTermsProps {
    filter: PerfilFilter;
}

function TablePerfilesFC(props: Readonly<TablePerfilesFCProps>): ReactElement {
    const {sessionAPIToken } = useToken();
    const {createModal} = useModal();

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

    const [perfiles, setPerfiles] = useState<PerfilDTO[]>([]);

    useEffect((): void => {
        if(!sessionAPIToken) return;

        (async (): Promise<void> => {
            const response: PerfilDTO[] | FetchAPIError = await listarPerfiles(sessionAPIToken, appliedSearchTerms.filter);

            if (isFetchAPIError(response)) {
                console.error("ERROR - lista de perfiles - table.tsx - listarPerfiles", response.errorMessage);
                return;
            }

            const sortedPerfiles = response.sort((a: PerfilDTO, b: PerfilDTO) => (a.nivel || 0) - (b.nivel || 0));
            setPerfiles(sortedPerfiles);
        })();

    }, [appliedSearchTerms, sessionAPIToken]);

    const handleEliminarClick = (perfilSelected: PerfilDTO): void => {
        if(!sessionAPIToken) return;

        if (perfilSelected.activo) {
            // Dar de baja al perfil
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
        } else {
            // Reactivar el perfil
            if (!props.hasPermissionReactivar) {
                createModal({
                    children: (
                        <p>No tienes permisos para reactivar perfiles</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();
                return;
            }

            createModal({
                title: "Reactivando \"" + perfilSelected.nombre + "\"",
                children: (
                    <>
                        <p>Estás por reactivar el perfil <b>&quot;{perfilSelected.nombre}&quot;</b>.</p>
                        <p>¿Desea continuar?</p>
                    </>
                ),
                buttonsType: ModalButtonsType.CONFIRM_CANCEL,
                async onConfirm(): Promise<void> {
                    const response: void | FetchAPIError = await reactivarPerfil(perfilSelected.id as number, sessionAPIToken);
                    if (isFetchAPIError(response)) {
                        createModal({
                            children: (
                                <p>Error al reactivar el perfil: {response.errorMessage}</p>
                            ),
                            buttonsType: ModalButtonsType.CONFIRM
                        }).show();
                        return;
                    }

                    perfilSelected.activo = true;

                    createModal({
                        children: (
                            <p>Perfil &quot;{perfilSelected.nombre}&quot; reactivado correctamente</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();

                    refSearchTermsTimer.current = setTimeout((): void => {
                        setAppliedSearchTerms({ ...appliedSearchTerms });
                    }, 1000);
                },
                onCancel(): void {
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

    return (
        <div className={stylesTable.containerPage}>
            <div className={stylesTable.containerTable}>
                <div className={stylesTable.scroll}>
                    {perfiles.length > 0 ? (
                        <table style={{width: "100%"}}>
                            <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Nivel</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {perfiles.map((perfil: PerfilDTO) => (
                                <tr key={perfil.id}>
                                    <td>{perfil.nombre}</td>
                                    <td>{perfil.nivel}</td>
                                    {props.hasPermissionBaja || props.hasPermissionReactivar ? (
                                        <td>
                                            <button onClick={(): void => handleEliminarClick(perfil)}>
                                                {perfil.activo ? 'Eliminar' : 'Reactivar'}
                                            </button>
                                        </td>
                                    ) : (
                                        <td></td>
                                    )}
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