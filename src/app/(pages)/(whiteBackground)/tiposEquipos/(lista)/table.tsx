"use client";

import React, {MutableRefObject, ReactElement, useEffect, useRef, useState} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import TipoEquipoDTO from "@/types/dtos/TipoEquipoDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {listarTiposEquipo} from "@/services/TipoEquipoService";
import TipoEquipoFilter from "@/types/filters/TipoEquipoFilter";
import stylesTable from "@public/styles/modules/table/table.equipos.module.css";

/**
 *  Propiedades del componente TableTiposEquiposFC
 *  @interface TableTiposEquipoFCProps
 *  @property {string} sessionAPIToken - Token de la sesión del cliente en la API
 *  @property {boolean} hasPermissionEdit - Indica si el cliente tiene permisos para editar
 *  @property {boolean} hasPermissionBaja - Indica si el cliente tiene permisos para dar de baja
 *  @property {boolean} hasPermissionView - Indica si el cliente tiene permisos para ver
 *  @property {number} idInstitucion - ID de la institución del cliente
 **/

interface TableTiposEquipoFCProps {
    sessionAPIToken: string;
    hasPermissionEdit: boolean;
    hasPermissionBaja: boolean;
    hasPermissionView: boolean;
    idInstitucion: number;
}

/**
 * Propiedades de los filtros de la tabla
 **/

interface TableSearchTermsProps{
    filter: TipoEquipoFilter;
}

function TableTiposEquiposFC(props: Readonly<TableTiposEquipoFCProps>): ReactElement{

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    // ----------------------- Términos de búsqueda  -----------------------

    // Define los términos de búsqueda introducidos por el usuario en tiempo real (searchTerms)
    // y la función para modificarlos (setSearchTerms)
    const [searchTerms, setSearchTerms]: [TableSearchTermsProps, (value: TableSearchTermsProps) => void]
        = useState<TableSearchTermsProps>({
        filter: {activo: true}
    });

    // Define los términos de búsqueda aplicados en la tabla de tipos de equipos (appliedSearchTerms)
    // y la función para modificarlos (setAppliedSearchTerms)
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

    // ----------------------- Lista de tipos de equipo -----------------------

    //Define la lista de tipos de equipos a mostrar en la tabla
    const [tiposEquipos, setTiposEquipos] = useState<TipoEquipoDTO[]>([]);

    // Efecto que se ejecuta al montar el componente y cuando cambian los términos de búsqueda.
    // Actualiza la lista de tipos de equipo según los términos de búsqueda.
    useEffect((): void => {
        // Procedimiento asíncrono auto-ejecutable para ejecutar código asíncrono
        (async (): Promise<void> => {
            // Obtiene la lista de equipos de la API
            const response: TipoEquipoDTO[] | FetchAPIError = await listarTiposEquipo(props.sessionAPIToken, appliedSearchTerms.filter);

            // Si ocurre un error en la solicitud, muestra un mensaje de error en la consola y no hace nada
            if (isFetchAPIError(response)) {
                console.error("ERROR - lista de equipos - table.tsx - listarEquipos", response.errorMessage);
                return;
            }

            // Guarda la lista de equipos
            setTiposEquipos(response);
        })();

    }, [appliedSearchTerms]);

    return(
        <div className={stylesTable.containerPage}>
            <div className={stylesTable.containerTable}>
                <div className={stylesTable.scroll}>
                    {tiposEquipos.length > 0 ? (
                        <table style={{width: "100%"}}>
                            <thead>
                            <tr>
                                <th>Nombre</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {tiposEquipos.map((tiposEquipo: TipoEquipoDTO) => (
                                <tr key={tiposEquipo.id}>
                                    <td>{tiposEquipo.nombre}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>) : <h3>No se encontraron equipos</h3>}
                </div>
            </div>
        </div>
    );
}

export default TableTiposEquiposFC;


