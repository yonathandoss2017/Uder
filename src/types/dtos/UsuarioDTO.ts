import UsuarioEstadoEnum from "@/types/enums/UsuarioEstadoEnum";

export default interface UsuarioDTO {
    id?: number;
    cedula: number;
    primerNombre: string;
    segundoNombre?: string;
    primerApellido: string;
    segundoApellido?: string;
    fechaNacimiento: string;
    nombreUsuario?: string;
    email: string;
    idPerfil?: number;
    idInstitucion: number;
    activo: boolean;
    estado: UsuarioEstadoEnum;
}