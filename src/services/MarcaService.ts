"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de marcas
import {fetchBodyWithErrorHandling, fetchVoidWithErrorHandling} from "@/utils/ServiceMethods";
import MarcaDTO from "@/types/dtos/MarcaDTO";
import FetchAPIError from "@/types/errors/FetchAPIError";
import MarcaFieldSortEnum from "@/types/enums/MarcaFieldSortEnum";
import MarcaFilter from "@/types/filters/MarcaFilter";
import EquipoDTO from "@/types/dtos/EquipoDTO";
import EquipoFilter from "@/types/filters/EquipoFilter";
import TipoEquipoDTO from "@/types/dtos/TipoEquipoDTO";

// URL base de la API REST de la API para las marcas
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/marcas";


/**
 * Función para listar todas las marcas.
 * @param idInstitucion - ID de la institución a la que pertenecen las marcas
 * @returns Promise<MarcaDTO[]> - Lista de marcas
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
/*export async function listarMarcas(idInstitucion: number): Promise<MarcaDTO[] | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/listar/${idInstitucion}`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<MarcaDTO[]>(url, options);
}*/

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

/**
 * Funciòn agregar nueva marca
 * @param marca - Dato de marca a agregar
 * @param token - Token
 * @returns Promise<MarcaDTO - Marca agregado correctamente en la APU
 * @returns FetchAPIError - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function agregarMarca(marca: MarcaDTO, token: String): Promise<MarcaDTO | FetchAPIError>{
    const url: string = `${SERVICE_PATH}/agregar`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(marca) // Cuerpo de la petición con los datos de marca
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<MarcaDTO>(url, options);
}

/**
 * Función listar todas las marcas
 * @param token
 * @param filter
 * @returns Promise<MarcaDTO[]> - Lista de marcas recuperadas de la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function listarMarcas(token: string, filter: MarcaFilter = {}): Promise<MarcaDTO[] | FetchAPIError> {
    // Parámetros de la URL de la petición a la API
    const queryParams: URLSearchParams = new URLSearchParams({
        // Parámetros de búsqueda adicionales de filtrado (si existen)
        ...(!!filter.id && {filter_id: filter.id.toString()}),
        ...(!!filter.nombre && {filter_nombre: filter.nombre}),
        ...(filter.activo != undefined && {filter_activo: filter.activo.toString()})
    });
    const url: string = `${SERVICE_PATH}/listar?${queryParams}`; // URL de la petición a la API

    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<MarcaDTO[]>(url, options);
}

/**
 * Funciòn para modficar datos de una marca
 * @param marca
 * @param token
 * @returns Promise<void> - Si la solicitud se realiza correctamente.
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function modificarMarca(marca: MarcaDTO, token: string): Promise<void | FetchAPIError>{
    const url: string = `${SERVICE_PATH}/modificar`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(marca)
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}


/**
 * Funciòn para dar baja marca
 * @param bajaMarca
 * @param token
 * @returns Promise<void> - Si la solicitud se realiza correctamente.
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function darBajaMarca(bajaMarca: MarcaDTO, token: string): Promise<void | FetchAPIError>{
    const url: string = `${SERVICE_PATH}/baja`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(bajaMarca) // Cuerpo de la petición con los datos de baja del equipo
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}
