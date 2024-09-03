// =============================================================================
// Esquema de validación para el registro de un usuario (Hereda de SchemaUser)
// =============================================================================

import {z, ZodObject} from "zod"; // Importa zod para la validación de los datos
import SchemaUser from "@/validations/SchemaUser";
import SchemaUserPassword from "@/validations/SchemaUserPassword";
import SchemaUserPhone from "@/validations/SchemaUserPhone"; // Importa el esquema de validación para los datos de un usuario (Heredado)

// Define el esquema de validación para el registro de un usuario
const SchemaUserRegister: ZodObject<any> = z.object({}).merge(SchemaUser).merge(SchemaUserPassword).merge(SchemaUserPhone);

// Exporta el esquema de validación
export default SchemaUserRegister;
