import { z, ZodObject } from "zod";

const SchemaPerfil: ZodObject<any> = z.object({
    nombre: z.string()
        .min(1, "El nombre no puede estar vacío")
        .max(50, "El nombre no puede tener más de 50 caracteres")
        // Permite letras, letras acentuadas y espacios en cualquier posición
        .refine((value: string) => /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value), {
            message: "El nombre solo debe contener letras y espacios, sin números ni caracteres especiales",
        }),

    nivel: z
        .preprocess((val) => (val ? String(val) : ''), // Convierte el valor a string
            z.string()
                .min(1, "El nivel no puede estar vacío")
                .regex(/^\d+\s*$/, 'El nivel debe contener solo números enteros')
                .refine((value: string) => !value.includes("  "), {
                    message: "No debe contener más de un espacio consecutivo",
                })
                .refine((value: string) => Number(value.trim()) >= 1, {
                    message: "El nivel debe ser mayor o igual a 1",
                })
        ),
});

export default SchemaPerfil;
