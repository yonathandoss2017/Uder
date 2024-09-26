import React, {ChangeEvent, ReactElement, useEffect, useState} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import SchemaProveedor from "@/validations/SchemaProveedor";
import styles from "@public/styles/modules/table/table.editformequipo.module.css";
import ProveedorDTO from "@/types/dtos/ProveedorDTO";
import ChangeEntry from "@/types/ChangeEntry";
import {ModalButtonsType} from "@/components/ModalFC";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import ModalChangesFC from "@/components/ModalChangesFC";
import {modificarProveedor} from "@/services/ProveedorService";
import ComboBoxFC from "@/components/ComboBoxFC";
import PaisDTO from "@/types/dtos/PaisDTO";
import {listarPaises} from "@/services/PaisService";

interface EditProveedorFormProps {
    sessionAPIToken: string;
    idInstitucion: number;
    editingProveedor: ProveedorDTO;
    onSave?: (proveedorModified: ProveedorDTO) => void;
    onCancel?: () => void;
}

/**
 *
 * @param {EditProveedorFormProps} props
 * @constructor
 */
function EditProveedorForm(props: Readonly<EditProveedorFormProps>): ReactElement {
    const { createModal } = useModal();
    const [paisesOrigen, setPaisesOrigen]: [PaisDTO[], (value: PaisDTO[]) => void] = useState<PaisDTO[]>([]);
    const [loaded, setLoaded]: [boolean, (value: boolean) => void] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    }: UseFormReturn<ProveedorDTO> = useForm<ProveedorDTO>({
        resolver: zodResolver(SchemaProveedor),
        mode: 'all',
        defaultValues: {
            nombre: props.editingProveedor.nombre,
            idPaisOrigen: props.editingProveedor.idPaisOrigen
        }
    });

    // Carga inicial de países de origen
    useEffect(() => {
        (async (): Promise<void> => {
            setPaisesOrigen(await listarPaises(props.sessionAPIToken).then((response: PaisDTO[] | FetchAPIError): PaisDTO[] => {
                if (isFetchAPIError(response)) {
                    console.error("ERROR - Modificar Proveedor - listarPaises: ", response);
                    return [];
                }
                return response;
            }));

            setLoaded(true);
        })();
    }, [props.editingProveedor]);

    const onSubmit: SubmitHandler<ProveedorDTO> = async (formValues: ProveedorDTO): Promise<void> => {
        // Actualiza el proveedor con los valores del formulario
        const modifiedProveedor: ProveedorDTO = {
            ...props.editingProveedor,
            nombre: formValues.nombre, // Asegúrate de tomar el valor del formulario
            idPaisOrigen: formValues.idPaisOrigen // Toma el valor actualizado
        };

        const changes: ChangeEntry[] = await obtenerCambios(
            modifiedProveedor,
            paisesOrigen,
            props.editingProveedor
        );

        if (changes.length === 0) {
            createModal({
                children: <p>No se realizaron cambios</p>,
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        createModal({
            title: `Modificando proveedor "${props.editingProveedor.nombre}"`,
            children: ModalChangesFC(changes),
            buttonsType: ModalButtonsType.CONFIRM_CANCEL,
            async onConfirm(): Promise<void> {
                const response: void | FetchAPIError = await modificarProveedor(modifiedProveedor, props.sessionAPIToken);

                if (isFetchAPIError(response)) {
                    createModal({
                        children: <p>Error al modificar el proveedor: {response.errorMessage}</p>,
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                    console.error('ERROR - Modificar Proveedor - form.tsx - handleSave - modificarProveedor', response);
                    return;
                }

                createModal({
                    children: <p>Proveedor con nombre: &quot;{props.editingProveedor.nombre}&quot; modificado correctamente</p>,
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();

                if (props.onSave) {
                    props.onSave(modifiedProveedor);
                }
            },
            onCancel(): void {
                createModal({
                    children: <p>Modificación cancelada</p>,
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();
            }
        }).show();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`${styles.formContainer} ${styles.aparecer}`}>
            <h2>Modificación de Proveedor</h2>
            <div className={styles.detailsContainer}>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Nombre</label>
                    <input
                        value={props.editingProveedor.nombre} // Muestra el nombre original
                        readOnly // Hace que el campo sea de solo lectura
                        className="nombre"
                    />
                </div>

                <div className={styles.inputBox}>
                    <label className={styles.details}>País de Origen<span
                        className={styles.requiredField}>*</span></label>
                    <ComboBoxFC
                        message={"Seleccione un país"}
                        register={register("idPaisOrigen", {required: true})}
                        elements={paisesOrigen.map((pais: PaisDTO): { key: number, value: string } => ({
                            key: pais.id as number,
                            value: pais.nombre
                        }))}
                        selectedKey={props.editingProveedor.idPaisOrigen}
                        onChange={(event) => {
                            const newValue = Number(event.target.value);
                            register("idPaisOrigen").onChange({target: {value: newValue}});
                            console.log("Nuevo idPaisOrigen seleccionado:", newValue);
                        }}
                    />

                    {errors.idPaisOrigen &&
                        <label className={styles.error} style={{color: 'red'}}>{errors.idPaisOrigen.message}</label>}
                </div>

            </div>

            <div className={styles.buttomM}>
                <button type="submit">Guardar</button>
                <button type="button" onClick={props.onCancel}>Cancelar</button>
            </div>
        </form>
    );
}

export default EditProveedorForm;

/**
 *
 * @param modifiedProveedor
 * @param paisesOrigen
 * @param originalData
 */
async function obtenerCambios(modifiedProveedor: ProveedorDTO, paisesOrigen: PaisDTO[], originalData: ProveedorDTO): Promise<ChangeEntry[]> {
    const changes: ChangeEntry[] = [];

    if (originalData.nombre !== modifiedProveedor.nombre) {
        changes.push({
            field: "Nombre",
            previousValue: originalData.nombre,
            nextValue: modifiedProveedor.nombre
        });
    }

    console.log("paisesOrigen:", paisesOrigen);
    console.log("Tipo de modifiedProveedor.idPaisOrigen:", typeof modifiedProveedor.idPaisOrigen);
    console.log("Tipo de paisesOrigen[0].id:", typeof paisesOrigen[0]?.id);

    if (originalData.idPaisOrigen != modifiedProveedor.idPaisOrigen) {
        const previousCountry = paisesOrigen.find((pais: PaisDTO) => pais.id === originalData.idPaisOrigen);
        const nextCountry = paisesOrigen.find((pais: PaisDTO) => pais.id === Number(modifiedProveedor.idPaisOrigen)); // Convertir a número

        changes.push({
            field: "País de origen",
            previousValue: previousCountry ? previousCountry.nombre : 'N/A',
            nextValue: nextCountry ? nextCountry.nombre : 'N/A' // Maneja el caso donde nextCountry es undefined
        });
    }




    console.log("Changes:", changes);
    return changes;
}