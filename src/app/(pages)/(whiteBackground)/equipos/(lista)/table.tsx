"use client";  // Este es un componente del lado del cliente

// Importa los estilos de la tabla
import stylesTable from "@public/styles/modules/table/table.equipos.module.css";
// Importa los módulos necesarios
import React, {ChangeEvent, MutableRefObject, ReactElement, useEffect, useRef, useState} from 'react';
import EquipoDTO from '@/types/dtos/EquipoDTO';
import TipoEquipoDTO from '@/types/dtos/TipoEquipoDTO';
import FetchAPIError, {isFetchAPIError} from '@/types/errors/FetchAPIError';
import ComboBoxFC from "@/components/ComboBoxFC";
import {contarEquipos, listarEquipos} from "@/services/EquiposService";
import {listarTiposEquipo} from "@/services/TipoEquipoService";
import ModalViewEquipoFC from "@/components/ModalViewEquipoFC";
import EquipoFilter from "@/types/filters/EquipoFilter";
import EquipoFieldSortEnum from "@/types/enums/EquipoFieldSortEnum";
import {useModal} from "@/app/hooks/modals/useModal";
import {ModalButtonsType} from "@/components/ModalFC";
import EditEquipoForm from "@/app/(pages)/(whiteBackground)/equipos/(lista)/formEdit";
import {ModalInstance} from "@/app/hooks/modals/ModalProvider";
import ModalBajaEquipoFC from "@/components/ModalBajaEquipoFC";
import MarcaDTO from "@/types/dtos/MarcaDTO";
import {listarMarcas} from "@/services/MarcaService";
import ModeloDTO from "@/types/dtos/ModeloDTO";
import {listarModelos} from "@/services/ModeloService";
import PaisDTO from "@/types/dtos/PaisDTO";
import {listarPaises} from "@/services/PaisService";
import ProveedorDTO from "@/types/dtos/ProveedorDTO";
import {listarProveedores} from "@/services/ProveedorService";
import UbicacionDTO from "@/types/dtos/UbicacionDTO";
import {listarUbicaciones} from "@/services/UbicacionService";
import LoadingPage from "@/app/(pages)/loading";

/**
 * Propiedades del componente Table
 * @property {string} sessionAPIToken Token de sesión del cliente en la API
 * @property {boolean} hasPermissionEdit Indica si el cliente tiene permisos para modificar equipos
 * @property {boolean} hasPermissionBaja Indica si el cliente tiene permisos para dar de baja equipos
 * @property {boolean} hasPermissionView Indica si el cliente tiene permisos de ver equipos
 */
interface TableEquiposFCProps {
    sessionAPIToken: string;
    hasPermissionEdit: boolean;
    hasPermissionBaja: boolean;
    hasPermissionView: boolean;
    idInstitucion: number;
}

/**
 * Propiedades de los filtros de la tabla
 */
interface TableSearchTermsProps {
    size: number;
    page: number;
    fieldSort: EquipoFieldSortEnum;
    sortDirectionAsc: boolean;
    filter: EquipoFilter;
}

/**
 * Tabla de equipos
 *
 * @param {TableEquiposFCProps} props Propiedades del componente
 */
