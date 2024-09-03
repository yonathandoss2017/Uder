import GarantiaDTO from "@/types/dtos/GarantiaDTO";

export default interface EquipoDTO {
    id?: number;
    nombre: string;
    idTipoEquipo: number;
    idModelo: number;
    numSerie: string;
    idPaisOrigen: number;
    idProveedor: number;
    fechaAdquisicion: string;
    garantia: GarantiaDTO;
    idUbicacionActual: number;
    idBajaEquipo?: number;
    fechaExpiracionGarantia: string;
}