"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de proveedores
import {fetchBodyWithErrorHandling, fetchVoidWithErrorHandling} from "@/utils/ServiceMethods";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import PermisoEnum from "@/types/enums/PermisoEnum";

// URL base de la API REST de la API para las sesiones
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/session";

/**
 * Función para autenticar a un usuario por medio de las credenciales (usuario y contraseña).
 * @param username - Nombre de usuario
 * @param password - Contraseña del usuario
 * @returns Promise<string> - Token de sesión del cliente en la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function loginCredentials(username: string, password: string): Promise<string | FetchAPIError> {
    // Codifica las credenciales en base64 para enviarlas en la cabecera de la petición
    const credentials: string = btoa(username + ":" + password);

    // URL del servicio de autenticación por credenciales
    const url: string = `${SERVICE_PATH}/login`;

    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + credentials, // Cabecera de autorización con las credenciales codificadas
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    // (token de sesión o error dado por la API)
    return await fetchBodyWithErrorHandling<string>(url, options);
}

/**
 * Función para autenticar a un usuario por medio de Google.
 * @param token - Token de autenticación de Google
 * @returns Promise<string> - Token de sesión del cliente en la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function loginGoogle(token: string): Promise<string | FetchAPIError> {
    // URL del servicio de autenticación por Google
    const url: string = `${SERVICE_PATH}/login/google`;

    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de Google
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    // (token de sesión o error dado por la API)
    return await fetchBodyWithErrorHandling<string>(url, options);
}

/**
 * Función para cerrar la sesión de un usuario en la API.
 * @param token - Token de sesión del cliente en la API
 * @returns Promise<void> - Si la solicitud se realiza correctamente.
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function logoutCliente(token: string): Promise<void | FetchAPIError> {
    // URL del servicio de cierre de sesión
    const url: string = `${SERVICE_PATH}/logout`;

    // Opciones de la petición
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
 * Función para buscar un usuario por medio de un token de sesión.
 * @param token - Token de sesión del cliente en la API
 * @returns Promise<UsuarioDTO> - Usuario encontrado en la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function buscarClientePorToken(token: string): Promise<UsuarioDTO | FetchAPIError> {
    // URL del servicio de búsqueda de usuario por token
    const url: string = `${SERVICE_PATH}/buscar/token`;

    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<UsuarioDTO>(url, options);
}

/**
 * Función para verificar si un usuario tiene un permiso específico.
 * @param token - Token de sesión del cliente en la API
 * @param permiso - Permiso a verificar
 * @returns Promise<boolean> - Resultado de la verificación
 */
export async function verificarPermiso(token: string, permiso: PermisoEnum): Promise<boolean> {
    // URL del servicio de verificación de permisos
    const url: string = `${SERVICE_PATH}/verificar-permiso?permiso=` + PermisoEnum[permiso];

    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<boolean>(url, options).then((response: boolean | FetchAPIError): boolean => {
        if (isFetchAPIError(response)) {
            console.error("ERROR - verificarPermiso: ", response)
            return false;
        }
        return response;
    });
}

/**
 * Función para modificar los datos de un usuario en la API.
 * @param usuario - Datos actualizados del usuario
 * @param token - Token de sesión del cliente en la API
 * @returns Promise<void> - Si la solicitud se realiza correctamente.
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function modificarCliente(usuario: UsuarioDTO, token: string): Promise<void | FetchAPIError> {
    // URL del servicio de modificación de usuario
    const url: string = `${SERVICE_PATH}/modificar`;

    // Opciones de la petición
    const options: RequestInit = {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(usuario) // Cuerpo de la petición con los datos actualizados del usuario
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}

/**
 * Función para cambiar la contraseña de un usuario en la API.
 * @param passActual - Contraseña actual del usuario
 * @param passNueva - Nueva contraseña del usuario
 * @param token - Token de sesión del cliente en la API
 * @resolve - Si la contraseña se cambia con éxito
 * @returns Promise<void> - Si la solicitud se realiza correctamente.
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function cambiarContrasenia(passActual: string, passNueva: string, token: string): Promise<void | FetchAPIError> {
    // URL del servicio de cambio de contraseña
    const url: string = `${SERVICE_PATH}/cambiar-pass`;

    // Encripta las contraseñas para enviarlas en la petición (Authotization: Basic)
    const passEncoded: string = btoa(passActual + ":" + passNueva); // credenciales: passActual:passNueva en base64

    // Opciones de la petición
    const options: RequestInit = {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(passEncoded) // Cuerpo de la petición vacío (Contraseña actual y nueva)
    };

    // Realiza la petición a la API
    return await fetchVoidWithErrorHandling(url, options);
}

/**
 * Función para obtener los permisos de un usuario en la API.
 * @param token - Token de sesión del cliente en la API
 * @returns Promise<PermisoEnum[]> - Permisos del usuario
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function obtenerPermisos(token: string): Promise<PermisoEnum[] | FetchAPIError> {
    // URL del servicio de obtención de permisos
    const url: string = `${SERVICE_PATH}/permisos`;

    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<PermisoEnum[]>(url, options);
}
