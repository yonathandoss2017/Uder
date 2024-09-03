export default interface BajaEquipoDTO {
    id?: number;
    fecha?: Date;
    razon: string;
    comentarios: string;
    idUsuario?: number;
    idEquipo: number;
}