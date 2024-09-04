"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de proveedores
import {fetchBodyWithErrorHandling} from "@/utils/ServiceMethods";
import ProveedorDTO from "@/types/dtos/ProveedorDTO";
import FetchAPIError from "@/types/errors/FetchAPIError";

// URL base de la API REST de la API para los proveedores
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/proveedores";

/**
 * Función para listar todos los proveedores.
 * @param idInstitucion - ID de la institución a la que pertenecen los proveedores
 * @returns Promise<ProveedorDTO[]> - Lista de proveedores recuperada de la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function listarProveedores(idInstitucion: number): Promise<ProveedorDTO[] | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/listar/${idInstitucion}`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<ProveedorDTO[]>(url, options);
}

/**
 * Función para buscar proveedor por id.
 * @param id- ID del proveedor
 * @returns Promise<ProveedorDTO> - Proveedor recuperado de la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function buscarProveedorPorId (id: number): Promise<ProveedorDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/buscar/${id}`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<ProveedorDTO>(url, options);
}

/**
 * @param proveedor
 * @param token
 * @returns Promise<ProveedorDTO>
 * @returns Promise<FetchAPIError>
 */
export async function agregarProveedor (proveedor: ProveedorDTO, token: string): Promise<ProveedorDTO | FetchAPIError> {

    const url: string = `${SERVICE_PATH}/agregar`;
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(proveedor)
    };
    return await fetchBodyWithErrorHandling<ProveedorDTO>(url, options);
}

/**
 * @param proveedor
 * @param token
 * @returns Promise<void>
 * @returns Promise<FetchAPIError>
 */
export async function modificarProveedor (proveedor: ProveedorDTO, token: string): Promise<ProveedorDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/modificar`;
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(proveedor)
    };
    return await fetchBodyWithErrorHandling<ProveedorDTO>(url, options);
}

/**
 * @param proveedor
 * @param token
 * @returns Promise<void>
 * @returns Promise<FetchAPIError>
 */
export async function darBajaProveedor (proveedor: ProveedorDTO, token: string): Promise<ProveedorDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/baja`;
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(proveedor)
    }
    return await fetchBodyWithErrorHandling(url, options)
}



