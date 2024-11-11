// =================================================================================================
// Esquema de validación para los datos de un usuario (Validaciones generales)
// =================================================================================================

// Importa zod para la validación de los datos
import {z, ZodObject} from "zod";

// Define el esquema de validación con Zod
const SchemaUser: ZodObject<any> = z.object({
    // Validación del campo de cédula
    cedula: z
        .preprocess((val) => val ? String(val) : '', // Convierte el valor a string
            z.string()
                .regex(/^\d+$/, 'La CI debe contener solo números')
                .refine((value: string) => !value.includes(" "), {
                    message: "No debe contener espacios en blanco",
                })
                .refine((cedula: string) => {
                    const length = cedula.length;
                    return length === 7 || length === 8;
                }, {
                    message: "La CI debe tener 7 o 8 caracteres",
                })
                .refine((cedula: string) => validarCedula(cedula), {
                    message: "El dígito verificador de la cédula es incorrecto",
                })
        ),

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
        message: "El primer apellido no debe contener números ni caracteres especiales",
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
                    message: "El primer apellido no debe contener números ni caracteres especiales",
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
                )
    ),

    // Validación del campo de email
    email: z
        .string()
        .email("Ingrese un email válido")
        .max(60, "El tamaño del email no es válido"),

    //Validación del campo perfil
    idPerfil: z.preprocess(((val): string => val ? String(val) : ''),
        z.string().optional()),

});

function validarCedula(cedula: string): boolean {
    if (cedula.length === 8) {
        const multiplicadores = [2, 9, 8, 7, 6, 3, 4]; // Para cédulas de 8 dígitos
        const cuerpo = cedula.substring(0, 7);
        const digitoVerificador = parseInt(cedula.substring(7), 10);
        let suma = 0;
        for (let i = 0; i < cuerpo.length; i++) {
            suma += parseInt(cuerpo[i], 10) * multiplicadores[i];
        }
        const resto = suma % 10;
        const verificadorCalculado = (10 - resto) % 10;
        return verificadorCalculado === digitoVerificador;
    } else if (cedula.length === 7) {
        const multiplicadores = [1, 2, 3, 4, 7, 6]; // Para cédulas de 7 dígitos
        const cuerpo = cedula.substring(0, 6);
        const digitoVerificador = parseInt(cedula.substring(6), 10);
        let suma = 0;
        for (let i = 0; i < cuerpo.length; i++) {
            suma += parseInt(cuerpo[i], 10) * multiplicadores[i];
        }
        const verificadorCalculado = suma % 10;
        return verificadorCalculado === digitoVerificador;
    }
    return false; // Longitud inválida
}


// Exporta el esquema de validación
export default SchemaUser;
