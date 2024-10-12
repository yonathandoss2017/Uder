// =================================================================================================
// Esquema de validación para los datos de un usuario (Validaciones generales)
// =================================================================================================

// Importa zod para la validación de los datos
import {z, ZodObject} from "zod";

// Define el esquema de validación con Zod
const SchemaUser: ZodObject<any> = z.object({
    // Validación del campo de cédula
    cedula: z
        .preprocess(((val): string => val ? String(val) : ''), // Convierte el valor a string
            z.string()
                .length(8, "CI debe ser de 8 caracteres")
                .regex(/^\d+$/, 'La CI debe contener solo números')
                .refine((value: string) => !value.includes(" "), {
                    message: "No debe contener espacios en blanco",
                })),

    // Validación del campo de primer nombre
    primerNombre: z
        .string()
        .min(1, "El primer nombre no puede estar vacío")
        .max(30, "El primer nombre no puede tener más de 30 caracteres")
        .refine((value: string) => !value.includes(" "), {
            message: "No debe contener espacios en blanco",
        })
        .refine((value: string) => value.replaceAll(" ", "").length != 0, {
            message: "El primer nombre no puede estar vacío",
        })
        // Validación para que no contenga caracteres especiales ni números (solo letras y letras acentuadas)
        .refine((value: string) => /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/.test(value), {
            message: "El primer nombre no debe contener números ni caracteres especiales",
        }),

    // Validación del campo de segundo nombre (opcional)
    segundoNombre: z
        .preprocess((val) => (val ? String(val) : ''), // Convierte el valor a string
            z
                .string()
                .max(30, "El segundo nombre no puede tener más de 30 caracteres")
                .refine((value: string) => value === '' || !value.includes(' '), {
                    message: "No debe contener espacios en blanco",
                })
                .refine((value: string) => value === '' || /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/.test(value), {
                    message: "El segundo nombre no debe contener números ni caracteres especiales",
                })
                .optional()
        ),


    // Validación del campo de primer apellido
    primerApellido: z
        .string()
        .min(1, "El primer apellido no puede estar vacío")
        .max(30, "El primer apellido no puede tener más de 30 caracteres")
        .refine((value: string) => !value.includes(" "), {
            message: "No debe contener espacios en blanco",
        })
    // Validación para que no contenga caracteres especiales ni números (solo letras y letras acentuadas)
    .refine((value: string) => /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/.test(value), {
        message: "El primer nombre no debe contener números ni caracteres especiales",
    }),

    // Validación del campo de segundo apellido (opcional)
    segundoApellido: z
        .preprocess((val) => (val ? String(val) : ''), // Convierte el valor a string
            z
                .string()
                .max(30, "El segundo apellido no puede tener más de 30 caracteres")
                .refine((value: string) => value === '' || !value.includes(' '), {
                    message: "No debe contener espacios en blanco",
                })
                .refine((value: string) => value === '' || /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/.test(value), {
                    message: "El primer nombre no debe contener números ni caracteres especiales",
                })
                .optional()
        ),

    // Validación del campo de fecha de nacimiento
    fechaNacimiento: z
        .preprocess(((val): string => val ? String(val) : ''), // Convierte el valor a string
            z
                .string()
                .min(1, "La fecha de nacimiento es requerida")
                .refine(
                    (value: string):boolean => {
                        const fechaNacimiento: Date = new Date(value);
                        const fechaActual: Date = new Date();
                        return fechaNacimiento < fechaActual;
                    },
                    {message: "La fecha de nacimiento debe ser anterior a la fecha actual"}
                )
                .refine(
                    (value: string): boolean => {
                        const fechaNacimiento: Date = new Date(value);
                        const fecha18anios: Date = new Date();
                        fecha18anios.setFullYear(fecha18anios.getFullYear() - 18);
                        return fechaNacimiento <= fecha18anios;
                    },
                    {message: "Debes tener al menos 18 años"}
                )),

    // Validación del campo de email
    email: z
        .string()
        .email("Ingrese un email válido")
        .max(60, "El tamaño del email no es válido"),

    //Validación del campo perfil
    idPerfil: z.preprocess(((val): string => val ? String(val) : ''),
        z.string().optional()),

});

// Exporta el esquema de validación
export default SchemaUser;
