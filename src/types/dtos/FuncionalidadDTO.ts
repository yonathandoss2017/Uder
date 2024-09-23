export default interface FuncionalidadDTO{
    id?:number;
    nombre: string;
    idInstitucion: number;
    permisos?: Set<number>;
}