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
        })
        // Validación para que no contenga caracteres especiales ni números (solo letras y letras acentuadas)
        .refine((value: string) => /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/.test(value), {
            message: "El primer nombre no debe contener números ni caracteres especiales",
        }),

    nivel: z
        .preprocess(((val): string => val ? String(val) : ''), // Convierte el valor a string
            z.string()
                .min(1, "El nivel no puede estar vacío")
                .regex(/^\d+$/, 'El nivel debe contener solo números enteros')
                .refine((value: string) => !value.includes(" "), {
                    message: "No debe contener espacios en blanco",
                })
                .refine((value: string) => value.replaceAll(" ", "").length != 0, {
                    message: "El nivel no puede estar vacío",
                })
                .refine((value: string) => Number(value) >= 1, {
                    message: "El nivel debe ser mayor o igual a 1",
                })
        ),



});

export default SchemaPerfil;
