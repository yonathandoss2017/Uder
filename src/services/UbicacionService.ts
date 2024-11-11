"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de ubicaciones
import {fetchBodyWithErrorHandling} from "@/utils/ServiceMethods";
import UbicacionDTO from "@/types/dtos/UbicacionDTO";
import FetchAPIError from "@/types/errors/FetchAPIError";
import UbicacionFilter from "@/types/filters/UbicacionFilter";

// URL base de la API REST de la API para las ubicaciones
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/ubicaciones";

/**
 * Función para listar todas las ubicaciones.
 * @param token - Token de autenticación del usuario
 * @param size - Cantidad de registros a recuperar por página (0 para todos)
 * @param page - Número de página a recuperar (1 para la primera)
 * @param fieldSort - Campo por el cual se ordenarán los registros
 * @param sortDirectionAsc - Dirección de la ordenación (true para ascendente, false para descendente)
 * @param filter - Filtros de búsqueda de ubicaciones (opcional)
 * @returns Promise<UbicacionDTO[]> - Lista de ubicaciones
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function listarUbicaciones(
    token: string,
    size: number = 0, page: number = 1, fieldSort: string = "id", sortDirectionAsc: boolean = true,
    filter: UbicacionFilter = {}
): Promise<UbicacionDTO[] | FetchAPIError> {
    // Parámetros de la URL de la petición a la API
    const queryParams: URLSearchParams = new URLSearchParams({
        // Parámetros de paginación y ordenación
        size: size.toString(),
        page: page.toString(),
        fieldSort: fieldSort,
        sortDirectionAsc: sortDirectionAsc.toString(),

        // Parámetros de búsqueda adicionales de filtrado (si existen)
        ...(!!filter.nombre && {filter_nombre: filter.nombre}),
        ...(!!filter.nombreSector && {filter_descripcion: filter.nombreSector}),
        ...(filter.activo != undefined && {filter_activo: filter.activo.toString()})
    });

    // URL de la petición a la API
    const url: string = `${SERVICE_PATH}/listar?${queryParams}`;

    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Authorization header con token JWT
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<UbicacionDTO[]>(url, options);
}

export async function buscarUbicacionPorId(id:number, token: string): Promise<UbicacionDTO | FetchAPIError>{
    const url: string = `${SERVICE_PATH}/buscar/${id}`;
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    };

    return await fetchBodyWithErrorHandling<UbicacionDTO>(url, options);
}
