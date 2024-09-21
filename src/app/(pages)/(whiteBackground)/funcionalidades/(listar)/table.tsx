"use client"

import React, {ReactElement, useEffect,useState} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import FuncionalidadDTO from "@/types/dtos/FuncionalidadDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {contarFuncionalidades, listarFuncionalidades} from "@/services/FuncionalidadService";
import LoadingPage from "@/app/(pages)/loading";
import stylesTable from "@public/styles/modules/table/table.equipos.module.css";

//Props
interface TableFuncionalidadFCProps {
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
    fieldSort: "nombre";
    sortDirectionAsc: boolean;
}

function TableFuncionalidadFC(props: Readonly<TableFuncionalidadFCProps>): ReactElement {

    // ----------------------- Modales -----------------------
    const {createModal} = useModal();

    // ----------------------- Términos de paginación -----------------------

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [npage, setNpage] = useState<number>(1);
    const recordsPerPage: number = 5;

    //Define si ha cargado
    const [loading, setLoading] = useState<boolean>(false);

    const [searchTerms, setSearchTerms]: [TableSearchTermsProps, (value: TableSearchTermsProps) => void]
        = useState<TableSearchTermsProps>({
        size: recordsPerPage,
        page: currentPage,
        fieldSort: "nombre",
        sortDirectionAsc: true
    });

    // Define los términos de búsqueda aplicados en la tabla de funcionalidades (appliedSearchTerms)
    // y la función para modificarlos (setAppliedSearchTerms)
    const [appliedSearchTerms, setAppliedSearchTerms]: [TableSearchTermsProps, (value: TableSearchTermsProps) => void]
        = useState<TableSearchTermsProps>(searchTerms);

    useEffect((): void => {
        setAppliedSearchTerms(searchTerms); // Actualiza los términos de búsqueda
    }, [searchTerms]);

    //Lista de funcionalidades
    const [funcionalidades, setFuncionalidades] = useState<FuncionalidadDTO[]>([]);

    useEffect((): void => {
        (async (): Promise<void> => {
            const response: FuncionalidadDTO[] | FetchAPIError = await listarFuncionalidades(props.sessionAPIToken, appliedSearchTerms.size, appliedSearchTerms.page, appliedSearchTerms.fieldSort, appliedSearchTerms.sortDirectionAsc);

            if (isFetchAPIError(response)) {
                const errorMessage: string = response.errorMessage;
                console.error("ERROR - lista de marcas", errorMessage);
                return;
            }
            setFuncionalidades(response);
            console.log(response);
            calcularPaginas();
        })();
    }, [appliedSearchTerms]);

    //Metodo para calcular paginas disponibles
    function calcularPaginas(): void {
        contarFuncionalidades(props.idInstitucion)
            .then((response: number | FetchAPIError) => {
                if (isFetchAPIError(response)) { //Si hay error
                    console.error("ERROR: " + response.errorMessage)
                    return 0;
                }
                //Obtenemos el total de funcionalidades de la respuesta
                const total = Number(response);
                //La cantidad de paginas es el total de funcionalidades dividido la cantidad de funcionalidades por pagina que se muestran
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

    //Se ejecuta cada vez que cambia la página actual
    useEffect(() => {
        setSearchTerms({
            ...searchTerms,
            page: currentPage //Sea actualizan los parametros de búsqueda
        });

    }, [currentPage]); //Cuando cambia la página

    //if (!loading) return <LoadingPage/>
    return (
        <div>
            <div className={stylesTable.containerPage}>
                <div className={stylesTable.containerTable}>
                    <div className={stylesTable.scroll}>
                        {funcionalidades.length > 0 ? (
                            <table style={{width: "100%"}}>
                                <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                {funcionalidades.map((funcionalidad: FuncionalidadDTO) => (
                                    <tr key={funcionalidad.id}>
                                        <td>{funcionalidad.nombre}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>) : <h3>No se encontraron funcionalidades</h3>}
                    </div>
                    {funcionalidades.length > 0 && (
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
                </div>
            </div>
        </div>
    );
}

export default TableFuncionalidadFC;