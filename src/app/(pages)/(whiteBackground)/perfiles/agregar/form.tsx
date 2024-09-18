'use client';

import React, { useState } from "react";
import styles from "@public/styles/modules/register.tiposequipo.module.css";
import PerfilDTO from "@/types/dtos/PerfilDTO";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";


interface RegisterPerfilFormProps {
    clientData: UsuarioDTO;
    sessionAPIToken: string;
}

const RegisterPerfilForm = ({ clientData, sessionAPIToken }: RegisterPerfilFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<PerfilDTO>();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (data: PerfilDTO) => {
        setLoading(true);
        setError(null);

        // Lógica para enviar el perfil al servidor
        try {
            const response = await fetch("/api/perfiles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionAPIToken}`,
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                // Redirigir a otra página o mostrar un mensaje de éxito
                router.push("/perfiles/success");
            } else {
                const responseData = await response.json();
                setError(responseData.message || "Error al crear el perfil");
            }
        } catch (e) {
            setError("Error de red o servidor no disponible");
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.field}>
                <label htmlFor="nombre">Nombre del perfil</label>
                <input
                    id="nombre"
                    type="text"
                    {...register("nombre", { required: "El nombre es obligatorio" })}
                />
                {errors.nombre && <p className={styles.error}>{errors.nombre.message}</p>}
            </div>

            <div className={styles.field}>
                <label htmlFor="nivel">Nivel</label>
                <input
                    id="nivel"
                    type="number"
                    {...register("nivel", { required: "El nivel es obligatorio" })}
                />
                {errors.nivel && <p className={styles.error}>{errors.nivel.message}</p>}
            </div>

            <div className={styles.field}>
                <label htmlFor="idInstitucion">ID de Institución</label>
                <input
                    id="idInstitucion"
                    type="number"
                    {...register("idInstitucion", { required: "La institución es obligatoria" })}
                />
                {errors.idInstitucion && <p className={styles.error}>{errors.idInstitucion.message}</p>}
            </div>

            <div className={styles.field}>
                <label htmlFor="idFuncionalidades">Funcionalidades</label>
                <input
                    id="idFuncionalidades"
                    type="number"
                    {...register("idFuncionalidades", { required: "Las funcionalidades son obligatorias" })}
                />
                {errors.idFuncionalidades && <p className={styles.error}>{errors.idFuncionalidades.message}</p>}
            </div>

            <div className={styles.field}>
                <label htmlFor="activo">Activo</label>
                <input id="activo" type="checkbox" {...register("activo")} />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" disabled={loading}>
                {loading ? "Cargando..." : "Crear Perfil"}
            </button>
        </form>
    );
};

export default RegisterPerfilForm;
