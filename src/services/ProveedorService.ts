"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de proveedores
import {fetchBodyWithErrorHandling, fetchVoidWithErrorHandling} from "@/utils/ServiceMethods";
import ProveedorDTO from "@/types/dtos/ProveedorDTO";
import FetchAPIError from "@/types/errors/FetchAPIError";
import ProveedorFilter from "@/types/filters/ProveedorFilter";

// URL base de la API REST para los proveedores
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/proveedores";

/**
 * Función para listar todos los proveedores.
 * @param token - Token de autorización
 * @param filter - Filtros opcionales para la búsqueda de proveedores
 * @returns Promise<ProveedorDTO[]> - Lista de proveedores recuperada de la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function listarProveedores(token: string, filter: ProveedorFilter = {}): Promise<ProveedorDTO[] | FetchAPIError> {
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
    return await fetchBodyWithErrorHandling<ProveedorDTO[]>(url, options);
}

/**
 * Función para buscar proveedor por id.
 * @param id - ID del proveedor
 * @returns Promise<ProveedorDTO> - Proveedor recuperado de la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function buscarProveedorPorId(id: number): Promise<ProveedorDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/buscar/${id}`; // URL de la petición a la API

    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<ProveedorDTO>(url, options);
}

/**
 * Función para agregar un proveedor.
 * @param proveedor - Datos del proveedor a agregar
 * @param token - Token de autorización
 * @returns Promise<ProveedorDTO> - Proveedor agregado
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function agregarProveedor(proveedor: ProveedorDTO, token: string): Promise<ProveedorDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/agregar`; // URL de la petición a la API
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(proveedor)
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<ProveedorDTO>(url, options);
}

/**
 * Función para modificar un proveedor.
 * @param proveedor - Datos del proveedor a modificar
 * @param token - Token de autorización
 * @returns Promise<void> - Si la solicitud se realiza correctamente
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function modificarProveedor(proveedor: ProveedorDTO, token: string): Promise<void | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/modificar`; // URL de la petición a la API
    const options: RequestInit = {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(proveedor)
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}

/**
 * Función para dar de baja un proveedor.
 * @param id - ID del proveedor a dar de baja
 * @param token - Token de autorización
 * @returns Promise<void> - Si la solicitud se realiza correctamente
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function darBajaProveedor(id: number, token: string): Promise<void | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/baja/${id}`; // URL de la petición a la API
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };
    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}

/**
 *
 * @param id
 * @param token
 * @returns Promise<void> - Si la solicitud se realiza correctamente.
 * @returns Promise<FetchAPIError>
 */
export async function reactivarProveedor(id: number, token: string): Promise<void | FetchAPIError>{
    const url: string = `${SERVICE_PATH}/reactivar/${id}`; // URL de la petición a la API

    // Opciones de la petición
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token, // Authorization header con token JWT
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}
