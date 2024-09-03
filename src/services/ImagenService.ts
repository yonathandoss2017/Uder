"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de imágenes
import {fetchBodyWithErrorHandling, fetchVoidWithErrorHandling} from "@/utils/ServiceMethods";
import ImagenDTO from "@/types/dtos/ImagenDTO";
import FetchAPIError from "@/types/errors/FetchAPIError";

// URL base de la API REST de la API para las imágenes de equipos
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/img";

/**
 * Función para listar todas las imágenes asociadas a un equipo
 * @param idEquipo - ID del equipo del cual se listarán las imágenes
 * @returns Promise<ImagenDTO[]> - Lista de imágenes del equipo recuperadas de la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function listarImagenes(idEquipo: number): Promise<ImagenDTO[] | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/equipo/${idEquipo}`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<ImagenDTO[]>(url, options);
}

/**
 * Función para agregar una nueva imagen a un equipo.
 * @param imagen - Objeto ImagenDTO que contiene los datos de la imagen a agregar (Debe incluir el ID del equipo)
 * @param token - Token de autorización para la operación
 * @returns Promise<void> - Si la solicitud se realiza correctamente.
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function agregarImagen(imagen: ImagenDTO, token: string): Promise<void | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/agregar`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token, // Token de autorización
            'Content-Type': 'application/json', // Tipo de contenido JSON
        },
        body: JSON.stringify(imagen) // Cuerpo de la petición con los datos de la imagen
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}

/**
 * Función para eliminar una imagen de un equipo.
 * @param id - ID de la imagen a eliminar
 * @param token - Token de autorización para la operación
 * @returns Promise<void> - Si la solicitud se realiza correctamente.
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function eliminarImagen(id: number, token: string): Promise<void | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/eliminar/${id}`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token, // Token de autorización
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}
