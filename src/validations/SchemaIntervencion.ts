import { z } from "zod";

const SchemaIntervencion = z.object({
    fechaHora: z.string().nonempty("La fecha y hora son requeridas"),
    motivo: z.string().nonempty("El motivo es requerido"),
    idTipoIntervencion: z.number().min(1, "El ID del tipo de intervención es requerido"),
    idEquipo: z.number().min(1, "El ID del equipo es requerido"),
    comentarios: z.string().optional(),
});

export default SchemaIntervencion;
