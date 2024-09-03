import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";

/**
 * Realiza una solicitud HTTP y maneja posibles errores en la respuesta.
 *
 * @param {string} url - La URL a la que se realiza la solicitud.
 * @param {RequestInit} options - Opciones de configuración para la solicitud.
 * @return {Promise<Response>} - Respuesta de la solicitud a la API
 * @return {Promise<FetchAPIError>} - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
async function fetchResponseWithErrorHandling(url: string, options: RequestInit): Promise<Response | FetchAPIError> {
    try {
        const response: Response = await fetch(url, options);
        if (response.ok) {
            return response;
        }

        const errorBody = await response.json();
        const errorMessage: string = errorBody.message || `Error en la solicitud a ${url} - ${response.status} ${response.statusText}`;
        return {
            errorMessage,
            status: response.status
        } as FetchAPIError;
    } catch (error) {
        console.error(`Error en la solicitud a ${url}: `, error);
        return {
            errorMessage: `Error en la solicitud a ${url} - Comunicación fallida con la API`,
            status: 500
        } as FetchAPIError;
    }
}

/**
 * Realiza una solicitud HTTP y maneja posibles errores en el cuerpo de la respuesta.
 *
 * @template T - El tipo de datos esperado en la respuesta.
 * @param {string} url - La URL a la que se realiza la solicitud.
 * @param {RequestInit} options - Opciones de configuración para la solicitud.
 * @return {Promise<T>} - Respuesta de la solicitud a la API con el cuerpo parseado como tipo T.
 * @return {Promise<FetchAPIError>} - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function fetchBodyWithErrorHandling<T>(url: string, options: RequestInit): Promise<T | FetchAPIError> {
    const response: Response | FetchAPIError = await fetchResponseWithErrorHandling(url, options);
    if (isFetchAPIError(response)) {
        return response;
    }

    try {
        const body = await response.json();
        return body as T;
    } catch (error) {
        console.error(`Error al parsear la respuesta de ${url}: `, error);
        return {
            errorMessage: `Error al parsear la respuesta de ${url}`,
            status: 500
        } as FetchAPIError;
    }
}

/**
 * Realiza una solicitud HTTP y maneja posibles errores en la respuesta.
 * (Para solicitudes que no esperan un cuerpo en la respuesta)
 *
 * @param {string} url - La URL a la que se realiza la solicitud.
 * @param {RequestInit} options - Opciones de configuración para la solicitud.
 * @return {Promise<void>} - Si la solicitud se realiza correctamente.
 * @return {Promise<FetchAPIError>} - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function fetchVoidWithErrorHandling(url: string, options: RequestInit): Promise<void | FetchAPIError> {
    const response: Response | FetchAPIError = await fetchResponseWithErrorHandling(url, options);
    if (isFetchAPIError(response)) {
        return response;
    }
}