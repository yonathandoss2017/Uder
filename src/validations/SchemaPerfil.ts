// =================================================================================================
// Esquema de validación para los datos de un perfil
// =================================================================================================

// Importa zod para la validación de los datos
import { z, ZodObject } from "zod";

// Define el esquema de validación con Zod
const SchemaPerfil: ZodObject<any> = z.object({
    // Validación del nombre del perfil
    nombre: z.string()
        .min(1, "El nombre no puede estar vacío")
        .max(50, "El nombre no puede tener más de 50 caracteres")
        .refine((value: string) => value.replaceAll(" ", "").length != 0, {
            message: "El nombre no puede estar vacío",
        }),

    nivel: z
        .preprocess(((val): string => val ? String(val) : ''), // Convierte el valor a string
            z.string()
                .regex(/^\d+$/, 'El nivel debe contener solo números')
                .refine((value: string) => !value.includes(" "), {
                    message: "No debe contener espacios en blanco",
                })),

});

export default SchemaPerfil;
