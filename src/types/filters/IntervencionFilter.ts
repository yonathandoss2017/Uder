export default interface IntervencionFilter {
    id?: number;
    fechaDesde?: string; // Asume formato ISO-8601
    fechaHasta?: string; // Asume formato ISO-8601
    nombreUsuario?: string;
    tipoIntervencion?: string;
    idEquipo?: number;
    trabajable?: boolean;
}
