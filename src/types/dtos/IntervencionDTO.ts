import EquipoDTO from "@/types/dtos/EquipoDTO";

export default interface IntervencionDTO {
    id?: number; // Este campo es opcional
    fechaHora: string; // Asume formato ISO-8601, que corresponde a 'LocalDateTime' en el backend
    motivo: string; // Campo que corresponde al motivo de la intervención
    comentarios?: string; // Campo opcional que corresponde a los comentarios
    idUsuario?: number; // ID del usuario, opcional
    idTipoIntervencion: number; // ID del tipo de intervención
    equipoDTO: EquipoDTO;
}
