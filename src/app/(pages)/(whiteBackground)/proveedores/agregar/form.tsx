'use client';

import React, {useEffect, useState} from "react";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import ProveedorDTO from "@/types/dtos/ProveedorDTO";
import {useModal} from "@/app/hooks/modals/useModal";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import styles from "@public/styles/modules/register.tiposequipo.module.css";
import SchemaProveedor from "@/validations/SchemaProveedor";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {agregarProveedor} from "@/services/ProveedorService";
import {ModalButtonsType} from "@/components/ModalFC";
import {listarPaises} from "@/services/PaisService";
import ComboBoxFC from "@/components/ComboBoxFC";
import PaisDTO from "@/types/dtos/PaisDTO";
import {useToken} from "@/app/hooks/TokenProvider";


interface RegisterProveedorFormProps {
    sessionAPIToken: string;
    clientData: UsuarioDTO;
}

interface FormValues extends ProveedorDTO {}

const RegisterProveedorForm: React.FC<RegisterProveedorFormProps> = (props: RegisterProveedorFormProps) => {

    const {sessionAPIToken } = useToken();

    const { createModal } = useModal();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    }: UseFormReturn<FormValues> = useForm<FormValues>({
        resolver: zodResolver(SchemaProveedor),
        mode: 'all',
        defaultValues: {}
    });

    // Lista de países
    const [paises, setPaises]: [PaisDTO[], (value: PaisDTO[]) => void] = useState<PaisDTO[]>([]);

    // Estado para almacenar el país seleccionado
    const [selectedPaisId, setSelectedPaisId]: [number | undefined, (value: number | undefined) => void] = useState<number | undefined>(undefined);

    // Cargar los países al montar el componente
    useEffect(() => {

        if(sessionAPIToken==null) return;

        (async (): Promise<void> => {
            // ------------------- Cargar países -------------------
            setPaises(await listarPaises(sessionAPIToken).then((response: PaisDTO[] | FetchAPIError): PaisDTO[] => {
                if (isFetchAPIError(response)) return [];
                return response;
            }));
        })();
    }, [sessionAPIToken]);

    const onSubmit: SubmitHandler<FormValues> = async (formValues: FormValues): Promise<void> => {

        if(sessionAPIToken==null) return;

        if (!selectedPaisId) {
            // Mostrar error si no se selecciona un país
            createModal({
                children: (
                    <div>
                        <h2>Error</h2>
                        <p>Debe seleccionar un país</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM,
            }).show();
            return;
        }

        const nuevoProveedor: ProveedorDTO = {
            nombre: formValues.nombre,
            activo: true,
            idInstitucion: props.clientData.idInstitucion,
            idPaisOrigen: selectedPaisId
        };

        const response: ProveedorDTO | FetchAPIError = await agregarProveedor(nuevoProveedor, sessionAPIToken);

        if (isFetchAPIError(response)) {
            console.error('ERROR - Registro de proveedor - agregarProveedor:', response);
            createModal({
                children: (
                    <div>
                        <h2>Error al registrar el proveedor</h2>
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
                    <h2>Proveedor registrado correctamente</h2>
                </div>
            ),
            buttonsType: ModalButtonsType.CONFIRM
        }).show();

        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.equipoForm}>
            <h2>Registro de Proveedor</h2>
            <div className={styles.userDetailsRe}>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Nombre <span className={styles.requiredField}>*</span></span>
                        <input
                            {...register("nombre", { required: "Este campo es requerido" })}
                            type="text"
                            placeholder="Nombre del Proveedor"
                        />
                    </label>
                    {errors.nombre && <label className={styles.error}>{errors.nombre.message}</label>}
                </div>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>País <span className={styles.requiredField}>*</span></span>

                        <ComboBoxFC
                            message={"Seleccione un país"}
                            elements={paises.map((pais: any): { key: number, value: string } => ({
                                key: pais.id as number,
                                value: pais.nombre
                            }))}
                            selectedKey={selectedPaisId}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPaisId(parseInt(e.target.value))}
                        />
                    </label>
                </div>
                <div className={styles.buttomAe}>
                    <button type="submit">Agregar</button>
                </div>
            </div>
        </form>
    );
};

export default RegisterProveedorForm;