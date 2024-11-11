"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de instituciones
import {fetchBodyWithErrorHandling} from "@/utils/ServiceMethods";
import InstitucionDTO from "@/types/dtos/InstitucionDTO";
import FetchAPIError from "@/types/errors/FetchAPIError";

// URL base de la API REST de la API para las instituciones
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/instituciones";

/**
 * Función para listar todas las instituciones disponibles.
 * @returns Promise<InstitucionDTO[]> - Lista de instituciones
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function listarInstituciones(): Promise<InstitucionDTO[] | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/listar`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<InstitucionDTO[]>(url, options);
}

/**
 * Función para buscar una institución por su ID.
 * @param id - ID de la institución a buscar
 * @param token
 * @returns Promise<InstitucionDTO> - Institución encontrada en la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function buscarInstitucionPorId(id: number, token:string): Promise<InstitucionDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/buscar/${id}`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<InstitucionDTO>(url, options);

}