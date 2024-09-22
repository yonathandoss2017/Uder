"use client";

import React, { ChangeEvent, MutableRefObject, ReactElement, useEffect, useRef, useState } from "react";
import { useModal } from "@/app/hooks/modals/useModal";
import IntervencionDTO from "@/types/dtos/IntervencionDTO";
import FetchAPIError, { isFetchAPIError } from "@/types/errors/FetchAPIError";
import { listarIntervenciones } from "@/services/IntervencionService";
import { listarEquipos } from "@/services/EquiposService";
import { listarTiposIntervencion } from "@/services/TipoIntervencionService";
import IntervencionFilter from "@/types/filters/IntervencionFilter";
import stylesTable from "@public/styles/modules/table/table.tipoequipos.module.css";
import { ModalInstance } from "@/app/hooks/modals/ModalProvider";
import { ModalButtonsType } from "@/components/ModalFC";
import EditIntervencionForm from "@/app/(pages)/(whiteBackground)/intervenciones/(lista)/formEdit";
import EquipoDTO from "@/types/dtos/EquipoDTO";
import TipoIntervencionDTO from "@/types/dtos/TipoIntervencionDTO";

interface TableIntervencionFCProps {
    sessionAPIToken: string;
    hasPermissionEdit: boolean;
    hasPermissionView: boolean;
}

interface TableSearchTermsProps {
    filter: IntervencionFilter;
}

interface Equipo {
    id: number;
    nombre: string;
}

interface TipoIntervencion {
    id: number;
    nombre: string;
}

