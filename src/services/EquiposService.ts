"use server"; // Indica que el código se ejecutará en el servidor de NextJS (backend)

// Importa las funciones y tipos necesarios para el servicio de equipos
import {fetchBodyWithErrorHandling, fetchVoidWithErrorHandling} from "@/utils/ServiceMethods";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import EquipoDTO from "@/types/dtos/EquipoDTO";
import BajaEquipoDTO from "@/types/dtos/BajaEquipoDTO";
import EquipoFilter from "@/types/filters/EquipoFilter";
import EquipoFieldSortEnum from "@/types/enums/EquipoFieldSortEnum";

// URL base de la API REST de la API para los equipos
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/equipos";

/**
 * Función para listar todos los equipos disponibles.
 * @param token - Token de autenticación del usuario
 * @param size - Cantidad de registros a recuperar por página (0 para todos)
 * @param page - Número de página a recuperar (1 para la primera)
 * @param fieldSort - Campo por el cual se ordenarán los registros
 * @param sortDirectionAsc - Dirección de la ordenación (true para ascendente, false para descendente)
 * @param filter - Filtros de búsqueda de equipos (opcional)
 * @returns Promise<EquipoDTO[]> - Lista de equipos recuperados de la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function listarEquipos(
    token: string,
    size: number = 0, page: number = 1, fieldSort: EquipoFieldSortEnum = EquipoFieldSortEnum.NUM_SERIE, sortDirectionAsc: boolean = true,
    filter: EquipoFilter = {}
): Promise<EquipoDTO[] | FetchAPIError> {

    // Parámetros de la URL de la petición a la API
    const queryParams: URLSearchParams = new URLSearchParams({
        // Parámetros de paginación y ordenación
        size: size.toString(),
        page: page.toString(),
        fieldSort: fieldSort,
        sortDirectionAsc: sortDirectionAsc.toString(),

        // Parámetros de búsqueda adicionales de filtrado (si existen)
        ...(!!filter.id && {filter_id: filter.id.toString()}),
        ...(!!filter.nombre && {filter_nombre: filter.nombre}),
        ...(!!filter.tipoEquipo && {filter_tipoEquipo: filter.tipoEquipo}),
        ...(!!filter.marca && {filter_marca: filter.marca}),
        ...(!!filter.modelo && {filter_modelo: filter.modelo}),
        ...(!!filter.numSerie && {filter_numSerie: filter.numSerie}),
        ...(!!filter.paisOrigen && {filter_paisOrigen: filter.paisOrigen}),
        ...(!!filter.proveedor && {filter_proveedor: filter.proveedor}),
        // Para fechas, se convierten a cadenas compatbiles con LocalDate en Java
        // Se convierte a cadena ISO (2024-08-10T00:00:00.000Z) y se quita la parte de la hora (2024-08-10)
        ...(!!filter.fechaAdquisicionDesde && {filter_fechaAdquisicionDesde: filter.fechaAdquisicionDesde.toISOString().split('T')[0]}),
        ...(!!filter.fechaAdquisicionHasta && {filter_fechaAdquisicionHasta: filter.fechaAdquisicionHasta.toISOString().split('T')[0]}),
        ...(!!filter.garantiaEnFecha && {filter_garantiaEnFecha: filter.garantiaEnFecha.toISOString().split('T')[0]}),
        ...(!!filter.ubicacionActual && {filter_ubicacionActual: filter.ubicacionActual}),
        ...(filter.activo != undefined && {filter_activo: filter.activo.toString()}),
        ...(filter.enIntervencion != undefined && {filter_enIntervencion: filter.enIntervencion.toString()})
    });

    // URL de la petición a la API
    const url: string = `${SERVICE_PATH}/listar?${queryParams}`;

    const options: RequestInit = { // Opciones de la petición
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<EquipoDTO[]>(url, options);
}

/**
 * Función para agregar un nuevo equipo.
 * @param equipo - Datos del equipo a agregar
 * @param token - Token de autenticación del usuario
 * @returns Promise<EquipoDTO> - Equipo agregado correctamente en la API
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function agregarEquipo(equipo: EquipoDTO, token: string): Promise<EquipoDTO | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/agregar`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(equipo) // Cuerpo de la petición con los datos del equipo
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<EquipoDTO>(url, options);
}

/**
 * Función para modificar los datos de un equipo existente.
 * @param equipo - Datos del equipo a modificar
 * @param token - Token de autenticación del usuario
 * @returns Promise<void> - Si la solicitud se realiza correctamente.
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function modificarEquipo(equipo: EquipoDTO, token: string): Promise<void | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/modificar`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(equipo)
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}

/**
 * Función para dar de baja un equipo.
 * @param bajaEquipo - Datos de baja del equipo
 * @param token - Token de autenticación del usuario
 * @returns Promise<void> - Si la solicitud se realiza correctamente.
 * @returns Promise<FetchAPIError> - Si ocurre un error en la solicitud o en el procesamiento de la respuesta.
 */
