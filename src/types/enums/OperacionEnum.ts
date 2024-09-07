/**
 * Enumeración para representar las operaciones con sus respectivos IDs.
 */
enum OperacionEnum {
    ALTA_EQUIPO = 1,
    BAJA_EQUIPO = 2,
    MODIFICACION_EQUIPO = 3,
    SUBIR_IMAGEN = 4,
    ELIMINAR_IMAGEN = 5,
    MODIFICAR_USUARIO = 6,
    BAJA_USUARIO = 7,
    REACTIVAR_USUARIO = 8,
    MODIFICAR_USUARIO_PROPIO = 9,
    ALTA_USUARIO =10,
    ALTA_TIPO_EQUIPO = 11,
    MODIFICAR_TIPO_EQUIPO =12,
    BAJA_TIPO_EQUIPO = 13

}

/**
 * Función para traducir los valores del enum `OperacionEnum` a cadenas legibles.
 * @param operacionEnum Valor del enum `OperacionEnum` o una cadena que representa la operación.
 * @returns Cadena legible que representa la operación, o "-" si no se encuentra la operación.
 */
export function translateOperacionEnum(operacionEnum: OperacionEnum | string): string {
    switch (operacionEnum) {
        case OperacionEnum.ALTA_EQUIPO:
            return "Alta de equipo";
        case OperacionEnum.BAJA_EQUIPO:
            return "Baja de equipo";
        case OperacionEnum.MODIFICACION_EQUIPO:
            return "Modificación de equipo";
        case OperacionEnum.SUBIR_IMAGEN:
            return "Subir imagen de equipo";
        case OperacionEnum.ELIMINAR_IMAGEN:
            return "Eliminar imagen de equipo";
        case OperacionEnum.MODIFICAR_USUARIO:
            return "Modificación de usuario";
        case OperacionEnum.BAJA_USUARIO:
            return "Baja de usuario";
        case OperacionEnum.REACTIVAR_USUARIO:
            return "Reactivación de usuario";
        case OperacionEnum.MODIFICAR_USUARIO_PROPIO:
            return "Modificación de usuario propio";
        case OperacionEnum.ALTA_USUARIO:
            return "Alta de usuario";
        case OperacionEnum.ALTA_TIPO_EQUIPO:
            return "Alta de tipo de equipo";
        case OperacionEnum.MODIFICAR_TIPO_EQUIPO:
            return "Modificación de tipo de equipo";
        case OperacionEnum.BAJA_TIPO_EQUIPO:
            return "Baja de tipo de equipo";
        default:
            return "-";
    }
}

export default OperacionEnum;
