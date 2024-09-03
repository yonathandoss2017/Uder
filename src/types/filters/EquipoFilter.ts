export default interface EquipoFilter {
    id?: number;
    nombre?: string;
    tipoEquipo?: string;
    marca?: string;
    numSerie?: string;
    paisOrigen?: string;
    proveedor?: string;
    fechaAdquisicionDesde?: Date;
    fechaAdquisicionHasta?: Date;
    garantiaEnFecha?: Date;
    ubicacionActual?: string;
    activo?: boolean;
    enIntervencion?: boolean;
}