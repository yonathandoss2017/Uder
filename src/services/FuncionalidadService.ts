import EquipoFilter from "@/types/filters/EquipoFilter";
import TipoEquipoDTO from "@/types/dtos/TipoEquipoDTO";
import FetchAPIError from "@/types/errors/FetchAPIError";
import {fetchBodyWithErrorHandling} from "@/utils/ServiceMethods";
import FuncionalidadDTO from "@/types/dtos/FuncionalidadDTO";

// URL base de la API REST de la API para las funcionalidades
const SERVICE_PATH: string = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/funcionalidades";

export async function listarFuncionalidades(token: string): Promise<FuncionalidadDTO[] | FetchAPIError> {
    const url: string = `${SERVICE_PATH}/listar`; // URL de la petición a la API
    // Opciones de la petición
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Cabecera de autorización con el token de sesión
            'Content-Type': 'application/json' // Tipo de contenido JSON
        }
    };

    // Realiza la petición a la API y retorna el resultado
    return await fetchBodyWithErrorHandling<FuncionalidadDTO[]>(url, options);
}