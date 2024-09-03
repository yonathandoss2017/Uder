// =============================================================================
// Esquema de validación para el estado de un usuario
// =============================================================================

import {z, ZodObject} from "zod"; // Importa zod para la validación de los datos

// Define el esquema de validación para el estado de un usuario
const SchemaUserEstado: ZodObject<any> = z.object({
    estado: z
        .string()
        .min(1, "Debe seleccionar un estado"),
});

// Exporta el esquema de validación
export default SchemaUserEstado;