export async function darBajaEquipo(bajaEquipo: BajaEquipoDTO, token: string): Promise<void | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/baja`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(bajaEquipo) // Cuerpo de la petición con los datos de baja del equipo
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchVoidWithErrorHandling(url, options);
}

/**
 * Función para contar la cantidad total de equipos.
 * @returns Promise<number> - Cantidad total de equipos registrados en la API
 */
export async function contarEquipos(token: string, filter: EquipoFilter = {}): Promise<number> {

    // Parámetros de la URL de la petición a la API
    const queryParams: URLSearchParams = new URLSearchParams({
        // Parámetros de búsqueda de filtrado (si existen)
        ...(!!filter.id && {filter_id: filter.id.toString()}),
        ...(!!filter.nombre && {filter_nombre: filter.nombre}),
        ...(!!filter.tipoEquipo && {filter_tipoEquipo: filter.tipoEquipo}),
        ...(!!filter.marca && {filter_marca: filter.marca}),
        ...(!!filter.numSerie && {filter_numSerie: filter.numSerie}),
        ...(!!filter.paisOrigen && {filter_paisOrigen: filter.paisOrigen}),
        ...(!!filter.proveedor && {filter_proveedor: filter.proveedor}),
        // Para fechas, se convierten a cadenas compatbiles con LocalDate en Java
        // Se convierte a cadena ISO (2024-08-10T00:00:00.000Z) y se quita la parte de la hora (2024-08-10)
        ...(!!filter.fechaAdquisicionDesde && {filter_fechaAdquisicionDesde: filter.fechaAdquisicionDesde.toISOString().split('T')[0]}),
        ...(!!filter.fechaAdquisicionHasta && {filter_fechaAdquisicionHasta: filter.fechaAdquisicionHasta.toISOString().split('T')[0]}),
        ...(!!filter.garantiaEnFecha && {filter_garantiaEnFecha: filter.garantiaEnFecha.toISOString().split('T')[0]}),
        ...(!!filter.ubicacionActual && {filter_ubicacionActual: filter.ubicacionActual}),
        ...(filter.activo != undefined && {filter_activo: filter.activo.toString()}),
        ...(filter.enIntervencion != undefined && {filter_enIntervencion: filter.enIntervencion.toString()})
    });
    const url: string = `${SERVICE_PATH}/contar?${queryParams}`; // URL de la petición a la API
    const options: RequestInit = { // Opciones de la petición
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<number>(url, options).then((response: number | FetchAPIError): number => {
        if (isFetchAPIError(response)) {
            console.error('ERROR - EquiposService.contarEquipos:', response); // Imprime el error en consola
            return 0; // Retorna 0 en caso de error
        }
        return response; // Retorna la cantidad de equipos registrados
    });
}

    export async function buscarPorNumSerie(numSerie: string, token: string): Promise<EquipoDTO | FetchAPIError> {

        const url: string = `${SERVICE_PATH}/buscarPorNumSerie/${numSerie}`;
        const options: RequestInit = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        };

        return await fetchBodyWithErrorHandling<EquipoDTO>(url, options);

    }
