import {ReactElement, useEffect, useState} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import FuncionalidadDTO from "@/types/dtos/FuncionalidadDTO";
import MarcaDTO from "@/types/dtos/MarcaDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {listarMarcas} from "@/services/MarcaService";
import {listarFuncionalidades} from "@/services/FuncionalidadService";

//Props
interface TableFuncionalidadFCProps {
    sessionAPIToken: string;
    hasPermissionEdit: boolean;
    hasPermissionBaja: boolean;
    hasPermissionView: boolean;
    idInstitucion: number;
}

function TableFuncionalidadFC(props: Readonly<TableFuncionalidadFCProps>): ReactElement{

    // ----------------------- Modales -----------------------
    const {createModal} = useModal();

    //Lista de funcionalidades
    const [funcionalidades, setFuncionalidades] = useState<FuncionalidadDTO[]>([]);

    useEffect((): void => {
        (async (): Promise<void> => {
        const response: FuncionalidadDTO[] | FetchAPIError = await listarFuncionalidades(props.sessionAPIToken);

        if (isFetchAPIError(response)) {
            const errorMessage: string = response.errorMessage;
            console.error("ERROR - lista de marcas", errorMessage);
            return;
        }
        setFuncionalidades(response);
        })();
    }, []);


    return (
        <div>
            <h1>TableFuncionalidadFC</h1>
        </div>
    );
}

export default TableFuncionalidadFC;