"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de usuarios
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import {fetchBodyWithErrorHandling, fetchVoidWithErrorHandling} from "@/utils/ServiceMethods";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import UsuarioFilter from "@/types/filters/UsuarioFilter";
import UsuarioFieldSortEnum from "@/types/enums/UsuarioFieldSortEnum";

// URL base de la API REST de la API para los usuarios
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/usuarios";

/**
 * Función para listar todos los usuarios.
 * @param token - Token de autenticación del usuario
 * @param size - Cantidad de registros a recuperar por página (0 para todos)
 * @param page - Número de página a recuperar (1 para la primera)
 * @param fieldSort - Campo por el cual se ordenarán los registros
 * @param sortDirectionAsc - Dirección de la ordenación (true para ascendente, false para descendente)
 * @param filter - Filtros de búsqueda de equipos (opcional)
 * @returns Promise<UsuarioDTO[]> - Lista de usuarios
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function listarUsuarios(
    token: string,
    size: number, page: number,
    fieldSort: UsuarioFieldSortEnum = UsuarioFieldSortEnum.ID
    , sortDirectionAsc: boolean = true,
    filter: UsuarioFilter = {}
): Promise<UsuarioDTO[] | FetchAPIError> {
    // Parámetros de la URL de la petición a la API
    const queryParams: URLSearchParams = new URLSearchParams({
        size: size.toString(),
        page: page.toString(),
        fieldSort: fieldSort,
        sortDirectionAsc: sortDirectionAsc.toString(),
        // Parámetros de búsqueda adicionales de filtrado (si existen)
        ...(!!filter.id && {filter_id: filter.id.toString()}),
        ...(!!filter.cedula && {filter_cedula: filter.cedula.toString()}),
        ...(!!filter.primerNombre && {filter_primerNombre: filter.primerNombre}),
        ...(!!filter.segundoNombre && {filter_segundoNombre: filter.segundoNombre}),
        ...(!!filter.primerApellido && {filter_primerApellido: filter.primerApellido}),
        ...(!!filter.segundoApellido && {filter_segundoApellido: filter.segundoApellido}),
        ...(!!filter.fechaNacimientoDesde && {filter_fechaNacimientoDesde: filter.fechaNacimientoDesde.toISOString()}), // Ejemplo: 2021-12-31T23:59:59.999Z
        ...(!!filter.fechaNacimientoHasta && {filter_fechaNacimientoHasta: filter.fechaNacimientoHasta.toISOString()}), // Ejemplo: 2021-12-31T23:59:59.999Z
        ...(!!filter.nombreUsuario && {filter_nombreUsuario: filter.nombreUsuario}),
        ...(!!filter.email && {filter_email: filter.email}),
        ...(filter.activo != undefined && {filter_activo: filter.activo.toString()}),
        ...(!!filter.estado && {filter_estado: filter.estado}),
        ...(!!filter.perfil && {filter_perfil: filter.perfil})
    });

    console.log("TOKEN", token)

    // URL de la petición a la API
    const url: string = `${SERVICE_PATH}/listar?${queryParams}`; // queryParams =  ?size=10&page=1&fieldSort=id&sortDirectionAsc=true&filter_id=1&filter_nombre=nombre

    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Authorization header con token JWT
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<UsuarioDTO[]>(url, options);
}

export async function contarUsuariosPorInstitucion(token: string ,filter: UsuarioFilter = {}): Promise< number | FetchAPIError>{
    // Parámetros de la URL de la petición a la API
    const queryParams: URLSearchParams = new URLSearchParams({
        // Parámetros de búsqueda adicionales de filtrado (si existen)
        ...(!!filter.id && {filter_id: filter.id.toString()}),
        ...(!!filter.cedula && {filter_cedula: filter.cedula.toString()}),
        ...(!!filter.primerNombre && {filter_primerNombre: filter.primerNombre}),
        ...(!!filter.segundoNombre && {filter_segundoNombre: filter.segundoNombre}),
        ...(!!filter.primerApellido && {filter_primerApellido: filter.primerApellido}),
        ...(!!filter.segundoApellido && {filter_segundoApellido: filter.segundoApellido}),
        ...(!!filter.fechaNacimientoDesde && {filter_fechaNacimientoDesde: filter.fechaNacimientoDesde.toISOString()}), // Ejemplo: 2021-12-31T23:59:59.999Z
        ...(!!filter.fechaNacimientoHasta && {filter_fechaNacimientoHasta: filter.fechaNacimientoHasta.toISOString()}), // Ejemplo: 2021-12-31T23:59:59.999Z
        ...(!!filter.nombreUsuario && {filter_nombreUsuario: filter.nombreUsuario}),
        ...(!!filter.email && {filter_email: filter.email}),
        ...(filter.activo != undefined && {filter_activo: filter.activo.toString()}),
        ...(!!filter.estado && {filter_estado: filter.estado}),
        ...(!!filter.perfil && {filter_perfil: filter.perfil})
    });

    // URL de la petición a la API
    const url: string = `${SERVICE_PATH}/contar?${queryParams}`; // queryParams =  ?size=10&page=1&fieldSort=id&sortDirectionAsc=true&filter_id=1&filter_nombre=nombre

    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Authorization header con token JWT
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<number>(url, options);
}

/**
 * Función para registrar un nuevo usuario.
 * @param usuario - Datos del usuario a registrar
 * @param password - Contraseña del usuario
 * @param phone - Número de teléfono del usuario
 * @returns Promise<UsuarioDTO> - Usuario registrado
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function registrarUsuario(usuario: UsuarioDTO, password: string, phone: number): Promise<UsuarioDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/registrar?phone=${phone}`; // URL de la petición a la API

    const passwordEncoded: string = btoa(password); // Codifica la contraseña en base64

    // Opciones de la petición
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + passwordEncoded, // Cabecera custom 'Password'
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(usuario) // Cuerpo de la petición con los datos del usuario en formato JSON
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<UsuarioDTO>(url, options);
}

export async function registrarConAD(usuario: UsuarioDTO, phone: number): Promise<UsuarioDTO | FetchAPIError>{

    const url: string = `${SERVICE_PATH}/registrar-ad?phone=${phone}`; // URL de la petición a la API

    // Opciones de la petición
    const options: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(usuario) // Cuerpo de la petición con los datos del usuario en formato JSON
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<UsuarioDTO>(url, options);
}

export async function generarNombreUsuario(primerNombre: string, segundoNombre: string | undefined,  primerApellido: string, segundoApellido: string |undefined): Promise<string | FetchAPIError> {

    const queryParams: URLSearchParams = new URLSearchParams({
        ...(!!primerNombre && {primerNombre: primerNombre}),
        ...(!!segundoNombre && {segundoNombre: segundoNombre}),
        ...(!!primerApellido && {primerApellido: primerApellido}),
        ...(!!segundoApellido && {segundoApellido: segundoApellido})
    })

    const url: string = `${SERVICE_PATH}/generar-nombre-usuario?${queryParams}`; // URL de la petición a la API

    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<string>(url, options);

}

export async function verificarAD(nombreUsuario: string, password: string, dominio: string): Promise<boolean | FetchAPIError> {
    const queryParams: URLSearchParams = new URLSearchParams({
        ...(!!nombreUsuario && {nombreUsuario: nombreUsuario}),
        ...(!!password && {password: password}),
        ...(!!dominio && {dominio: dominio})
    })

    const url: string = `${SERVICE_PATH}/verificar-ad?${queryParams}`; // URL de la petición a la API

    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    return await fetchBodyWithErrorHandling<boolean>(url, options);

}

/**
 * Función para modificar un usuario existente.
 * @param usuario - Datos del usuario a modificar
 * @param token - Token de autenticación del usuario
 * @returns Promise<void> - Si la solicitud se realiza correctamente.
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function modificarUsuario(usuario: UsuarioDTO, token: string): Promise<void | FetchAPIError> {

    const url: string = `${SERVICE_PATH}/modificar`; // URL de la petición a la API

    // Opciones de la petición
    const options: RequestInit = {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token, // Authorization header con token JWT
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(usuario) // Cuerpo de la petición con los datos del usuario a modificar en formato JSON
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}

/**
 * Función para dar de baja un usuario.
 * @param id - ID del usuario a dar de baja
 * @param token - Token de autenticación del usuario
 * @returns Promise<void> - Si la solicitud se realiza correctamente.
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function darBajaUsuario(id: number, token: string): Promise<void | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/baja/${id}`; // URL de la petición a la API

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

/**
 * Función para reactivar un usuario dado de baja.
 * @param id - ID del usuario a reactivar
 * @param token - Token de autenticación del usuario
 * @returns Promise<void> - Si la solicitud se realiza correctamente.
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function reactivarUsuario(id: number, token: string): Promise<void | FetchAPIError> {
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

export async function existeCorreo(correo: string): Promise<boolean> {
    // URL del servicio
    const url: string = `${SERVICE_PATH}/existe-correo/${encodeURIComponent(correo)}`;

    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    return await fetchBodyWithErrorHandling<boolean>(url, options).then((response: boolean | FetchAPIError): boolean => {

        console.log("RESPONSE existe correo", response)
        if (isFetchAPIError(response)) {
            // Sí ocurre un error en la solicitud o en el procesamiento de la respuesta
            // imprime el error en la consola y retorna false indicando que no existe el correo
            console.error("ERROR - UsuarioService_existeCorreo: ", response);
            return false;
        }
        return response;
    });
}