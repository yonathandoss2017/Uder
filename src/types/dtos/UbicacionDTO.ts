export default interface UbicacionDTO {
    id?: number;
    nombre: string;
    numero: number;
    cama?: string;
    piso: string;
    sector: string;
    idInstitucion: number;
    idBajaUbicacion?: number;
}