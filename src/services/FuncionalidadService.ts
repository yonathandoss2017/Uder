import EquipoFilter from "@/types/filters/EquipoFilter";
import TipoEquipoDTO from "@/types/dtos/TipoEquipoDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {fetchBodyWithErrorHandling} from "@/utils/ServiceMethods";
import FuncionalidadDTO from "@/types/dtos/FuncionalidadDTO";
import EquipoFieldSortEnum from "@/types/enums/EquipoFieldSortEnum";
import PermisoEnum from "@/types/enums/PermisoEnum";

// URL base de la API REST de la API para las funcionalidades
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/funcionalidades";

export async function listarFuncionalidades(
    token: string,
    size: number = 0, page: number = 1, fieldSort: "nombre", sortDirectionAsc: boolean = true,
    ): Promise<FuncionalidadDTO[] | FetchAPIError> {

    // Parámetros de la URL de la petición a la API
    const queryParams: URLSearchParams = new URLSearchParams({
        // Parámetros de paginación y ordenación
        size: size.toString(),
        page: page.toString(),
        fieldSort: fieldSort,
        sortDirectionAsc: sortDirectionAsc.toString()
    });
    const url: string = `${SERVICE_PATH}/listar?${queryParams}`; // URL de la petición a la API
    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<FuncionalidadDTO[]>(url, options);
}

export async function contarFuncionalidades(idInstitucion:number): Promise<number> {
    const url: string = `${SERVICE_PATH}/contar?idInstitucion=${idInstitucion}`; // URL de la petición a la API
    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<number>(url, options).then((response: number | FetchAPIError): number => {
        if (isFetchAPIError(response)) {
            console.error('ERROR - EquiposService.contarEquipos:', response); // Imprime el error en consola
            return 0; // Retorna 0 en caso de error
        }
        return response; // Retorna la cantidad de equipos registrados
    });
}

export async function obtenerPermisosFuncionalidad(funcionalidad: FuncionalidadDTO): Promise<PermisoEnum[] | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/permisos?id=${funcionalidad.id}`; // URL de la petición a la API
    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<PermisoEnum[]>(url, options);
}