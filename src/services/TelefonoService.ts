"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de telefonos
import {fetchBodyWithErrorHandling, fetchVoidWithErrorHandling} from "@/utils/ServiceMethods";
import TelefonoDTO from "@/types/dtos/TelefonoDTO";
import FetchAPIError from "@/types/errors/FetchAPIError";

// URL base de la API REST de la API para los telefonos
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/telefonos";

/**
 * Función para obtener la lista de telefonos por ID de usuario.
 * @param idUsuario - ID del usuario
 * @param token - Token de sesión del cliente en la API
 * @returns Promise<TelefonoDTO[]> - Lista de telefonos del usuario
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function obtenerTelefonosPorUsuario(idUsuario: number, token: string): Promise<TelefonoDTO[] | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/listar/usuario/${idUsuario}`; // URL de la petición a la API

    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<TelefonoDTO[]>(url, options);
}

/**
 * Función para agregar un telefono.
 * @param telefono - Datos del telefono a agregar
 * @param token - Token de sesión del cliente en la API
 * @returns Promise<TelefonoDTO> - Datos del telefono agregado
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function agregarTelefono(telefono: TelefonoDTO, token: string): Promise<TelefonoDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/agregar`; // URL de la petición a la API

    // Opciones de la petición
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(telefono) // Cuerpo de la petición con los datos del telefono a agregar
    };

    // Realiza la petición a la API
    return await fetchBodyWithErrorHandling<TelefonoDTO>(url, options);
}

/**
 * Función para eliminar un telefono por su ID.
 * @param id - ID del telefono a eliminar
 * @param token - Token de sesión del cliente en la API
 * @returns Promise<void> - Si la solicitud se realiza correctamente.
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function eliminarTelefono(id: number, token: string): Promise<void | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/eliminar/${id}`; // URL de la petición a la API

    // Opciones de la petición
    const options: RequestInit = {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}
