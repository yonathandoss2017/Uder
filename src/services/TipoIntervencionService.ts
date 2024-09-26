"use server";

// Importamos las funciones y tipos necesarios para el servicio de tipos de intervención
import { fetchBodyWithErrorHandling, fetchVoidWithErrorHandling } from "@/utils/ServiceMethods";
import TipoIntervencionDTO from "@/types/dtos/TipoIntervencionDTO";
import FetchAPIError from "@/types/errors/FetchAPIError";
import TipoIntervencionFilter from "@/types/filters/TipoIntervencionFilter";

// URL base de la API REST para los tipos de intervención
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/intervenciones/tipos";

/**
 * Función para agregar un nuevo tipo de intervención.
 * @param tipoIntervencion - Datos del nuevo tipo de intervención
 * @param token - Token de autenticación
 * @returns Promise<TipoIntervencionDTO | FetchAPIError> - Tipo de intervención agregado o error
 */
export async function agregarTipoIntervencion(tipoIntervencion: TipoIntervencionDTO, token: string): Promise<TipoIntervencionDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/agregar`;

    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tipoIntervencion),
    };

    return await fetchBodyWithErrorHandling<TipoIntervencionDTO>(url, options);
}

/**
 * Función para modificar un tipo de intervención existente.
 * @param tipoIntervencion - Datos del tipo de intervención a modificar
 * @param token - Token de autenticación
 * @returns Promise<void | FetchAPIError> - Confirmación o error
 */
export async function modificarTipoIntervencion(tipoIntervencion: TipoIntervencionDTO, token: string): Promise<void | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/modificar`;

    const options: RequestInit = {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tipoIntervencion),
    };

    return await fetchVoidWithErrorHandling(url, options);
}

/**
 * Función para dar de baja un tipo de intervención.
 * @param id - ID del tipo de intervención a dar de baja
 * @param token - Token de autenticación
 * @returns Promise<void | FetchAPIError> - Confirmación o error
 */
export async function darBajaTipoIntervencion(id: number, token: string): Promise<void | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/baja/${id}`;

    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
        },
    };

    return await fetchVoidWithErrorHandling(url, options);
}

/**
 * Función para listar todos los tipos de intervención.
 * @param token - Token de autenticación
 * @param filter - Opcional: Filtros para la búsqueda
 * @returns Promise<TipoIntervencionDTO[] | FetchAPIError> - Lista de tipos de intervención o error
 */
export async function listarTiposIntervencion(token: string, filter: TipoIntervencionFilter = {}): Promise<TipoIntervencionDTO[] | FetchAPIError> {
    // Parámetros de la URL de la petición a la API
    const queryParams: URLSearchParams = new URLSearchParams({
        ...(!!filter.id && { filter_id: filter.id.toString() }),
        ...(!!filter.nombre && { filter_nombre: filter.nombre }),
        ...(filter.activo != undefined && { filter_activo: filter.activo.toString() }),
    });

    const url: string = `${SERVICE_PATH}/listar?${queryParams}`;

    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
        },
    };

    return await fetchBodyWithErrorHandling<TipoIntervencionDTO[]>(url, options);
}

/**
 * Función para buscar un tipo de intervención por ID.
 * @param id - ID del tipo de intervención
 * @returns Promise<TipoIntervencionDTO | FetchAPIError> - Tipo de intervención encontrado o error
 */
export async function buscarTipoIntervencionPorId(id: number): Promise<TipoIntervencionDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/buscar/${id}`;

    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    return await fetchBodyWithErrorHandling<TipoIntervencionDTO>(url, options);
}
