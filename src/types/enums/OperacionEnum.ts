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
    BAJA_TIPO_EQUIPO = 13,
    ALTA_MARCA = 14,
    MODIFICAR_MARCA = 15,
    BAJA_MARCA = 16,
    ALTA_PROVEEDOR = 17,
    MODIFICAR_PROVEEDOR = 18,
    BAJA_PROVEEDOR = 19,
    ALTA_MODELO = 20,
    MODIFICAR_MODELO = 21,
    BAJA_MODELO = 22,
    ALTA_INTERVENCION = 23,
    TRABAJAR_INTERVENCION = 24

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
        case OperacionEnum.ALTA_MARCA:
            return "Alta de marca";
        case OperacionEnum.MODIFICAR_MARCA:
            return "Modificación de marca";
        case OperacionEnum.BAJA_MARCA:
            return "Baja de marca";
        case OperacionEnum.ALTA_PROVEEDOR:
            return "Alta de proveedor";
        case OperacionEnum.MODIFICAR_PROVEEDOR:
            return "Modificación de proveedor";
        case OperacionEnum.BAJA_PROVEEDOR:
            return "Baja de proveedor";
        case OperacionEnum.ALTA_MODELO:
            return "Alta de modelo";
        case OperacionEnum.MODIFICAR_MODELO:
            return "Modificación de modelo";
        case OperacionEnum.BAJA_MODELO:
            return "Baja de modelo";
        case OperacionEnum.ALTA_INTERVENCION:
            return "Alta de intervencion";
        case OperacionEnum.TRABAJAR_INTERVENCION:
            return "Modificación de intervencion";
        default:
            return "-";
    }
}

export default OperacionEnum;
