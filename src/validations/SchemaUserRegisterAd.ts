import {z, ZodObject} from "zod";
import SchemaUser from "@/validations/SchemaUser";
import SchemaUserRegister from "@/validations/SchemaUserRegister"; // Importa zod para la validación de los datos

const SchemaUserRegisterAd = SchemaUserRegister.extend({
    dominio: z
        .string()
        .min(1, "El dominio no puede estar vacío")
        .refine((value: string) => !value.includes(" "), {
            message: "No debe contener espacios en blanco",
        })
        .refine((value: string) => value.replaceAll(" ", "").length != 0, {
            message: "El dominio no puede estar vacío",
        })
});

export default SchemaUserRegisterAd;