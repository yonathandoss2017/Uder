import PermisoEnum from "@/types/enums/PermisoEnum";

export default interface FuncionalidadDTO{
    id?:number;
    nombre: string;
    idInstitucion: number;
    permisos?: Set<String>;
}