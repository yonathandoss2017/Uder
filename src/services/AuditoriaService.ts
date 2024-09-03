"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de auditorías
import {fetchBodyWithErrorHandling} from "@/utils/ServiceMethods";
import AuditoriaDTO from "@/types/dtos/AuditoriaDTO";
import FetchAPIError from "@/types/errors/FetchAPIError";

// URL base de la API REST de la API para las auditorias
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/auditorias";

/**
 * Función para listar todas las auditorías disponibles.
 * @param token - Token de autenticación del usuario
 * @returns Promise<AuditoriaDTO[]> - Lista de auditorías recuperadas de la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function listarAuditorias(token: string): Promise<AuditoriaDTO[] | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/listar`;

    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<AuditoriaDTO[]>(url, options);
}
