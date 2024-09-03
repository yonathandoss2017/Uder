"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de tipos de equipo
import {fetchBodyWithErrorHandling} from "@/utils/ServiceMethods";
import TipoEquipoDTO from "@/types/dtos/TipoEquipoDTO";
import FetchAPIError from "@/types/errors/FetchAPIError";

// URL base de la API REST de la API para los tipos de equipo
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/equipos/tipos";

/**
 * Función para listar todos los tipos de equipo.
 * @param idInstitucion - ID de la institución a la que pertenecen los tipos de equipo
 * @returns Promise<TipoEquipoDTO[]> - Lista de tipos de equipo
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function listarTiposEquipo(idInstitucion: number): Promise<TipoEquipoDTO[] | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/listar/${idInstitucion}`; // URL de la petición a la API

    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
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