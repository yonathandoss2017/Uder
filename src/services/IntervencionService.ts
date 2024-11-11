
"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de intervenciones
import { fetchBodyWithErrorHandling, fetchVoidWithErrorHandling } from "@/utils/ServiceMethods";
import IntervencionDTO from "@/types/dtos/IntervencionDTO";
import FetchAPIError, { isFetchAPIError } from "@/types/errors/FetchAPIError"; // Asegúrate de que esta importación sea correcta
import IntervencionFilter from "@/types/filters/IntervencionFilter";

// URL base de la API REST para las intervenciones
const SERVICE_PATH: string = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/intervenciones`;

/**
 * Función para buscar intervención por ID.
 * @param id - ID de la intervención
 * @param token
 * @returns Promise<IntervencionDTO | FetchAPIError> - Intervención que brinda la API o error.
 */
export async function buscarIntervencionPorId(id: number, token: string): Promise<IntervencionDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/buscar/${id}`; // URL de la petición a la API
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    return await fetchBodyWithErrorHandling<IntervencionDTO>(url, options);
}

/**
 * Función para agregar nueva intervención.
 * @param intervencion - Datos de la intervención a agregar
 * @param token - Token de autenticación
 * @returns Promise<IntervencionDTO | FetchAPIError> - Intervención agregada o error.
 */
export async function agregarIntervencion(intervencion: IntervencionDTO, token: string): Promise<IntervencionDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/agregar`; // URL de la petición a la API
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`, // Cabecera de autorización
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(intervencion) // Cuerpo de la petición con los datos de intervención
    };

    try {
        const response = await fetch(url, options); // Realiza la petición a la API
        if (!response.ok) {
            const errorText = await response.text();
            return {
                errorMessage: `Error en la solicitud: ${errorText}`,
                status: response.status // Obtén el estado de la respuesta
            } as FetchAPIError; // Retorna un objeto que cumple con la interfaz
        }
        return await response.json(); // Retorna la intervención agregada
    } catch (error) {
        return {
            errorMessage: `Error de red: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            status: 500 // Código de error genérico para errores de red
        } as FetchAPIError; // Retorna un objeto que cumple con la interfaz
    }
}

/**
 * Función para listar todas las intervenciones.
 * @param token - Token de autenticación
 * @param filter - Filtro para buscar intervenciones
 * @returns Promise<IntervencionDTO[] | FetchAPIError> - Lista de intervenciones o error.
 */
export async function listarIntervenciones(token: string, filter: IntervencionFilter = {}): Promise<IntervencionDTO[] | FetchAPIError> {
    // Transformar los filtros agregando el prefijo "filter_"
    const queryParams: URLSearchParams = new URLSearchParams({
        ...(filter.fechaDesde && { filter_fechaDesde: filter.fechaDesde.toISOString().split('T')[0] }),
        ...(filter.fechaHasta && { filter_fechaHasta: filter.fechaHasta.toISOString().split('T')[0] }),
        ...(filter.idEquipo && { filter_idEquipo: filter.idEquipo.toString() }),
        ...(filter.idTipoIntervencion && { filter_idTipoIntervencion: filter.idTipoIntervencion.toString() })
    });

    // Construcción de la URL con los parámetros correctos
    const url: string = `${SERVICE_PATH}/listar?${queryParams.toString()}`;
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Cabecera de autorización
            'Content-Type': 'application/json'
        }
    };

    return await fetchBodyWithErrorHandling<IntervencionDTO[]>(url, options);
}

/**
 * Función para modificar datos de una intervención.
 * @param intervencion - Datos de la intervención a modificar
 * @param token - Token de autenticación
 * @returns Promise<void | FetchAPIError> - Si la solicitud se realiza correctamente.
 */
export async function modificarIntervencion(intervencion: IntervencionDTO, token: string): Promise<void | FetchAPIError> {

    const url: string = `${SERVICE_PATH}/trabajar`; // URL de la petición a la API
    const options: RequestInit = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`, // Cabecera de autorización
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(intervencion) // Cuerpo de la petición
    };

    return await fetchVoidWithErrorHandling(url, options); // Realiza la petición y retorna el resultado
}
