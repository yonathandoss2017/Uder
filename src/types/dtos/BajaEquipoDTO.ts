export default interface BajaEquipoDTO {
    id?: number;
    fecha?: string;
    razon: string;
    comentarios: string;
    idUsuario?: number;
    idEquipo: number;
}