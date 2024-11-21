import {z, ZodObject} from "zod";

const SchemaIntervencion: ZodObject<any> = z.object({

    fechaHora: z
        .preprocess(((val): string => val ? String(val) : ''), // Convierte el valor a string
            z
                .string()
                .min(1, "La fecha es requerida")
                .refine(
                    (value: string):boolean => {
                        const fechaHora: Date = new Date(value);
                        const fechaActual: Date = new Date();
                        return fechaHora <= fechaActual;
                    },
                    {message: "La fecha debe ser anterior a la fecha actual"}
                )
        ),
    motivo:
        z.string()
            .min(1,"El motivo es requerido")
            .max(80, "El motivo no puede tener más de 80 caracteres")
    .refine((value: string) => value.replaceAll(" ", "").length != 0, {
        message: "El motivo no puede estar vacío",
    }),
    idTipoIntervencion:
        z.preprocess(((val): string => val ? String(val) : ''), // Convierte el valor a string
            z.string()
            .min(1, "Debe seleccionar un tipo de intervención"),
        ),
    comentarios: z
    .preprocess((val) => (val ? String(val) : ''), // Convierte el valor a string
        z.string()
            .max(80, "El comentario no puede tener más de 80 caracteres")
            .optional()
    ),
    numSerieEquipo: z
        .preprocess(((val): string => val ? String(val) : ''), // Convierte el valor a string
            z.string()
            .min(1, "El número de serie es requerido")
        ),
});

export default SchemaIntervencion;
