// =============================================================================
// Componente funcional que devuelve el mensaje de cambios realizados en una entidad.
// - Se utiliza junto con el componente ModalConfirmFC para confirmar cambios.
// =============================================================================

"use client";  // Este es un componente del lado del cliente

// Importaciones necesarias
import React, {ReactElement} from "react";
import ChangeEntry from "@/types/ChangeEntry"; // Importa el componente Modal desde el archivo ModalFC

/**
 * Componente funcional que arma el mensaje de cambios realizados en una entidad.
 * @param {ChangeEntry[]} changes - Lista de cambios realizados en una entidad.
 * @returns {ReactElement} - Elemento React que representa el componente (JSX).
 */
const ModalChangesFC = (changes: Readonly<ChangeEntry[]>): ReactElement => {
    // Retorna el JSX del mensaje de cambios
    return (
        <>
            {(changes &&
                <>
                    <h4>Cambios:</h4>
                    <ol>
                        {changes.map((change: ChangeEntry, index: number): ReactElement => {
                            if (!change.previousValue && !change.nextValue) { // Si no hay valores previos ni siguientes (Para mostrar solo un mensaje, ej.: "Se subió una imagen")
                                return (
                                    <li key={index}>{change.field}</li>
                                )
                            } else if (!change.previousValue) { // Si no hay valor previo (ej.: Segundo nombre: "Juan")
                                return (
                                    <li key={index}>{change.field}: {String(change.nextValue)}</li>
                                )
                            } else if (!change.nextValue) { // Si no hay valor siguiente entonces se borró un campo (ej.: Campo borrado: Segundo nombre)
                                return (
                                    <li key={index}>Campo borrado: {change.field}</li>
                                )
                            } else { // Sí hay valor previo y siguiente (ej.: Edad: 20 -> 21)
                                return (
                                    <li key={index}>{change.field}: {String(change.previousValue)} {"->"} {String(change.nextValue)}</li>
                                )
                            }
                        })}
                    </ol>
                </>
            )}
            <br/>
            <p>¿Desea continuar?</p>
        </>
    );
};

export default ModalChangesFC; // Exporta el componente ModalConfirmFC para ser utilizado en otras partes de la aplicación