function TableIntervencionFC(props: Readonly<TableIntervencionFCProps>): ReactElement {
    const { createModal } = useModal();

    const [searchTerms, setSearchTerms] = useState<TableSearchTermsProps>({ filter: {} });
    const [appliedSearchTerms, setAppliedSearchTerms] = useState<TableSearchTermsProps>(searchTerms);

    const refSearchTermsTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (refSearchTermsTimer.current !== null) {
            clearTimeout(refSearchTermsTimer.current);
        }

        refSearchTermsTimer.current = setTimeout(() => {
            setAppliedSearchTerms(searchTerms);
        }, 500);
    }, [searchTerms]);

    const [intervenciones, setIntervenciones] = useState<IntervencionDTO[]>([]);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [tiposIntervencion, setTiposIntervencion] = useState<TipoIntervencion[]>([]);

    useEffect(() => {
        (async () => {
            const intervResponse = await listarIntervenciones(props.sessionAPIToken, appliedSearchTerms.filter);
            if (isFetchAPIError(intervResponse)) {
                console.error("ERROR - lista de intervenciones", intervResponse.errorMessage);
                return;
            }

            const equiposResponse = await listarEquipos(props.sessionAPIToken);
            if (isFetchAPIError(equiposResponse)) {
                console.error("ERROR - lista de equipos", equiposResponse.errorMessage);
                return;
            }

            const tiposResponse = await listarTiposIntervencion(props.sessionAPIToken);
            if (isFetchAPIError(tiposResponse)) {
                console.error("ERROR - lista de tipos de intervención", tiposResponse.errorMessage);
                return;
            }

            setIntervenciones(intervResponse as IntervencionDTO[]);
            setEquipos((equiposResponse as EquipoDTO[]).map(dtoToEquipo));
            setTiposIntervencion((tiposResponse as TipoIntervencionDTO[]).map(dtoToTipoIntervencion));
        })();
    }, [appliedSearchTerms, props.sessionAPIToken]);

    function dtoToEquipo(equipoDTO: EquipoDTO): Equipo {
        if (equipoDTO.id === undefined) {
            throw new Error("EquipoDTO.id is undefined");
        }
        return {
            id: equipoDTO.id,
            nombre: equipoDTO.nombre
        };
    }

    function dtoToTipoIntervencion(tipoIntervencionDTO: TipoIntervencionDTO): TipoIntervencion {
        if (tipoIntervencionDTO.id === undefined) {
            throw new Error("TipoIntervencionDTO.id is undefined");
        }
        return {
            id: tipoIntervencionDTO.id,
            nombre: tipoIntervencionDTO.nombre
        };
    }

    async function handleEditClick(intervencion: IntervencionDTO): Promise<void> {
        if (!props.hasPermissionEdit) { return; }

        const modalModificar: ModalInstance = createModal({
            children: (
                <EditIntervencionForm
                    sessionAPIToken={props.sessionAPIToken}
                    editingIntervencion={intervencion}
                    onSave={(intervencionModified: IntervencionDTO): void => {
                        setIntervenciones(intervenciones.map((interv: IntervencionDTO) => {
                            return interv.id === intervencionModified.id ? intervencionModified : interv;
                        }));
                        modalModificar.close();
                        refSearchTermsTimer.current = setTimeout(() => {
                            setAppliedSearchTerms({ ...appliedSearchTerms });
                        }, 1000);
                    }}
                    onCancel={() => {
                        createModal({
                            children: (
                                <p>¿Estás seguro de que deseas cancelar la modificación de la intervención?</p>
                            ),
                            buttonsType: ModalButtonsType.CONFIRM_CANCEL,
                            onConfirm: () => {
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

    const ID_TIPOS_INTERVENCION_RESOLUCION = [3, 6];

    const getEquipoNombre = (idEquipo: number): string => {
        const equipo = equipos.find(e => e.id === idEquipo);
        return equipo ? equipo.nombre : 'Desconocido';
    };

    const getTipoIntervencionNombre = (idTipoIntervencion: number): string => {
        const tipoIntervencion = tiposIntervencion.find(t => t.id === idTipoIntervencion);
        return tipoIntervencion ? tipoIntervencion.nombre : 'Desconocido';
    };

    const handleViewCommentsClick = (comentarios: string): void => {
        createModal({
            children: (
                <div>
                    <h3>Comentarios</h3>
                    <p>{comentarios}</p>
                </div>
            ),
            buttonsType: ModalButtonsType.CLOSE
        }).show();
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

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
                                <th>Tipo Intervención</th>
                                <th>Equipo</th>
                                <th>Comentarios</th> {/* Nueva columna Comentarios */}
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {intervenciones.map((intervencion: IntervencionDTO) => (
                                <tr key={intervencion.id}>
                                    <td>{formatDate(intervencion.fechaHora)}</td>
                                    <td>{intervencion.motivo}</td>
                                    <td>{getTipoIntervencionNombre(intervencion.idTipoIntervencion)}</td>
                                    <td>{getEquipoNombre(intervencion.idEquipo)}</td>
                                    <td>
                                        <button onClick={() => handleViewCommentsClick(intervencion.comentarios ?? '')}>Comentarios</button>
                                    </td> {/* Botón Comentarios movido a la nueva columna */}
                                    <td>
                                        {props.hasPermissionEdit && !ID_TIPOS_INTERVENCION_RESOLUCION.includes(intervencion.idTipoIntervencion) ? (
                                            <button style={{ marginLeft: '10px' }} onClick={() => handleEditClick(intervencion)}>Trabajar</button>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : <h3>No se encontraron intervenciones</h3>}
                </div>
                <div className={stylesTable.filtersContainer}>
                    <div className={stylesTable.filtersContainerInputs}>
                        <label htmlFor="fechaDesde">Fecha Desde:</label>
                        <input
                            type="date"
                            name="fechaDesde"
                            value={searchTerms.filter.fechaDesde ? searchTerms.filter.fechaDesde.toISOString().split('T')[0] : ''}
                            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        fechaDesde: event.target.value ? new Date(event.target.value) : undefined
                                    }
                                });
                            }}
                        />
                        <label htmlFor="fechaHasta">Fecha Hasta:</label>
                        <input
                            type="date"
                            name="fechaHasta"
                            value={searchTerms.filter.fechaHasta ? searchTerms.filter.fechaHasta.toISOString().split('T')[0] : ''}
                            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        fechaHasta: event.target.value ? new Date(event.target.value) : undefined
                                    }
                                });
                            }}
                        />
                        <select
                            name="idEquipo"
                            value={searchTerms.filter.idEquipo || ''}
                            onChange={(event: ChangeEvent<HTMLSelectElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        idEquipo: event.target.value ? parseInt(event.target.value) : undefined
                                    }
                                });
                            }}
                        >
                            <option value="">Todos los equipos</option>
                            {equipos.map((equipo) => (
                                <option key={equipo.id} value={equipo.id}>{equipo.nombre}</option>
                            ))}
                        </select>
                        <select
                            name="idTipoIntervencion"
                            value={searchTerms.filter.idTipoIntervencion || ''}
                            onChange={(event: ChangeEvent<HTMLSelectElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        idTipoIntervencion: event.target.value ? parseInt(event.target.value) : undefined
                                    }
                                });
                            }}
                        >
                            <option value="">Todos los tipos</option>
                            {tiposIntervencion.map((tipo) => (
                                <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TableIntervencionFC;
