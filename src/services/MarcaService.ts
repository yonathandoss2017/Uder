"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de marcas
import {fetchBodyWithErrorHandling} from "@/utils/ServiceMethods";
import MarcaDTO from "@/types/dtos/MarcaDTO";
import FetchAPIError from "@/types/errors/FetchAPIError";

// URL base de la API REST de la API para las marcas
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/marcas";

/**
 * Función para listar todas las marcas.
 * @param idInstitucion - ID de la institución a la que pertenecen las marcas
 * @returns Promise<MarcaDTO[]> - Lista de marcas
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function listarMarcas(idInstitucion: number): Promise<MarcaDTO[] | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/listar/${idInstitucion}`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<MarcaDTO[]>(url, options);
}

/**
 * Función para buscar por id.
 * @param id - ID de la marca
 * @returns Promise<MarcaDTO> - Marca que brinda la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function buscarMarcaPorId (id: number): Promise<MarcaDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/buscar/${id}`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<MarcaDTO>(url, options);
}