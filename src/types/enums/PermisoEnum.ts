/**
 * Enumeración para representar los permisos con sus respectivos ID.
 */
enum PermisoEnum {
    ALTA_EQUIPO = 1,
    BAJA_EQUIPO = 2,
    MODIFICACION_EQUIPO = 3,
    OBTENER_EQUIPOS = 4,
    SUBIR_IMAGEN = 5,
    ELIMINAR_IMAGEN = 6,
    MODIFICAR_USUARIO = 7,
    BAJA_USUARIO = 8,
    REACTIVAR_USUARIO = 9,
    MODIFICAR_USUARIO_PROPIO = 10,
    CAMBIAR_ESTADO_USUARIO = 11,
    OBTENER_USUARIOS = 12,
    ALTA_INTERVENCION = 13,
    TRABAJAR_INTERVENCION = 14,
    OBTENER_INTERVENCIONES = 16,
    ALTA_TIPO_INTERVENCION = 17,
    MODIFICAR_TIPO_INTERVENCION = 18,
    BAJA_TIPO_INTERVENCION = 19,
    REACTIVAR_TIPO_INTERVENCION = 20,
    OBTENER_TIPO_INTERVENCIONES = 21,
    REGISTRAR_MOVIMIENTO = 22,
    OBTENER_MOVIMIENTOS = 23,
    ALTA_PERFIL = 24,
    MODIFICAR_PERFIL = 25,
    BAJA_PERFIL = 26,
    REACTIVAR_PERFIL = 27,
    ALTA_UBICACION = 28,
    BAJA_UBICACION = 29,
    OBTENER_UBICACIONES = 30,
    MODIFICAR_UBICACIONES = 31,
    ALTA_TIPO_EQUIPO = 32,
    OBTENER_TIPO_EQUIPOS = 33,
    MODIFICAR_TIPO_EQUIPO = 34,
    BAJA_TIPO_EQUIPO = 35,
    ALTA_MARCA = 36,
    OBTENER_MARCAS = 37,
    MODIFICAR_MARCA = 38,
    BAJA_MARCA = 39,
    ALTA_PROVEEDOR = 40,
    OBTENER_PROVEEDORES = 41,
    MODIFICAR_PROVEEDOR = 42,
    BAJA_PROVEEDOR = 43,
    ALTA_MODELO = 44,
    OBTENER_MODELOS = 45,
    MODIFICAR_MODELO = 46,
    BAJA_MODELO = 47,
    ALTA_FUNCIONALIDAD=48,
    OBTENER_FUNCIONALIDADES=49,
    MODIFICAR_FUNCIONALIDAD=50,
    BAJA_FUNCIONALIDAD=51,
    ASIGNAR_FUNCIONALIDAD=52,
    REVOCAR_FUNCIONALIDAD=53,
    AGREGAR_PERMISO_FUNCIONALIDAD=54,
    REVOCAR_PERMISO_FUNCIONALIDAD=55

}

/*
export function obtenerEnum(nombre: string | null): PermisoEnum {
    // Si el nombre buscado es nulo, lanza un error.
    if (nombre === null) {
        throw new Error("Nombre de permiso no especificado");
    }

    // Recorre todos los valores de la enumeración, buscando el nombre del permiso.
    for (const oe of Object.keys(PermisoEnum)) {
        // Verifica si el valor actual coincide con el nombre buscado (ignorando mayúsculas/minúsculas).
        if (oe.toLowerCase() === nombre.toLowerCase()) {
            // Retorna el valor numérico correspondiente al nombre del permiso.
            return PermisoEnum[oe as keyof typeof PermisoEnum];
        }
    }

    // Si no se encontró el valor buscado, lanza un error.
    throw new Error("No se encontró el permiso buscado");
}*/



export default PermisoEnum;