function TableEquiposFC(props: Readonly<TableEquiposFCProps>): ReactElement {

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    // ----------------------- Términos de búsqueda  -----------------------

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [npage, setNpage] = useState<number>(1);
    const recordsPerPage: number = 5;

    // ----------------------- Listas de filtros -----------------------

    //Define si ha cargado
    const [loading, setLoading] = useState<boolean>(false);

    // Define el estado de los tipos de equipo existentes para mostrar en la tabla
    const tiposEquipo: MutableRefObject<TipoEquipoDTO[]> = useRef<TipoEquipoDTO[]>([]);

    // Define el estado de las marcas existentes para mostrar en la tabla
    const marcas: MutableRefObject<MarcaDTO[]> = useRef<MarcaDTO[]>([]);

    // Define el estado de los modelos existentes para mostrar en la tabla
    const modelos: MutableRefObject<ModeloDTO[]> = useRef<ModeloDTO[]>([]);

    // Define el estado de los países de origen existentes para mostrar en la tabla
    const paisOrigen: MutableRefObject<PaisDTO[]> = useRef<PaisDTO[]>([]);

    // Define el estado de los proveedores existentes para mostrar en la tabla
    const proveedores: MutableRefObject<ProveedorDTO[]> = useRef<ProveedorDTO[]>([]);

    // Define el estado de las ubicaciones existentes para mostrar en la tabla
    const ubicaciones: MutableRefObject<UbicacionDTO[]> = useRef<UbicacionDTO[]>([]);

    // Efecto que se ejecuta al montar el componente (Carga los combobox de filtros)
    useEffect((): void => {

        // Procedimiento asíncrono auto-ejecutable que actualiza la lista de tipos de equipo y la lista de equipos
        (async (): Promise<void> => {
            // Consulta los tipos de equipo y ejecuta un procedimiento con la respuesta
            await listarTiposEquipo(props.idInstitucion).then((response: TipoEquipoDTO[] | FetchAPIError): void => {
                if (isFetchAPIError(response)) {
                    console.error("ERROR - lista de equipos - table.tsx - listarTiposEquipo", response.errorMessage);
                    return;
                }
                // Actualiza la lista de tipos de equipo
                tiposEquipo.current = response;
            });

            await listarMarcas(props.idInstitucion).then((response: MarcaDTO[] | FetchAPIError): void => {
                if (isFetchAPIError(response)) {
                    console.error("ERROR - lista de equipos - table.tsx - listarMarcas", response.errorMessage);
                    return;
                }
                // Actualiza la lista de marcas
                marcas.current = response;
            });

            await listarModelos(props.idInstitucion).then((response: ModeloDTO[] | FetchAPIError): void => {
                if (isFetchAPIError(response)) {
                    console.error("ERROR - lista de equipos - table.tsx - listarModelos", response.errorMessage);
                    return;
                }
                // Actualiza la lista de modelos
                modelos.current = response;
            });

            await listarPaises(props.idInstitucion).then((response: PaisDTO[] | FetchAPIError): void => {
                if (isFetchAPIError(response)) {
                    console.error("ERROR - lista de equipos - table.tsx - listarPaises", response.errorMessage);
                    return;
                }
                // Actualiza la lista de países
                paisOrigen.current = response;
            });

            await listarProveedores(props.idInstitucion).then((response: ProveedorDTO[] | FetchAPIError): void => {
                if (isFetchAPIError(response)) {
                    console.error("ERROR - lista de equipos - table.tsx - listarProveedores", response.errorMessage);
                    return;
                }
                // Actualiza la lista de proveedores
                proveedores.current = response;
            });

            await listarUbicaciones(props.sessionAPIToken).then((response: UbicacionDTO[] | FetchAPIError): void => {
                if (isFetchAPIError(response)) {
                    console.error("ERROR - lista de equipos - table.tsx - listarUbicaciones", response.errorMessage);
                    return;
                }
                console.log(response)
                // Actualiza la lista de ubicaciones
                ubicaciones.current = response;
            });

            setLoading(true);
        })();
    }, [props]);


    // Define los términos de búsqueda introducidos por el usuario en tiempo real (searchTerms)
    // y la función para modificarlos (setSearchTerms)
    const [searchTerms, setSearchTerms]: [TableSearchTermsProps, (value: TableSearchTermsProps) => void]
        = useState<TableSearchTermsProps>({
        size: recordsPerPage,
        page: currentPage,
        fieldSort: EquipoFieldSortEnum.NUM_SERIE,
        sortDirectionAsc: true,
        filter: {activo: true}
    });

    // Define los términos de búsqueda aplicados en la tabla de usuarios (appliedSearchTerms)
    // y la función para modificarlos (setAppliedSearchTerms)
    const [appliedSearchTerms, setAppliedSearchTerms]: [TableSearchTermsProps, (value: TableSearchTermsProps) => void]
        = useState<TableSearchTermsProps>(searchTerms);

    // Define un ref (Referencia mutable) para el temporizador que actualiza los términos de búsqueda aplicados
    // (Ejecuta una acción después de un tiempo determinado)
    const refSearchTermsTimer: MutableRefObject<NodeJS.Timeout | null> = useRef<NodeJS.Timeout | null>(null);

    // Efecto que se ejecuta cuando cambian los términos de búsqueda introducidos por el usuario
    // Reinicia el temporizador para actualizar los términos de búsqueda aplicados con los introducidos por el usuario
    // (Esto evita que se realicen múltiples actualizaciones en un corto período de tiempo, ósea por cada letra que se escribe o borra)
    useEffect((): void => {
        // Si hay un temporizador en ejecución, lo cancela para evitar múltiples ejecuciones
        if (refSearchTermsTimer.current !== null) {
            clearTimeout(refSearchTermsTimer.current);
        }

        // Crea un nuevo temporizador usando requestIdleCallback
        refSearchTermsTimer.current = setTimeout((): void => {
            setAppliedSearchTerms(searchTerms); // Actualiza los términos de búsqueda
        }, 500); // Establece un temporizador de 0.5 segundo

    }, [searchTerms]);

    // ----------------------- Lista de equipos -----------------------

    // Define la lista de equipos a mostrar en la tabla (equipos) y la función para modificarla (setEquipos)
    const [equipos, setEquipos]: [EquipoDTO[], (value: EquipoDTO[]) => void] = useState<EquipoDTO[]>([]);

    // Efecto que se ejecuta al montar el componente y cuando cambian los términos de búsqueda.
    // Actualiza la lista de equipos según los términos de búsqueda.
    useEffect((): void => {
        // Procedimiento asíncrono auto-ejecutable para ejecutar código asíncrono
        (async (): Promise<void> => {
            // Obtiene la lista de equipos de la API
            const response: EquipoDTO[] | FetchAPIError = await listarEquipos(props.sessionAPIToken, appliedSearchTerms.size, appliedSearchTerms.page, appliedSearchTerms.fieldSort, appliedSearchTerms.sortDirectionAsc, appliedSearchTerms.filter);

            // Si ocurre un error en la solicitud, muestra un mensaje de error en la consola y no hace nada
            if (isFetchAPIError(response)) {
                console.error("ERROR - lista de equipos - table.tsx - listarEquipos", response.errorMessage);
                return;
            }

            // Guarda la lista de equipos
            setEquipos(response);
            calcularPaginas();
        })();

    }, [appliedSearchTerms]);

    //Metodo para calcular paginas disponibles
    function calcularPaginas(): void {
        contarEquipos(props.sessionAPIToken, appliedSearchTerms.filter)
            .then((response: number | FetchAPIError) => {
                if (isFetchAPIError(response)) { //Si hay error
                    console.error("ERROR: " + response.errorMessage)
                    return 0;
                }
                //Obtenemos el total de usuarios de la respuesta
                const total = Number(response);
                //La cantidad de paginas es el total de usuarios dividido la cantidad de usuarios por pagina que se muestran
                const totalPages = Math.ceil(total / recordsPerPage)
                setNpage(totalPages); //Seteamos el numero de paginas
                if (totalPages > 0 && currentPage > totalPages) { //Si el total de paginas es mayor a 0 y la pagina actual es mayor al total de las paginas
                    setCurrentPage(totalPages); //Seteamos la pagina actual a la ultima pagina
                }
            })
            .catch(error => {
                console.error("Error al calcular las páginas:", error);
            });
    }



    // ----------------------- Eventos de la tabla de equipos -----------------------

    // Procedimiento que se ejecuta al hacer click en el boton "Ver"

    function handleVerClick(equipo: EquipoDTO): void {
        if (!props.hasPermissionView) return; //Si el cliente no tiene permisos para ver, no hace nada
        createModal({
            children: <ModalViewEquipoFC equipo={equipo} sessionAPIToken={props.sessionAPIToken}/>, // Renderiza el componente como JSX
            buttonsType: ModalButtonsType.CLOSE // Establece el tipo de botones del modal
        }).show();
    }

    // Procedimiento que se ejecuta al hacer clic en el botón 'Modificar'
    const handleEditClick = (equipo: EquipoDTO): void => {
        if (!props.hasPermissionEdit) return; // Si el cliente no tiene permisos para modificar, no hace nada


        const modalModificar: ModalInstance = createModal({
            children: (
                <EditEquipoForm
                    sessionAPIToken={props.sessionAPIToken}
                    idInstitucion={props.idInstitucion}
                    editingEquipo={equipo}
                    onSave={(equipoModified: EquipoDTO): void => {
                        if (equipos) {
                            // Actualiza el equipo en la lista
                            setEquipos(equipos.map((equipo: EquipoDTO): EquipoDTO => {
                                if (equipo.id === equipoModified.id) {
                                    return equipoModified;
                                }
                                return equipo;
                            }));
                        }

                        modalModificar.close(); // Cierra el modal

                        // Refresca la lista volviendo a cargar los términos de búsqueda después de 3 segundos
                        refSearchTermsTimer.current = setTimeout((): void => {
                            setAppliedSearchTerms({...appliedSearchTerms}); // Actualiza los términos de búsqueda
                        }, 3000);
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
    const handleEliminarClick = (equipoSelected: EquipoDTO): void => {
        if (!props.hasPermissionBaja) return; // Si el cliente no tiene permisos para modificar, no hace nada

        const modalBaja: ModalInstance = createModal({
            children: (
                <ModalBajaEquipoFC
                    sessionAPIToken={props.sessionAPIToken}
                    equipo={equipoSelected}
                    onSave={(): void => {

                        modalBaja.close(); // Cierra el modal

                        // Refresca la lista volviendo a cargar los términos de búsqueda
                        setAppliedSearchTerms({...appliedSearchTerms});
                    }}
                    onCancel={(): void => {
                        createModal({
                            children: (
                                <p>¿Estás seguro de que deseas cancelar la baja del equipo?</p>
                            ),
                            buttonsType: ModalButtonsType.CONFIRM_CANCEL,
                            onConfirm: (): void => {
                                modalBaja.close()
                            }
                        }).show();
                    }}
                />
            ),
            buttonsType: ModalButtonsType.NONE
        });

        modalBaja.show();
    }

    //Se ejecuta cada vez que cambia la página actual
    useEffect(() => {
        setSearchTerms({
            ...searchTerms,
            page: currentPage //Sea actualizan los parametros de búsqueda
        });

    }, [currentPage]); //Cuando cambia la página

    if(!loading) return <LoadingPage/>
    return (
        <div className={stylesTable.containerPage}>
            <div className={stylesTable.containerTable}>
                <div className={stylesTable.scroll}>
                    {equipos.length > 0 ? (
                        <table style={{width: "100%"}}>
                            <thead>
                            <tr>
                                <th>Número de Serie</th>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {equipos.map((equipo: EquipoDTO) => (
                                <tr key={equipo.id}>
                                    <td>{equipo.numSerie}</td>
                                    <td>{equipo.nombre}</td>
                                    <td>{tiposEquipo.current.find((tipo: TipoEquipoDTO): boolean => {
                                        return tipo.id === equipo.idTipoEquipo
                                    })?.nombre
                                    }</td>
                                    <td>
                                        {props.hasPermissionView && (
                                            <>
                                                {(
                                                    <button onClick={() => handleVerClick(equipo)}>
                                                        Ver
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </td>
                                    {props.hasPermissionEdit ?
                                        <td>
                                            <button onClick={() => handleEditClick(equipo)}>Modificar</button>
                                        </td>
                                        :
                                        <td></td>
                                    }
                                    {props.hasPermissionBaja ?
                                        <td>
                                            <button onClick={(): void => handleEliminarClick(equipo)}>Eliminar
                                            </button>
                                        </td>
                                        :
                                        <td></td>
                                    }
                                </tr>
                            ))}
                            </tbody>

                        </table>) : <h3>No se encontraron equipos</h3>}
                </div>
                {equipos.length > 0 && (
                    <div className={stylesTable.pagination}>
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
                        <input
                            type="text"
                            name="numSerie"
                            placeholder="Buscar por num de serie"
                            value={searchTerms.filter.numSerie ? searchTerms.filter.numSerie : ''}
                            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        numSerie: event.target.value ? event.target.value : undefined
                                    }
                                });
                            }}
                        />
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
                        <div>
                            <label>Fecha desde
                            <input
                                type="date"
                                name="fecha_desde"
                                value={searchTerms.filter.fechaAdquisicionDesde ? searchTerms.filter.fechaAdquisicionDesde.toISOString().split('T')[0] : ''}
                                onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                    setSearchTerms({
                                        ...searchTerms,
                                        filter: {
                                            ...searchTerms.filter,
                                            fechaAdquisicionDesde: event.target.value ? new Date(event.target.value) : undefined
                                        }
                                    });
                                }}
                            />
                            </label>
                            <label>Fecha hasta
                                <input type="date"
                                       name="fecha_hasta"
                                       value={searchTerms.filter.fechaAdquisicionHasta ? searchTerms.filter.fechaAdquisicionHasta.toISOString().split('T')[0] : ''}
                                       onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                           setSearchTerms({
                                               ...searchTerms,
                                               filter: {
                                                   ...searchTerms.filter,
                                                   fechaAdquisicionHasta: event.target.value ? new Date(event.target.value) : undefined
                                               }
                                           });
                                       }}
                                />
                            </label>
                        </div>
                        <ComboBoxFC
                            message={"Todas las marcas"}
                            messageSelectable={true}
                            elements={marcas.current.map((marca: MarcaDTO): {
                                key: number,
                                value: string
                            } => ({
                                key: marca.id as number,
                                value: marca.nombre
                            }))}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        marca: e.target.value !== "" ? marcas.current.find((marca: MarcaDTO):
                                        boolean => marca.id === Number(e.target.value))?.nombre : undefined
                                    }
                                });
                            }}
                        />
                        <ComboBoxFC
                            message={"Todos los modelos"}
                            messageSelectable={true}
                            elements={modelos.current.map((modelo: ModeloDTO): {
                                key: number,
                                value: string
                            } => ({
                                key: modelo.id as number,
                                value: modelo.nombre
                            }))}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        modelo: e.target.value !== "" ? modelos.current.find((modelo: ModeloDTO):
                                        boolean => modelo.id === Number(e.target.value))?.nombre : undefined
                                    }
                                });
                            }}
                        />
                        <ComboBoxFC
                            message={"Todos los tipos de equipo"}
                            messageSelectable={true}
                            elements={tiposEquipo.current.map((tipoEquipo: TipoEquipoDTO): {
                                key: number,
                                value: string
                            } => ({
                                key: tipoEquipo.id as number,
                                value: tipoEquipo.nombre
                            }))}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        tipoEquipo: e.target.value !== "" ? tiposEquipo.current.find((tipo: TipoEquipoDTO):
                                        boolean => tipo.id === Number(e.target.value))?.nombre : undefined
                                    }
                                });
                            }}
                        />
                        <ComboBoxFC
                            message={"Todos los países"}
                            messageSelectable={true}
                            elements={paisOrigen.current.map((pais: PaisDTO): {
                                key: number,
                                value: string
                            } => ({
                                key: pais.id as number,
                                value: pais.nombre
                            }))}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        paisOrigen: e.target.value !== "" ? paisOrigen.current.find((pais: PaisDTO):
                                        boolean => pais.id === Number(e.target.value))?.nombre : undefined
                                    }
                                });
                            }}
                        />
                        <ComboBoxFC
                            message={"Todos los proveedores"}
                            messageSelectable={true}
                            elements={proveedores.current.map((proveedor: ProveedorDTO): {
                                key: number,
                                value: string
                            } => ({
                                key: proveedor.id as number,
                                value: proveedor.nombre
                            }))}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        proveedor: e.target.value !== "" ? proveedores.current.find((proveedor: ProveedorDTO):
                                        boolean => proveedor.id === Number(e.target.value))?.nombre : undefined
                                    }
                                });
                            }}
                        />
                        <ComboBoxFC
                            message={"Todas las ubicaciones"}
                            messageSelectable={true}
                            elements={ubicaciones.current.map((ubicacion: UbicacionDTO): {
                                key: number,
                                value: string
                            } => ({
                                key: ubicacion.id as number,
                                value: ubicacion.nombre
                            }))}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
                                setSearchTerms({
                                    ...searchTerms,
                                    filter: {
                                        ...searchTerms.filter,
                                        ubicacionActual: e.target.value !== "" ? ubicaciones.current.find((ubicacion: UbicacionDTO):
                                        boolean => ubicacion.id === Number(e.target.value))?.nombre : undefined
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

// Exporta el componente (Tabla de equipos)
export default TableEquiposFC;
