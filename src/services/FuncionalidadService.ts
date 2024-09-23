import EquipoFilter from "@/types/filters/EquipoFilter";
import TipoEquipoDTO from "@/types/dtos/TipoEquipoDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {fetchBodyWithErrorHandling, fetchVoidWithErrorHandling} from "@/utils/ServiceMethods";
import FuncionalidadDTO from "@/types/dtos/FuncionalidadDTO";
import EquipoFieldSortEnum from "@/types/enums/EquipoFieldSortEnum";
import PermisoEnum from "@/types/enums/PermisoEnum";

// URL base de la API REST de la API para las funcionalidades
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/funcionalidades";

/**
 * Función para listar funcoionalidades.
 * @param token
 * @param size
 * @param page
 * @param fieldSort
 * @param sortDirectionAsc
 * @returns Promise<FuncionalidadDTO[]> - Lista de funcionalidades registradas
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
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

/**
 * Función para contar las funcionalidades de una institucion
 * @param idInstitucion
 * @returns Promise<number> - Cantidad de funcionalidades registradas
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
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

/**
 * Función para obtener los permisos de una funcionalidad.
 * @param funcionalidad
 * @param token
 * @returns Promise<PermisoEnum[]> - Lista de permisos de la funcionalidad
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
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

/**
 * Función para modificar una funcionalidad.
 * @param funcionalidad
 * @param token
 * @returns Promise<void> - Si la solicitud se realiza correctamente
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function modificarFuncionalidad(funcionalidad: FuncionalidadDTO, token: string): Promise<void | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/modificar`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(funcionalidad) // Cuerpo de la petición
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}

/**
 * Función para agregar una funcionalidad
 * @param funcionalidad
 * @param token
 * @returns Promise<FuncionalidadDTO> - Si la solicitud se realiza correctamente
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function agregarFuncionalidad(funcionalidad: FuncionalidadDTO, token: String): Promise<FuncionalidadDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/agregar`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(funcionalidad) // Cuerpo de la petición
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<FuncionalidadDTO>(url, options);
}

/**
 * Función para dar de baja una funcionalidad.
 * @param id
 * @param token
 * @returns Promise<void> - Si la solicitud se realiza correctamente
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function darBajaFuncionalidad(id: number, token: string): Promise<void | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/baja/${id}`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}