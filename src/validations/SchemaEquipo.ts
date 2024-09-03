// =================================================================================================
// Esquema de validación para los datos de un equipo
// =================================================================================================

// Importa zod para la validación de los datos
import {z, ZodObject} from "zod";

// Define el esquema de validación con Zod
const SchemaEquipo: ZodObject<any> = z.object({
    // Validación del nombre del equipo
    nombre: z.string()
        .min(1, "El nombre no puede estar vacío")
        .max(30, "El nombre no puede tener más de 30 caracteres")
        .refine((value: string) => value.replaceAll(" ", "").length != 0, {
            message: "El nombre no puede estar vacío",
        }),

    // Validación del tipo de equipo
    idTipoEquipo: z.preprocess(((val): string => val ? String(val) : ''), // Convierte el valor a String
        z.string()
            .min(1, "Debe seleccionar un tipo de equipo")),

    // Validación del modelo de equipo
    idModelo: z.preprocess(((val): string => val ? String(val) : ''), // Convierte el valor a String
        z.string()
            .min(1, "Debe seleccionar un modelo")),

    // Validación del número de serie
    numSerie: z.string()
        .min(1, "El número de serie no puede estar vacío")
        .max(30, "El número de serie no puede tener más de 30 caracteres")
        .refine((value: string) => !value.includes(" "), {
            message: "No debe contener espacios en blanco",
        }),

    // Validación del país de origen
    idPaisOrigen: z.preprocess(((val): string => val ? String(val) : ''), // Convierte el valor a String
        z.string()
            .min(1, "Debe seleccionar un país")),

    // Validación del proveedor
    idProveedor: z.preprocess(((val): string => val ? String(val) : ''), // Convierte el valor a String
        z.string()
            .min(1, "Debe seleccionar un proveedor")),

    // Validación de la ubicación actual
    idUbicacionActual: z.preprocess(((val): string => val ? String(val) : ''), // Convierte el valor a String
        z.string()
            .min(1, "Debe seleccionar una ubicación")),

    // Validación de la fecha de adquisición
    fechaAdquisicion: z.string()
        .min(1, "La fecha de adquisición es requerida")
        .refine((value: string): boolean => {
            const fechaAdquisicion: Date = new Date(value);
            const fechaActual: Date = new Date();
            return fechaAdquisicion < fechaActual;
        }, {message: "La fecha de adquisición no puede ser futura"}),

    // Validación de la garantía en años, meses, días o de por vida
    garantiaAnios: z.preprocess(((val): number => val ? Number(val) : 0), // Convierte el valor a number
        z.number()
            .min(0, "El campo años no puede ser menor que cero")
            .max(20, "El campo años no puede ser mayor a 20"))
        .optional(),

    garantiaMeses: z.preprocess(((val): number => val ? Number(val) : 0), // Convierte el valor a number
        z.number()
            .min(0, "El campo meses no puede ser menor que cero")
            .max(12, "El campo meses no puede ser mayor a 12"))
        .optional(),

    garantiaDias: z.preprocess(((val): number => val ? Number(val) : 0), // Convierte el valor a number
        z.number()
            .min(0, "El campo días no puede ser menor que cero")
            .max(31, "El campo días no puede ser mayor a 31"))
        .optional(),

    garantiaDePorVida: z.boolean().optional(), // Garantía de por vida opcional
});

export default SchemaEquipo;
