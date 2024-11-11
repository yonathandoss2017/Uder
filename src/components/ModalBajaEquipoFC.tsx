"use client";  // Este es un componente del lado del cliente

// Importa los módulos necesarios
import React, {ReactElement} from "react";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {useModal} from "@/app/hooks/modals/useModal";
import {ModalButtonsType} from "@/components/ModalFC";
import EquipoDTO from "@/types/dtos/EquipoDTO";
import stylesForm from "@public/styles/modules/table/table.editform.module.css";
import {useForm, UseFormReturn} from "react-hook-form";
import BajaEquipoDTO from "@/types/dtos/BajaEquipoDTO";
import {zodResolver} from "@hookform/resolvers/zod";
import SchemaBajaEquipo from "@/validations/SchemaBajaEquipo";
import {darBajaEquipo} from "@/services/EquiposService";
import {useToken} from "@/app/hooks/TokenProvider";

/**
 * Propiedades del componente
 * @property {equipo} EquipoDTO Equipo a dar de baja
 * @property {string} sessionAPIToken Token de sesión del cliente en la API
 * @property {function} onSave Función que se ejecuta al guardar los cambios
 * @property {function} onCancel Función que se ejecuta al cancelar la baja
 */
interface ModalBajaEquipoFCProps {
    equipo: EquipoDTO;
    sessionAPIToken: string;
    onSave?: (bajaEquipo: BajaEquipoDTO) => void;
    onCancel?: () => void;
}

/**
 * Formulario de
 *
 * @param {ModalBajaEquipoFCProps} props - Propiedades del componente
 */
function ModalBajaEquipoFC(props: Readonly<ModalBajaEquipoFCProps>): ReactElement {

    // Obtenemos el token de sesión del cliente
    const {sessionAPIToken } = useToken();

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();
    // ----------------------- Baja de equipo -----------------------

    // Obtenemos los métodos y propiedades necesarios del hook useForm para el formulario (Baja de equipo en este caso)
    const {
        register,              // Método para registrar los inputs del formulario
        handleSubmit,          // Método para manejar el envío del formulario
        formState: {errors}    // Propiedad que contiene los errores del formulario
    }: UseFormReturn<BajaEquipoDTO> = useForm<BajaEquipoDTO>({ // Inicializamos useForm con el tipo BajaEquipoDTO
        resolver: zodResolver(SchemaBajaEquipo), // Usamos zodResolver para la validación del formulario con el esquema de Zod SchemaBajaEquipo
        mode: 'all', // Configuramos el modo de validación a "all", lo que válida en cada cambio de valor y al salir del campo
    });

    const handleBajaSubmit = async (data: BajaEquipoDTO): Promise<void> => {

        if(!sessionAPIToken) return;

        // Muestra un modal de confirmación antes de dar de baja el equipo
        createModal({
            title: "Eliminando equipo con num de serie: \"" + props.equipo.numSerie + "\"",
            children: (
                <p>¿Estás seguro de que deseas dar de baja el equipo con número de
                    serie: &quot;{props.equipo.numSerie}&quot;?
                    <br/>
                    No podrás deshacer esta acción.</p>
            ),
            buttonsType: ModalButtonsType.CONFIRM_CANCEL,
            onConfirm: async (): Promise<void> => { // Acción al confirmar
                const Baja: BajaEquipoDTO = {
                    razon: data.razon,
                    comentarios: data.comentarios,
                    idEquipo: props.equipo.id as number
                };

                await darBajaEquipo(Baja, sessionAPIToken).then(async (response: void | FetchAPIError): Promise<void> => {
                    if (isFetchAPIError(response)) {
                        console.error("ERROR - Modal Baja Equipo - handleBajaSubmit - darBajaEquipo", response);
                        createModal({
                            children: (
                                <p>Error al eliminar el equipo: {response.errorMessage}</p>
                            ),
                            buttonsType: ModalButtonsType.CONFIRM
                        }).show();
                        return;
                    }

                    createModal({
                        children: (
                            <p>Equipo con número de serie: &quot;{props.equipo.numSerie}&quot; eliminado
                                correctamente</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();

                    if (props.onSave) {
                        props.onSave(Baja);
                    }
                });
            },
            onCancel: (): void => { // Acción al cancelar
                createModal({
                    children: (
                        <p>Eliminación cancelada</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();
            }
        }).show();
    };

    // ------------------------------------------------------------------------

    // Retorna el JSX del componente (Formulario de edición de usuario)
    return (
        <form className={stylesForm.confirmar} onSubmit={handleSubmit(handleBajaSubmit)}>
            <h3>Razon de la baja</h3>
            <input {...register('razon')} type="text" className="razonbaja"/>
            {errors.razon && <p className={stylesForm.error}>{errors.razon.message}</p>}
            <h4>Comentarios</h4>
            <textarea {...register('comentarios')} className="comentariobaja"/>
            {errors.comentarios && <p className={stylesForm.error}>{errors.comentarios.message}</p>}
            <button type="submit" className={stylesForm.buttomBaja}>Confirmar Baja</button>
            <button type="button" onClick={(event) => {
                event.preventDefault();
                if (props.onCancel)
                    props.onCancel();
            }} className={stylesForm.buttomBaja}>Cancelar
            </button>
        </form>
    );
}

// Exporta el componente (Formulario de edición de usuario)
export default ModalBajaEquipoFC;