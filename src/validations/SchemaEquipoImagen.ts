// =============================================================================
// Esquema de validación para una imagen de un equipo
// =============================================================================

// Importa zod para la validación de los datos
import {z, ZodObject} from "zod";

// Define el esquema de validación con Zod
const SchemaEquipoImagen: ZodObject<any> = z.object({
    // Validación del campo de imagen
    imagen: z.any()
        .refine((file: FileList): boolean => file?.length === 1, {message: "Debe subir una imagen"}) // Debe haber exactamente un archivo
        .refine((files) => ["image/jpeg", "image/jpg", "image/png"].includes(files?.[0]?.type), // Tipo de archivo permitido
            "Solo se aceptan archivos: .jpg, .jpeg y .png"
        )
});

// Exporta el esquema de validación
export default SchemaEquipoImagen;
