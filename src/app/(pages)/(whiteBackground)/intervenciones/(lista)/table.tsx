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
import TrabajarIntervencionForm from "@/app/(pages)/(whiteBackground)/intervenciones/(lista)/formEdit";
import EquipoDTO from "@/types/dtos/EquipoDTO";
import TipoIntervencionDTO from "@/types/dtos/TipoIntervencionDTO";
import styles from "@public/styles/modules/table/table.tipoequipos.module.css";
import {useToken} from "@/app/hooks/TokenProvider";

interface TableIntervencionFCProps {
    sessionAPIToken: string;
    hasPermissionEdit: boolean;
    hasPermissionView: boolean;
}

interface TableSearchTermsProps {
    filter: IntervencionFilter;
}


function TableIntervencionFC(props: Readonly<TableIntervencionFCProps>): ReactElement {

    // Obtenemos el token de sesión del cliente
    const {sessionAPIToken } = useToken();

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
    const [equipos, setEquipos] = useState<EquipoDTO[]>([]);
    const [tiposIntervencion, setTiposIntervencion] = useState<TipoIntervencionDTO[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(5);

    const indexOfLastIntervencion = currentPage * itemsPerPage;
    const indexOfFirstIntervencion = indexOfLastIntervencion - itemsPerPage;
    const currentIntervenciones = intervenciones.slice(indexOfFirstIntervencion, indexOfLastIntervencion);
    const totalPages = Math.ceil(intervenciones.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    useEffect(() => {

        if(!sessionAPIToken) return;

        (async () => {
            const intervResponse = await listarIntervenciones(sessionAPIToken, appliedSearchTerms.filter);
            if (isFetchAPIError(intervResponse)) {
                console.error("ERROR - lista de intervenciones", intervResponse.errorMessage);
                return;
            }

            const equiposResponse = await listarEquipos(sessionAPIToken);
            if (isFetchAPIError(equiposResponse)) {
                console.error("ERROR - lista de equipos", equiposResponse.errorMessage);
                return;
            }

            const tiposResponse = await listarTiposIntervencion(sessionAPIToken);
            if (isFetchAPIError(tiposResponse)) {
                console.error("ERROR - lista de tipos de intervención", tiposResponse.errorMessage);
                return;
            }

            setIntervenciones(intervResponse);
            setEquipos(equiposResponse);
            setTiposIntervencion(tiposResponse);
        })();
    }, [appliedSearchTerms, props.sessionAPIToken, sessionAPIToken]);

    async function handleEditClick(intervencion: IntervencionDTO): Promise<void> {

        if (!props.hasPermissionEdit) { return; }

        const modalModificar: ModalInstance = createModal({
            children: (
                <TrabajarIntervencionForm
                    sessionAPIToken={props.sessionAPIToken}
                    editingIntervencion={intervencion}
                    onSave={(intervencionModified: IntervencionDTO): void => {
                        setIntervenciones(intervenciones.map((interv: IntervencionDTO) => {
                            return interv.id === intervencionModified.id ? intervencionModified : interv;
                        }));
                        modalModificar.close();
                        refSearchTermsTimer.current = setTimeout(() => {
                            setAppliedSearchTerms({ ...appliedSearchTerms });
                        }, 3000);}}
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
                    }}/>),
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

    const handleViewDataClick = (intervencion: IntervencionDTO): void => {
        createModal({
            children: (
                <div>
                    <h3>Detalles de la Intervención</h3>
                    <p><strong>Motivo:</strong> {intervencion.motivo}</p>
                    <p><strong>Comentarios:</strong> {intervencion.comentarios}</p>
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
                    {currentIntervenciones.length > 0 ? (
                        <table style={{ width: "100%" }}>
                            <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo Intervención</th>
                                <th>Equipo</th>
                                <th>Ver Datos</th> {/* Cambiado de Comentarios a Ver Datos */}
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentIntervenciones.map((intervencion: IntervencionDTO) => (
                                <tr key={intervencion.id}>
                                    <td>{formatDate(intervencion.fechaHora)}</td>
                                    <td>{getTipoIntervencionNombre(intervencion.idTipoIntervencion)}</td>
                                    <td>{getEquipoNombre(intervencion.idEquipo)}</td>
                                    <td><button onClick={() => handleViewDataClick(intervencion)}>Ver Datos</button> {/* Cambiado el texto del botón */}</td>
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

                {/* Controles de Paginación */}
                {intervenciones.length > 0 && (
                    <div className={styles.pagination}>
                        <button
                            className={styles.paginationButton}
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}>
                            Anterior
                        </button>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index + 1}
                                className={`${styles.paginationButton} ${currentPage === index + 1 ? styles.activePage : ''}`}
                                onClick={() => setCurrentPage(index + 1)}>
                                {index + 1}
                            </button>
                        ))}
                        <button
                            className={styles.paginationButton}
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}>
                            Siguiente
                        </button>
                    </div>
                )}
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
                            }}/>
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
                            }}>
                            <option value="">Tipo de Intervencion</option>
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
