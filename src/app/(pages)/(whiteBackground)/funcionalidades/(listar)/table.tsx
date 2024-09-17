import {ReactElement} from "react";
import TableMarcaFC from "@/app/(pages)/(whiteBackground)/marcas/(lista)/table";

interface TableFuncionalidadFCProps {
    sessionAPIToken: string;
    hasPermissionEdit: boolean;
    hasPermissionBaja: boolean;
    hasPermissionView: boolean;
    idInstitucion: number;
}

function TableFuncionalidadFC(props: Readonly<TableFuncionalidadFCProps>): ReactElement{

    return (
        <div>
            <h1>TableFuncionalidadFC</h1>
        </div>
    );
}

export default TableFuncionalidadFC;