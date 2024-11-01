import {z, ZodObject} from "zod";
import SchemaUser from "@/validations/SchemaUser";
import SchemaUserRegister from "@/validations/SchemaUserRegister";
import SchemaUserPhone from "@/validations/SchemaUserPhone"; // Importa zod para la validación de los datos

const SchemaUserRegisterAd = SchemaUser.merge(SchemaUserPhone).extend({
    dominio: z.string()
        .min(1, "El dominio no puede estar vacío")
        .refine((value: string) => !value.includes(" "), {
            message: "No debe contener espacios en blanco",
        })
        .refine((value: string) => value.trim().length != 0, {
            message: "El dominio no puede estar vacío",
        })
});

export default SchemaUserRegisterAd;