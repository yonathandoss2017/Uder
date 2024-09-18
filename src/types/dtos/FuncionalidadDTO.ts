export default interface FuncionalidadDTO{
    id?:number;
    nombre: string;
    permisos?: Set<number>;
}