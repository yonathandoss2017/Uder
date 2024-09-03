"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de países
import {fetchBodyWithErrorHandling} from "@/utils/ServiceMethods";
import PaisDTO from "@/types/dtos/PaisDTO";
import FetchAPIError from "@/types/errors/FetchAPIError";

// URL base de la API REST de la API para los países
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/paises";

/**
 * Función para listar todos los países.
 * @param idInstitucion - ID de la institución a la que pertenecen los países
 * @returns Promise<PaisDTO[]> - Lista de países recuperada de la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function listarPaises(idInstitucion: number): Promise<PaisDTO[] | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/listar/${idInstitucion}`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<PaisDTO[]>(url, options);
}


/**
 * Función para buscar pais por ID.
 * @param id - ID del pais
 * @returns Promise<PaisDTO[]> - País recuperado de la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function buscarPaisPorId(id: number): Promise<PaisDTO | FetchAPIError> {

    const url: string = `${SERVICE_PATH}/buscar/${id}`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<PaisDTO>(url, options);

}

