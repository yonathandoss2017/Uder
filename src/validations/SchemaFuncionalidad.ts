// =================================================================================================
// Esquema de validación para los datos de una funcionalidad
// =================================================================================================

// Define el esquema de validación con Zod
import {z, ZodObject} from "zod";

const SchemaFuncionalidad: ZodObject<any> = z.object({
    // Validación del nombre de la funcionalidad
    nombre: z.string()
        .min(1, "El nombre no puede estar vacío")
        .max(60, "El nombre no puede tener más de 60 caracteres")
        .refine((value: string) => value.replaceAll(" ", "").length != 0, {
            message: "El nombre no puede estar vacío",
        })
});

export default SchemaFuncionalidad;