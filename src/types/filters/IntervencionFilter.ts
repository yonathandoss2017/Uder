export default interface IntervencionFilter {
    fechaDesde?: Date; // Fecha desde
    fechaHasta?: Date; // Fecha hasta
    equipo?: string;   // Identificación del equipo
    tipoIntervencion?: string; // Tipo de intervención
}
