// =============================================================================
// Esquema de validación para la contraseña de un usuario
// =============================================================================

import {z, ZodObject} from "zod";

// Define el esquema de validación para la contraseña de un usuario
const SchemaUserPassword: ZodObject<any> = z.object({
    contrasenia: z
        .string({
            required_error: "La contraseña no puede estar vacía"
        })
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(30, "La contraseña no debe tener más de 30 caracteres")
        .regex(/[a-zA-Z]/, "La contraseña debe contener al menos una letra")
        .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
});

// Exporta el esquema de validación
export default SchemaUserPassword;
