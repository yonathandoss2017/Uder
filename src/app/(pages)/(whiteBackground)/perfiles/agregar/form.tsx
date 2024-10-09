'use client';

import React, { ChangeEvent, MutableRefObject, useEffect, useRef, useState } from "react";
import PerfilDTO from "@/types/dtos/PerfilDTO";
import { useModal } from "@/app/hooks/modals/useModal";
import { SubmitHandler, useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "@public/styles/modules/register.tiposequipo.module.css";
import stylesTable from "@public/styles/modules/table/table.tipoequipos.module.css";
import SchemaPerfil from "@/validations/SchemaPerfil";
import FetchAPIError, { isFetchAPIError } from "@/types/errors/FetchAPIError";
import { agregarPerfil, listarPerfiles } from "@/services/PerfilService";
import { ModalButtonsType } from "@/components/ModalFC";
import PerfilFilter from "@/types/filters/PerfilFilter";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";

interface RegisterPerfilFormProps {
    sessionAPIToken: string;
    clientData: UsuarioDTO;
}

interface FormValues extends PerfilDTO {}

const RegisterPerfilForm: React.FC<RegisterPerfilFormProps> = (props: RegisterPerfilFormProps) => {
    const { createModal } = useModal();

    // ----------------------- Formulario -----------------------
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    }: UseFormReturn<FormValues> = useForm<FormValues>({
        resolver: zodResolver(SchemaPerfil),
        mode: 'all',
        defaultValues: {}
    });

    const onSubmit: SubmitHandler<FormValues> = async (formValues: FormValues): Promise<void> => {
        const nuevoPerfil: PerfilDTO = {
            nombre: formValues.nombre,
            activo: formValues.activo ?? true,
            idFuncionalidades: formValues.idFuncionalidades,
            idInstitucion: props.clientData.idInstitucion,
            nivel: formValues.nivel
        };

        const response: PerfilDTO | FetchAPIError = await agregarPerfil(nuevoPerfil, props.sessionAPIToken);

        if (isFetchAPIError(response)) {
            console.error('ERROR - Registro de perfil - agregarPerfil:', response);
            createModal({
                children: (
                    <div>
                        <h2>Error al registrar el perfil</h2>
                        <p>{response.errorMessage}</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        createModal({
            children: (
                <div>
                    <h2>Perfil registrado correctamente</h2>
                </div>
            ),
            buttonsType: ModalButtonsType.CONFIRM
        }).show();

        // Refrescar la lista de perfiles
        const perfilesActualizados = await listarPerfiles(props.sessionAPIToken, appliedSearchTerms);
        if (!isFetchAPIError(perfilesActualizados)) {
            const perfilesOrdenados = perfilesActualizados.sort((a, b) => (a.nivel ?? 0) - (b.nivel ?? 0));
            setPerfiles(perfilesOrdenados);
        }

        reset();
    };


    // ----------------------- Listado de Perfiles -----------------------
    const [searchTerms, setSearchTerms] = useState<PerfilFilter>({ activo: true });
    const [appliedSearchTerms, setAppliedSearchTerms] = useState<PerfilFilter>(searchTerms);
    const [perfiles, setPerfiles] = useState<PerfilDTO[]>([]);

    const refSearchTermsTimer: MutableRefObject<NodeJS.Timeout | null> = useRef<NodeJS.Timeout | null>(null);

    useEffect((): void => {
        if (refSearchTermsTimer.current !== null) {
            clearTimeout(refSearchTermsTimer.current);
        }

        refSearchTermsTimer.current = setTimeout((): void => {
            setAppliedSearchTerms(searchTerms);
        }, 500);
    }, [searchTerms]);

    useEffect((): void => {
        (async (): Promise<void> => {
            const response: PerfilDTO[] | FetchAPIError = await listarPerfiles(props.sessionAPIToken, appliedSearchTerms);
            if (isFetchAPIError(response)) {
                console.error("ERROR - listarPerfiles", response.errorMessage);
                return;
            }

            // Ordenar perfiles de menor a mayor nivel
            const perfilesOrdenados = response.sort((a: PerfilDTO, b: PerfilDTO) => (a.nivel ?? 0) - (b.nivel ?? 0));

            setPerfiles(perfilesOrdenados);
        })();
    }, [appliedSearchTerms]);

    return (
        <div className={styles.container}>
            {/* Formulario */}
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <h2>Registro de Perfil</h2>
                <div className={styles.userDetailsRe}>
                    <div className={styles.inputBoxRe}>
                        <label className={styles.details}>
                            <span>Nombre <span className={styles.requiredField}>*</span></span>
                            <input
                                {...register("nombre", { required: "Este campo es requerido" })}
                                type="text"
                                placeholder="Nombre del Perfil"
                            />
                        </label>
                        {errors.nombre && <label className={styles.error}>{errors.nombre.message}</label>}
                    </div>
                    <div className={styles.inputBoxRe}>
                        <label className={styles.details}>
                            <span>Nivel <span className={styles.requiredField}>*</span></span>
                            <input
                                {...register("nivel", { required: "Este campo es requerido" })}
                                type="number"
                                placeholder="Nivel del Perfil"
                            />
                        </label>
                        {errors.nivel && <label className={styles.error}>{errors.nivel.message}</label>}
                    </div>
                    <div className={styles.buttomAe}>
                        <button type="submit">Agregar</button>
                    </div>
                </div>
            </form>

            {/* Listado */}
            <div className={stylesTable.containerTable}>
                <div className={stylesTable.scroll}>
                    {perfiles.length > 0 ? (
                        <table style={{ width: "100%" }}>
                            <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Nivel</th>
                            </tr>
                            </thead>
                            <tbody>
                            {perfiles.map((perfil: PerfilDTO) => (
                                <tr key={perfil.id}>
                                    <td>{perfil.nombre}</td>
                                    <td>{perfil.nivel}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : <h3>No se encontraron perfiles</h3>}
                </div>
            </div>
        </div>
    );
};

export default RegisterPerfilForm;
