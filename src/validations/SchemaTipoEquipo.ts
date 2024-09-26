// =================================================================================================
// Esquema de validación para los datos de un tipo de equipo
// =================================================================================================

// Importa zod para la validación de los datos
import {z, ZodObject} from "zod";

// Define el esquema de validación con Zod
const SchemaTipoEquipo: ZodObject<any> = z.object({
    // Validación del nombre del tipo de equipo
    nombre: z.string()
        .min(1, "El nombre no puede estar vacío")
        .max(30, "El nombre no puede tener más de 30 caracteres")
        .refine((value: string) => value.replaceAll(" ", "").length != 0, {
            message: "El nombre no puede estar vacío",
        }).refine((value: string) => /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/.test(value), {
            message: "El primer nombre no debe contener números ni caracteres especiales",
        })
});

export default SchemaTipoEquipo;