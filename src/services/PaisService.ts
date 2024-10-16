"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de países
import {fetchBodyWithErrorHandling} from "@/utils/ServiceMethods";
import PaisDTO from "@/types/dtos/PaisDTO";
import FetchAPIError from "@/types/errors/FetchAPIError";
import MarcaFilter from "@/types/filters/MarcaFilter";
import MarcaDTO from "@/types/dtos/MarcaDTO";
import PaisFilter from "@/types/filters/PaisFilter";

// URL base de la API REST de la API para los países
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/paises";

/**
 * Función para listar todos los países.
 * @returns Promise<PaisDTO[]> - Lista de países recuperada de la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 * @param token
 * @param filter
 */
export async function listarPaises(token: string, filter: PaisFilter = {}): Promise<PaisDTO[] | FetchAPIError> {
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
    return await fetchBodyWithErrorHandling<MarcaDTO[]>(url, options);
}


/**
 * Función para buscar pais por ID.
 * @param id - ID del pais
 * @param token
 * @returns Promise<PaisDTO[]> - País recuperado de la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function buscarPaisPorId(id: number, token: string): Promise<PaisDTO | FetchAPIError> {

    const url: string = `${SERVICE_PATH}/buscar/${id}`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<PaisDTO>(url, options);

}

