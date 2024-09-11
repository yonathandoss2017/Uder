import {z, ZodObject} from "zod";

const SchemaModelo: ZodObject<any> = z.object({

    nombre: z.string()
        .min(1, "El nombre no puede estar vacío")
        .max(30, "El nombre no puede tener más de 30 caracteres")
        .refine((value: string) => value.replaceAll(" ", "").length != 0, {
            message: "El nombre no puede estar vacío",
        }),
});

export default SchemaModelo;