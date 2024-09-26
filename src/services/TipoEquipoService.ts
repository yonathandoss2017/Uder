"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de tipos de equipo
import {fetchBodyWithErrorHandling, fetchVoidWithErrorHandling} from "@/utils/ServiceMethods";
import TipoEquipoDTO from "@/types/dtos/TipoEquipoDTO";
import FetchAPIError from "@/types/errors/FetchAPIError";
import EquipoFieldSortEnum from "@/types/enums/EquipoFieldSortEnum";
import EquipoFilter from "@/types/filters/EquipoFilter";
import EquipoDTO from "@/types/dtos/EquipoDTO";
import TipoEquipoFilter from "@/types/filters/TipoEquipoFilter";

// URL base de la API REST de la API para los tipos de equipo
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/equipos/tipos";

/**
 * Función para agregar un nuevo tipo de equipo.
 * @param tipoEquipo
 * @param token
 * @returns Promise<TipoEquipoDTO> - Tipo de equipo agregado
 */

export async function agregarTipoEquipo(tipoEquipo: TipoEquipoDTO, token: String): Promise<TipoEquipoDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/agregar`; // URL de la petición a la API

    // Opciones de la petición
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token, // Token de autenticación
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(tipoEquipo) // Cuerpo de la petición, datos del tipo de equipo
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<TipoEquipoDTO>(url, options);
}

/**
 * Función para modificar un tipo de equipo.
 * @param tipoEquipo
 * @param token
 * @returns Promise<void> - Si la solicitud se realiza correctamente
 */
export async function modificarTipoEquipo(tipoEquipo: TipoEquipoDTO, token: string): Promise<void | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/modificar`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(tipoEquipo)
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}

/**
 * Función para dar de baja un tipo de equipo.
 * @param id
 * @param token
 * @returns Promise<void> - Si la solicitud se realiza correctamente
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function darBajaTipoEquipo(id: number, token: string): Promise<void | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/baja/${id}`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}

/**
 * Función para listar todos los tipos de equipo.
 * @returns Promise<TipoEquipoDTO[]> - Lista de tipos de equipo
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function listarTiposEquipo(token: string, filter: TipoEquipoFilter = {}): Promise<TipoEquipoDTO[] | FetchAPIError> {
    // Parámetros de la URL de la petición a la API
    const queryParams: URLSearchParams = new URLSearchParams({
        // Parámetros de búsqueda adicionales de filtrado (si existen)
        ...(!!filter.id && {filter_id: filter.id.toString()}),
        ...(!!filter.nombre && {filter_nombre: filter.nombre}),
        ...(filter.activo != undefined && {filter_activo: filter.activo.toString()})
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
    return await fetchBodyWithErrorHandling<TipoEquipoDTO[]>(url, options);
}

/**
 * Función para buscar tipo de equipo por id.
 * @param id - ID del tipo de equipo
 * @returns Promise<TipoEquipoDTO> - Tipo de equipo
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function buscarTipoEquipoPorId(id: number): Promise<TipoEquipoDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/buscar/${id}`; // URL de la petición a la API

    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<TipoEquipoDTO>(url, options);
}

/**
 *
 * @param id
 * @param token
 * @returns Promise<void> - Si la solicitud se realiza correctamente.
 * @returns Promise<FetchAPIError>
 */
export async function reactivarTipoEquipo(id: number, token: string): Promise<void | FetchAPIError>{
    const url: string = `${SERVICE_PATH}/reactivar/${id}`; // URL de la petición a la API

    // Opciones de la petición
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token, // Authorization header con token JWT
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}