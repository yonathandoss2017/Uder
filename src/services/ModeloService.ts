"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de modelos
import {fetchBodyWithErrorHandling} from "@/utils/ServiceMethods";
import ModeloDTO from "@/types/dtos/ModeloDTO";
import FetchAPIError from "@/types/errors/FetchAPIError";

// URL base de la API REST de la API para los modelos
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/modelos";

/**
 * Función para listar todos los modelos.
 * @param idInstitucion - ID de la institución a la que pertenecen los modelos
 * @returns Promise<ModeloDTO[]> - Lista de modelos
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function listarModelos(idInstitucion: number): Promise<ModeloDTO[] | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/listar/${idInstitucion}`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<ModeloDTO[]>(url, options);
}

/**
 * Función para buscar modelo por id.
 * @param idInstitucion - ID del modelo
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
 * Función para agregar un proveedor.
 * @param modelo - Datos del modelo a agregar
 * @param token - Token de autorización
 * @returns Promise<ModeloDTO> - Proveedor agregado
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
