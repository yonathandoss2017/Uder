
// Importa zod para la validación de los datos
import {z, ZodObject} from "zod";


const SchemaProveedor: ZodObject<any> = z.object({

    // Validación del nombre del proveedor
    nombre: z.string()
        .min(1, "El nombre no puede estar vacío")
        .max(30, "El nombre no puede tener más de 30 caracteres")
        .refine((value: string) => value.replaceAll(" ", "").length != 0, {
            message: "El nombre no puede estar vacío",
        }),

    // Validación del país de origen
    idPaisOrigen: z.preprocess(((val): string => val ? String(val) : ''), // Convierte el valor a String
        z.string()
            .min(1, "Debe seleccionar un país")),

});

export default SchemaProveedor;