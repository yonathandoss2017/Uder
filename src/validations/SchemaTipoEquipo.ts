// =================================================================================================
// Esquema de validación para los datos de un tipo de equipo
// =================================================================================================

// Importa zod para la validación de los datos
import { z, ZodObject } from "zod";

// Define el esquema de validación con Zod
const SchemaTipoEquipo: ZodObject<any> = z.object({
    // Validación del nombre del tipo de equipo
    nombre: z.string()
        .min(1, "El nombre no puede estar vacío")
        .max(30, "El nombre no puede tener más de 30 caracteres")
        .refine((value: string) => value.trim().length > 0, {
            message: "El nombre no puede estar vacío",
        })
        .refine((value: string) => /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value), {
            message: "El nombre solo puede contener letras",
        })
});

export default SchemaTipoEquipo;
