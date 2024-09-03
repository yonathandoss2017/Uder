import OperacionEnum from "@/types/enums/OperacionEnum";

export default interface AuditoriaDTO {
    id?: number;
    idUsuario: number;
    operacion: OperacionEnum;
    fechaHora: Date;
    idObjetivo: number;
    mensaje: string;
}