"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de modelos
import { fetchBodyWithErrorHandling, fetchVoidWithErrorHandling } from "@/utils/ServiceMethods";
import ModeloDTO from "@/types/dtos/ModeloDTO";
import FetchAPIError from "@/types/errors/FetchAPIError";
import ModeloFilter from "@/types/filters/ModeloFilter"; // Importar el filtro correspondiente

// URL base de la API REST de la API para los modelos
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/modelos";

/**
 * Función para listar todos los modelos.
 * @param token - Token de autorización
 * @param filter - Filtros opcionales para la búsqueda
 * @returns Promise<ModeloDTO[]> - Lista de modelos
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function listarModelos(token: string, filter: ModeloFilter = {}): Promise<ModeloDTO[] | FetchAPIError> {
    const queryParams: URLSearchParams = new URLSearchParams({
        ...(!!filter.id && { filter_id: filter.id.toString() }),
        ...(!!filter.nombre && { filter_nombre: filter.nombre }),
        ...(filter.activo != undefined && { filter_activo: filter.activo.toString() })
    });

    const url: string = `${SERVICE_PATH}/listar?${queryParams}`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<ModeloDTO[]>(url, options);
}

/**
 * Función para buscar modelo por id.
 * @param id - ID del modelo
 * @returns Promise<ModeloDTO> - Modelo devuelto por la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function buscarModeloPorId(id: number): Promise<ModeloDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/buscar/${id}`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<ModeloDTO>(url, options);
}

/**
 * Función para agregar un modelo.
 * @param modelo - Datos del modelo a agregar
 * @param token - Token de autorización
 * @returns Promise<ModeloDTO> - Modelo agregado
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function agregarModelo(modelo: ModeloDTO, token: string): Promise<ModeloDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/agregar`; // URL de la petición a la API
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(modelo)
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<ModeloDTO>(url, options);
}

/**
 * Función para modificar datos de un modelo.
 * @param modelo - Datos del modelo a modificar
 * @param token - Token de autorización
 * @returns Promise<void> - Si la solicitud se realiza correctamente.
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function modificarModelo(modelo: ModeloDTO, token: string): Promise<void | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/modificar`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(modelo)
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}

/**
 * Función para dar baja a un modelo.
 * @param id - ID del modelo a dar de baja
 * @param token - Token de autorización
 * @returns Promise<void> - Si la solicitud se realiza correctamente.
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function darBajaModelo(id: number, token: string): Promise<void | FetchAPIError> {
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
