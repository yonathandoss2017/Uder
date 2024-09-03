export default interface UsuarioFilter {
    id?: number;
    cedula?: number;
    primerNombre?: string;
    segundoNombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    fechaNacimientoDesde?: Date;
    fechaNacimientoHasta?: Date;
    nombreUsuario?: string;
    email?: string;
    activo?: boolean;
    estado?: string;
    perfil?: string;
}