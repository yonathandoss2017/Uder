
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

    return await fetchBodyWithErrorHandling<IntervencionDTO>(url, options);
}

/**
 * Función para listar todas las intervenciones.
 * @param token - Token de autenticación
 * @param size
 * @param page
 * @param fieldsort
 * @param sortDirectionAsc
 * @param filter - Filtro para buscar intervenciones
 * @returns Promise<IntervencionDTO[] | FetchAPIError> - Lista de intervenciones o error.
 */
export async function listarIntervenciones(
    token: string,
    size:number =0, page: number =1, fieldsort:string = "id", sortDirectionAsc:boolean = true,
    filter: IntervencionFilter = {}): Promise<IntervencionDTO[] | FetchAPIError> {
    // Transformar los filtros agregando el prefijo "filter_"
    const queryParams: URLSearchParams = new URLSearchParams({

        //Parámetros de paginación
        size: size.toString(),
        page: page.toString(),
        fieldsort: fieldsort,
        sortDirectionAsc: sortDirectionAsc.toString(),

        ...(filter.fechaDesde && { filter_fechaDesde: filter.fechaDesde.toISOString().split('T')[0] }),
        ...(filter.fechaHasta && { filter_fechaHasta: filter.fechaHasta.toISOString().split('T')[0] }),
        ...(filter.tipoIntervencion && { filter_tipoIntervencion: filter.tipoIntervencion})
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

export async function contarIntervenciones(token: string, filter: IntervencionFilter = {}): Promise<number> {
    const queryParams: URLSearchParams = new URLSearchParams({
        ...(filter.fechaDesde && { filter_fechaDesde: filter.fechaDesde.toISOString().split('T')[0] }),
        ...(filter.fechaHasta && { filter_fechaHasta: filter.fechaHasta.toISOString().split('T')[0] }),
        ...(filter.tipoIntervencion && { filter_tipoIntervencion: filter.tipoIntervencion.toString() })
    });

    const url: string = `${SERVICE_PATH}/contar?${queryParams.toString()}`;
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    return await fetchBodyWithErrorHandling<number>(url, options).then((response: number | FetchAPIError): number => {
        if (isFetchAPIError(response)) {
            return 0;
        }
        return response;
    });
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
