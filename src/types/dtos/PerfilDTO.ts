export default interface PerfilDTO {
    id?: number;
    nombre: string;
    activo: boolean;
    idFuncionalidades: number[];
    idInstitucion: number;
    nivel: number;
}