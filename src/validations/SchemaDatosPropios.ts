import schemaUser from "@/validations/SchemaUser";
import {z} from "zod";
import SchemaUser from "@/validations/SchemaUser";

const SchemaDatosPropios = SchemaUser.merge(z.object({
    contrasenia: z.string().optional(),
    dominio: z.string()
        .min(1, "El dominio no puede estar vacío")
        .refine((value: string) => !value.includes(" "), {
            message: "No debe contener espacios en blanco",
        })
        .refine((value: string) => value.trim().length != 0, {
            message: "El dominio no puede estar vacío",
        }).optional()
}));

export default SchemaDatosPropios;