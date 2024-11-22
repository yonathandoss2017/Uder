"use client";

import React, { ChangeEvent, MutableRefObject, ReactElement, useEffect, useRef, useState } from "react";
import { useModal } from "@/app/hooks/modals/useModal";
import IntervencionDTO from "@/types/dtos/IntervencionDTO";
import FetchAPIError, { isFetchAPIError } from "@/types/errors/FetchAPIError";
import {contarIntervenciones, listarIntervenciones} from "@/services/IntervencionService";
import { listarTiposIntervencion } from "@/services/TipoIntervencionService";
import IntervencionFilter from "@/types/filters/IntervencionFilter";
import stylesTable from "@public/styles/modules/table/table.tipoequipos.module.css";
import { ModalInstance } from "@/app/hooks/modals/ModalProvider";
import { ModalButtonsType } from "@/components/ModalFC";
import TrabajarIntervencionForm from "@/app/(pages)/(whiteBackground)/intervenciones/(lista)/formEdit";
import TipoIntervencionDTO from "@/types/dtos/TipoIntervencionDTO";
import styles from "@public/styles/modules/table/table.tipoequipos.module.css";
import {useToken} from "@/app/hooks/TokenProvider";
import LoadingPage from "@/app/(pages)/loading";
import ComboBoxFC from "@/components/ComboBoxFC";
import TipoEquipoDTO from "@/types/dtos/TipoEquipoDTO";

interface TableIntervencionFCProps {
    sessionAPIToken: string;
    hasPermissionEdit: boolean;
    hasPermissionView: boolean;
}

interface TableSearchTermsProps {
    size: number;
    page: number;
    fieldSort: string;
    sortDirectionAsc: boolean;
    filter: IntervencionFilter;
}


function TableIntervencionFC(props: Readonly<TableIntervencionFCProps>): ReactElement {

    // Obtenemos el token de sesión del cliente
    const {sessionAPIToken } = useToken();

    const { createModal } = useModal();

    // ----------------------- Términos de paginación -----------------------

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [npage, setNpage] = useState<number>(1);
    const recordsPerPage: number = 5;

    //Define si ha cargado
    const [loading, setLoading] = useState<boolean>(false);

    const tiposIntervencion: MutableRefObject<TipoIntervencionDTO[]> = useRef<TipoIntervencionDTO[]>([]);

    useEffect(() => {

        if(!sessionAPIToken) return;

        (async () => {

            await listarTiposIntervencion(sessionAPIToken).then((response: TipoIntervencionDTO[] | FetchAPIError) => {
                if (isFetchAPIError(response)) {
                    console.error("ERROR - tipos de intervención", response.errorMessage);
                    return;
                }
                tiposIntervencion.current = response;
            });
            setLoading(true);
        })();
    }, [props, sessionAPIToken]);

    // Define los términos de búsqueda introducidos por el usuario en tiempo real (searchTerms)
    // y la función para modificarlos (setSearchTerms)
    const [searchTerms, setSearchTerms]: [TableSearchTermsProps, (value: TableSearchTermsProps) => void]
        = useState<TableSearchTermsProps>({
        size: recordsPerPage,
        page: currentPage,
        fieldSort: 'fechaHora',
        sortDirectionAsc: true,
        filter: {}
    });

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

    const [intervenciones, setIntervenciones] = useState<IntervencionDTO[]>([]);

    useEffect(() => {

            if (!sessionAPIToken) return;

            (async () => {
                const response:IntervencionDTO[] | FetchAPIError = await listarIntervenciones(sessionAPIToken, appliedSearchTerms.size, appliedSearchTerms.page, appliedSearchTerms.fieldSort, appliedSearchTerms.sortDirectionAsc, appliedSearchTerms.filter);
                if (isFetchAPIError(response)) {
                    console.error("ERROR - lista de intervenciones", response.errorMessage);
                    return;
                }
                setIntervenciones(response);
                calcularPaginas();
            })();
    }, [appliedSearchTerms, sessionAPIToken]);

    function calcularPaginas(): void {
        if (!sessionAPIToken) return;

        contarIntervenciones(sessionAPIToken, appliedSearchTerms.filter)
            .then((response: number | FetchAPIError) => {
                if (isFetchAPIError(response)) {
                    console.error("ERROR - contar intervenciones", response.errorMessage);
                    return 0;
                }
                // Calcula el número de páginas
                const total: number = Number(response);
                const totalPages: number = Math.ceil(total / recordsPerPage);
                setNpage(totalPages);
                if (totalPages > 0 && currentPage > totalPages) {
                    setCurrentPage(totalPages);
                }
            })
            .catch(error => {
                console.error("ERROR - contar intervenciones", error);
            });
    }

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

    useEffect(() => {
        setSearchTerms({
            ...searchTerms,
            page: currentPage
        })
    }, [currentPage]);

    if(!loading) return <LoadingPage/>
    return (
        <div className={stylesTable.containerPage}>
            <div className={stylesTable.containerTable}>
                <div className={stylesTable.scroll}>
                    {intervenciones.length > 0 ? (
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
                            {intervenciones.map((intervencion: IntervencionDTO) => (
                                <tr key={intervencion.id}>
                                    <td>{formatDate(intervencion.fechaHora)}</td>
                                    <td>{tiposIntervencion.current.find((tipo:TipoIntervencionDTO):boolean =>{
                                        return tipo.id === intervencion.idTipoIntervencion;
                                    })?.nombre
                                    }</td>
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
                        <ComboBoxFC
                            message={"Todos los tipos de intervencion"}
                            messageSelectable={true}
                            elements={tiposIntervencion.current.map((tipoIntervencion: TipoIntervencionDTO): {
                                key: number,
                                value: string
                            } => ({
                                key: tipoIntervencion.id as number,
                                value: tipoIntervencion.nombre
                            }))}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        tipoIntervencion: e.target.value !== "" ? tiposIntervencion.current.find((tipo: TipoIntervencionDTO):
                                        boolean => tipo.id === Number(e.target.value))?.nombre : undefined
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
