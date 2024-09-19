"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de perfiles
import {fetchBodyWithErrorHandling, fetchVoidWithErrorHandling} from "@/utils/ServiceMethods";
import PerfilDTO from "@/types/dtos/PerfilDTO";
import FetchAPIError from "@/types/errors/FetchAPIError";

// URL base de la API REST de la API para los perfiles
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/perfiles";

/**
 * Función para listar todos los perfiles.
 * @param idInstitucion - ID de la institución a la que pertenecen los perfiles
 * @param size - Cantidad de registros a recuperar por página (0 para todos)
 * @param page - Número de página a recuperar (1 para la primera)
 * @param fieldSort - Campo por el cual se ordenarán los registros
 * @param sortDirectionAsc - Dirección de la ordenación (true para ascendente, false para descendente)
 * @returns Promise<PerfilDTO[]> - Lista de perfiles recuperada de la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function listarPerfiles(idInstitucion: number, size: number = 0, page: number = 1, fieldSort: string = "id", sortDirectionAsc: boolean = true): Promise<PerfilDTO[] | FetchAPIError> {
    // URL de la petición a la API
    const url: string = `${SERVICE_PATH}/listar/${idInstitucion}?size=${size}&page=${page}&fieldSort=${fieldSort}&sortDirectionAsc=${sortDirectionAsc}`;
    const options: RequestInit = { // Opciones de la petición
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<PerfilDTO[]>(url, options);
}

/**
 * Función para buscar un perfil por su ID.
 * @param id - ID del perfil a buscar
 * @returns Promise<PerfilDTO> - Perfil encontrado en la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function buscarPerfilPorId(id: number): Promise<PerfilDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/buscar/${id}`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<PerfilDTO>(url, options);
}

/**
 * Función para agregar un nuevo perfil.
 * @param perfil - Datos del perfil que se quiere registrar (solo incluye el nombre en este caso)
 * @param token - Token de sesión para autenticación
 * @returns Promise<PerfilDTO> - Perfil registrado en la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function agregarPerfil(perfil: PerfilDTO, token: string): Promise<PerfilDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/agregar`; // URL de la API
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Se envía el token para autenticación
        },
        body: JSON.stringify({
            nombre: perfil.nombre,   // Enviar solo el nombre del perfil
            nivel: perfil.nivel      // Enviar solo el nivel del perfil
        })
    };

    try {
        const response = await fetch(url, options);

        // Verifica si la respuesta fue exitosa
        if (!response.ok) {
            const errorData = await response.json();
            return { errorMessage: errorData.message } as FetchAPIError;
        }

        const data = await response.json();
        return data as PerfilDTO; // Devuelve el perfil actualizado
    } catch (error) {
        return { errorMessage: 'Error en la solicitud al servidor.' } as FetchAPIError;
    }
}

/**
 * Función para modificar un perfil.
 * @param perfil - Datos del perfil a modificar
 * @param token - Token de autorización
 * @returns Promise<void> - Si la solicitud se realiza correctamente
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function modificarPerfil(perfil: PerfilDTO, token: string): Promise<void | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/modificar`; // URL de la petición a la API para modificar el perfil
    const options: RequestInit = {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(perfil) // Cuerpo de la petición con los datos del perfil en formato JSON
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}

/**
 * Función para dar de baja un perfil.
 * @param id - ID del perfil a dar de baja
 * @param token - Token de autorización
 * @returns Promise<void> - Si la solicitud se realiza correctamente
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function darBajaPerfil(id: number, token: string): Promise<void | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/baja/${id}`; // URL de la petición a la API para dar de baja el perfil
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
