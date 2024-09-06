import MarcaFilter from "@/types/filters/MarcaFilter";
import React, { MutableRefObject, ReactElement, useEffect, useRef, useState } from "react";
import { useModal } from "@/app/hooks/modals/useModal";
import MarcaDTO from "@/types/dtos/MarcaDTO";
import FetchAPIError, { isFetchAPIError } from "@/types/errors/FetchAPIError";
import { listarMarcas } from "@/services/MarcaService";
import stylesTable from "@public/styles/modules/table/table.equipos.module.css";

/**
 *  Propiedades del componente TableTiposEquiposFC
 *  @interface TableMarcaFCProps
 *  @property {string} sessionAPIToken - Token de la sesión del cliente en la API
 *  @property {boolean} hasPermissionEdit - Indica si el cliente tiene permisos para editar
 *  @property {boolean} hasPermissionBaja - Indica si el cliente tiene permisos para dar de baja
 *  @property {boolean} hasPermissionView - Indica si el cliente tiene permisos para ver
 *  @property {number} idInstitucion - ID de la institución del cliente
 **/
interface TableMarcaFCProps {
    sessionAPIToken: string;
    hasPermissionEdit: boolean;
    hasPermissionBaja: boolean;
    hasPermissionView: boolean;
    idInstitucion: number;
}

interface TableSearchTermsProps {
    filter: MarcaFilter;
}

function TableMarcaFC(props: Readonly<TableMarcaFCProps>): ReactElement {

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

    const [marca, setMarca] = useState<MarcaDTO[]>([]);

    useEffect((): void => {
        (async (): Promise<void> => {
            const response: MarcaDTO[] | FetchAPIError = await listarMarcas(props.sessionAPIToken, appliedSearchTerms.filter);

            if (isFetchAPIError(response)) {
                console.error("ERROR - lista de marcas", response.errorMessage);
                return;
            }

            setMarca(response);
        })();
    }, [appliedSearchTerms]);

    return (
        <div className={stylesTable.containerPage}>
            <div className={stylesTable.containerTable}>
                <div className={stylesTable.scroll}>
                    {marca.length > 0 ? (
                        <table style={{ width: "100%" }}>
                            <thead>
                            <tr>
                                <th>Nombre</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {marca.map((marca: MarcaDTO) => (
                                <tr key={marca.id}>
                                    <td>{marca.nombre}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <h3>No se encontraron marcas</h3>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TableMarcaFC;
