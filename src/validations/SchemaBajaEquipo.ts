import {z, ZodObject} from "zod";

const schemaBajaEquipo: ZodObject<any> = z.object({

    razon: z.string()

        .min(1, "La razón no puede estar vacío")
        .max(50, "La razón no puede tener más de 50 caracteres"),


    comentarios : z.string()

        .min(1, "Comentarios no puede estar vacío")
        .max(80, "Comentarios no puede tener más de 80 caracteres")



});

export default schemaBajaEquipo;