/**
 * Enumeración para representar el estado de verificación de un usuario.
 */
enum UsuarioEstadoEnum {
    NO_VERIFICADO = "NO_VERIFICADO",
    VERIFICADO = "VERIFICADO",
}

/**
 * Función para traducir los valores del enum `UsuarioEstadoEnum` a cadenas legibles.
 * @param usuarioEstadoEnum Valor del enum a traducir
 * @returns Cadena legible correspondiente al valor del enum
 */
export function translateUsuarioEstadoEnum(usuarioEstadoEnum: UsuarioEstadoEnum): string {
    switch (usuarioEstadoEnum) {
        case UsuarioEstadoEnum.NO_VERIFICADO:
            return "No verificado";
        case UsuarioEstadoEnum.VERIFICADO:
            return "Verificado";
        default:
            return "-";
    }
}

export default UsuarioEstadoEnum;
