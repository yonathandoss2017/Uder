// =============================================================================
// Esquema de validación para el teléfono de un usuario
// =============================================================================

import {z, ZodObject} from "zod";

// Define el esquema de validación para el teléfono de un usuario
const SchemaUserPhone: ZodObject<any> = z.object({
    telefono: z.preprocess(((val): string => val ? String(val).replace(/^0/, '') : ''), // Quita el primer 0 si lo tiene
        z.string()
            .min(1, 'El teléfono no puede estar vacío')
            .min(8, "El teléfono debe tener entre 8 caracteres sin contar el 0 inicial")
            .max(8, "El teléfono debe tener entre 8 caracteres sin contar el 0 inicial")
            .regex(/^\d+$/, 'El teléfono debe contener solo números')),
});

// Exporta el esquema de validación
export default SchemaUserPhone;
