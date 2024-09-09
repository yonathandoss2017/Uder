import OperacionEnum from "@/types/enums/OperacionEnum";

export default interface AuditoriaDTO {
    id?: number;
    idUsuario: number;
    operacion: OperacionEnum;
    fechaHora: number[];
    idObjetivo: number;
    mensaje: string;
}

export function translateNumberArrayToDate(fechaHora: number[]): Date {
    let date: Date = new Date();
    date.setFullYear(fechaHora[0]);
    date.setMonth(fechaHora[1]);
    date.setDate(fechaHora[2]);
    date.setHours(fechaHora[3]);
    date.setMinutes(fechaHora[4]);
    return date;
}