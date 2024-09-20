"use client";

import React, { ChangeEvent, MutableRefObject, ReactElement, useEffect, useRef, useState } from "react";
import { useModal } from "@/app/hooks/modals/useModal";
import IntervencionDTO from "@/types/dtos/IntervencionDTO";
import FetchAPIError, { isFetchAPIError } from "@/types/errors/FetchAPIError";
import { listarIntervenciones } from "@/services/IntervencionService";
import IntervencionFilter from "@/types/filters/IntervencionFilter";
import stylesTable from "@public/styles/modules/table/table.tipoequipos.module.css";
import { ModalInstance } from "@/app/hooks/modals/ModalProvider";
import { ModalButtonsType } from "@/components/ModalFC";
import EditIntervencionForm from "@/app/(pages)/(whiteBackground)/intervenciones/(lista)/formEdit";

// Propiedades del componente TableIntervencionFC
interface TableIntervencionFCProps {
    sessionAPIToken: string;
    hasPermissionEdit: boolean;
    hasPermissionView: boolean;
}

interface TableSearchTermsProps {
    filter: IntervencionFilter;
}

function TableIntervencionFC(props: Readonly<TableIntervencionFCProps>): ReactElement {

    // ----------------------- Modales -----------------------
    const { createModal } = useModal();

    // ----------------------- Términos de búsqueda -----------------------
    const [searchTerms, setSearchTerms]: [TableSearchTermsProps, (value: TableSearchTermsProps) => void]
        = useState<TableSearchTermsProps>({ filter: {} });

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

    // ----------------------- Lista de intervenciones -----------------------
    const [intervenciones, setIntervenciones] = useState<IntervencionDTO[]>([]);

    useEffect((): void => {
        (async (): Promise<void> => {
            const response: IntervencionDTO[] | FetchAPIError = await listarIntervenciones(props.sessionAPIToken, appliedSearchTerms.filter);
            if (isFetchAPIError(response)) {
                const errorMessage: string = response.errorMessage;
                console.error("ERROR - lista de intervenciones", errorMessage);
                return;
            }
            setIntervenciones(response);
        })();
    }, [appliedSearchTerms]);

    // Procedimiento que se ejecuta al hacer clic en el botón 'Modificar'
    async function handleEditClick(intervencion: IntervencionDTO): Promise<void> {
        if (!props.hasPermissionEdit) { return; }

        // Crea un modal para modificar la intervención
        const modalModificar: ModalInstance = createModal({
            children: (
                <EditIntervencionForm
                    sessionAPIToken={props.sessionAPIToken}
                    editingIntervencion={intervencion}
                    onSave={(intervencionModified: IntervencionDTO): void => {
                        setIntervenciones(intervenciones.map((interv: IntervencionDTO): IntervencionDTO => {
                            return interv.id === intervencionModified.id ? intervencionModified : interv;
                        }));
                        modalModificar.close(); // Cierra el modal
                        refSearchTermsTimer.current = setTimeout((): void => {
                            setAppliedSearchTerms({ ...appliedSearchTerms }); // Actualiza los términos de búsqueda
                        }, 1000);
                    }}
                    onCancel={(): void => {
                        createModal({
                            children: (
                                <p>¿Estás seguro de que deseas cancelar la modificación de la intervención?</p>
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

    return (
        <div className={stylesTable.containerPage}>
            <div className={stylesTable.containerTable}>
                <div className={stylesTable.scroll}>
                    {intervenciones.length > 0 ? (
                        <table style={{ width: "100%" }}>
                            <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Motivo</th>
                                <th>Comentarios</th>
                                <th>Tipo Intervención</th>
                                <th>Equipo</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {intervenciones.map((intervencion: IntervencionDTO) => (
                                <tr key={intervencion.id}>
                                    <td>{intervencion.fechaHora}</td>
                                    <td>{intervencion.motivo}</td>
                                    <td>{intervencion.comentarios}</td>
                                    <td>{intervencion.idTipoIntervencion}</td>
                                    <td>{intervencion.idEquipo}</td>
                                    {props.hasPermissionEdit ?
                                        <td>
                                            <button onClick={() => handleEditClick(intervencion)}>Modificar</button>
                                        </td>
                                        :
                                        <td></td>
                                    }
                                </tr>

                            ))}
                            </tbody>
                        </table>
                    ) : <h3>No se encontraron intervenciones</h3>}
                </div>
                <div className={stylesTable.filtersContainer}>
                    <div className={stylesTable.filtersContainerInputs}>
                        <input
                            type="date"
                            name="fechaDesde"
                            placeholder="Fecha desde"
                            value={searchTerms.filter.fechaDesde || ''}
                            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        fechaDesde: event.target.value ? event.target.value : undefined
                                    }
                                });
                            }}
                        />
                        <input
                            type="date"
                            name="fechaHasta"
                            placeholder="Fecha hasta"
                            value={searchTerms.filter.fechaHasta || ''}
                            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        fechaHasta: event.target.value ? event.target.value : undefined
                                    }
                                });
                            }}
                        />
                        <input
                            type="number"
                            name="idEquipo"
                            placeholder="ID del equipo"
                            value={searchTerms.filter.idEquipo?.toString() || ''}
                            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        idEquipo: event.target.value ? parseInt(event.target.value) : undefined
                                    }
                                });
                            }}
                        />
                        <input
                            type="number"
                            name="idTipoIntervencion"
                            placeholder="ID del tipo de intervención"
                            value={searchTerms.filter.idTipoIntervencion?.toString() || ''}
                            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        idTipoIntervencion: event.target.value ? parseInt(event.target.value) : undefined
                                    }
                                });
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TableIntervencionFC;
