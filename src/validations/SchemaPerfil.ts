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

    // Validación del nivel (debe ser un número mayor o igual a 1)
    nivel: z.number()
        .min(1, "El nivel debe ser mayor o igual a 1"),

    // Validación del idInstitucion (debe ser un número entero positivo)
    idInstitucion: z.number()
        .positive("El id de la institución debe ser un número positivo"),

    // Validación de idFuncionalidades (array de números)
    idFuncionalidades: z.array(z.number().positive("El id de la funcionalidad debe ser un número positivo"))
        .min(1, "Debe seleccionar al menos una funcionalidad")
});

export default SchemaPerfil;
