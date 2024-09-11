import OperacionEnum from "@/types/enums/OperacionEnum";

export default interface AuditoriaDTO {
    id?: number;
    idUsuario: number;
    operacion: OperacionEnum;
    fechaHora: string;
    idObjetivo: number;
    mensaje: string;
}