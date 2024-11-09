// ===========================================================================
// Componente funcional que muestra un combobox con una lista de elementos
// ===========================================================================

"use client";  // Este es un componente del lado del cliente

// Importa los módulos necesarios
import {ChangeEvent, ReactElement, useState} from 'react';
import {UseFormRegisterReturn} from "react-hook-form";

/**
 * Propiedades esperadas por el componente ComboBoxFC.
 */
interface ComboBoxEntitiesProps {
    register?: UseFormRegisterReturn; // Propiedad para registrar el combobox en el formulario
    elements: { key: number | string, value: string }[]; // Elementos del combobox (key: id, value: nombre)
    selectedKey?: number | string; // Valor seleccionado por defecto
    onChange?: (event: ChangeEvent<HTMLSelectElement>) => void; // Evento que se ejecuta al cambiar el valor del combobox
    message?: string; // Mensaje que se muestra en el primer elemento del combobox
    messageSelectable?: boolean; // Indica si el mensaje inicial es seleccionable
}

/**
 * Componente funcional que muestra un combobox con opciones seleccionables.
 * @param {ComboBoxEntitiesProps} props - Propiedades del componente.
 * @returns {ReactElement} - Elemento React que representa el combobox.
 */
const ComboBoxFC = (props: ComboBoxEntitiesProps): ReactElement => {
    // Determina el valor por defecto
    const defaultValue: string | number | undefined = props.selectedKey ?? (props.message ? "" : undefined);

    // Valor seleccionado actualmente
    const [selectedKey, setSelectedKey] = useState<string | number | undefined>(defaultValue);

    // Retorna el JSX del combobox
    return (
        <select
            {...props.register} // Propagación de las propiedades de registro del formulario
            onChange={(event) => {
                setSelectedKey(event.target.value); // Actualiza el valor seleccionado
                props.onChange && props.onChange(event); // Ejecuta el evento onChange proporcionado si está definido
            }}
            value={selectedKey} // Valor por defecto del combobox
        >
            {/* Opción para el mensaje inicial sí está definido */}
            {props.message && <option disabled={!props.messageSelectable} value={""}>{props.message}</option>}
            {/* Renderizado de las opciones del combobox */}
            {props.elements.map((element: { key: number | string, value: string }) => (
                <option key={element.key} value={element.key}>
                    {element.value}
                </option>
            ))}
        </select>
    );
};

// Exportación del componente ComboBoxFC
export default ComboBoxFC;
