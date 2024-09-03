"use client";  // Componente del lado del cliente (Se renderiza en el navegador)

// Importa los estilos
import styles from "@public/styles/modules/modal.module.css";

// Importra modulos necesarios
import React, {ReactNode} from 'react';

// Define el tipo de modal (Botónes predefinidos)
export enum ModalButtonsType {
    NONE = "none",
    CONFIRM = "confirm",
    CONFIRM_CANCEL = "confirm-cancel",
    CLOSE = "close"
}

/**
 * Propiedades del componente ModalFC
 *
 * @property {() => void} onClose - Función al cerrar el modal.
 * @property {ReactNode} children - Contenido envuelto por el modal y mostrado en su interior.
 * @property {ModalButtonsType} buttonsType - Tipo de botones a mostrar en el modal.
 * @property {string} message - Mensaje a mostrar en el modal. (Modal de tipo confirm - Se puede usar children)
 * @property {() => void} onConfirm - Función a ejecutar al confirmar. (Modal de tipo confirm)
 * @property {() => void} onCancel - Función a ejecutar al cancelar. (Modal de tipo confirm-cancel)
 * @property {number} zIndex - Z-index del modal.
 */
export interface ModalFCProps {
    children: ReactNode;
    onClose: () => void;
    title?: string;
    buttonsType: ModalButtonsType;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    zIndex: number;
    isSidebarOpen: boolean;
}

// Define el componente funcional ModalFC
/**
 * Componente funcional que muestra un modal.
 * @param props - Propiedades del modal.
 * @returns ReactElement - Retorna el JSX del modal.
 */
const ModalFC: React.FC<ModalFCProps> = (props: ModalFCProps) => {
    // Implementación del modal
    return (
        <div className={styles.modalOverlay} style={{zIndex: props.zIndex}}>

            {/* Contenido del modal, evita cerrar al hacer clic dentro */}
            <div className={`${styles.modalContent} ${(props.isSidebarOpen) && styles.modalContentSidebarPosition}`}>

                {props.title && (
                    <>
                        <h3>{props.title}</h3>
                        <br/>
                    </>
                )}

                {/* Muestra el contenido del modal */}
                <div>
                    {props.children}
                </div>
                <br/>
                {/* Muestra los botones según el tipo */}
                {props.buttonsType != ModalButtonsType.NONE && (
                    <div>
                        {props.buttonsType === ModalButtonsType.CLOSE && (
                            <>
                                {/* Botón para cerrar */}
                                <button className={styles.btnModal}
                                        onClick={props.onClose}>Cerrar
                                </button>
                            </>
                        )}
                        {(props.buttonsType === ModalButtonsType.CONFIRM || props.buttonsType === ModalButtonsType.CONFIRM_CANCEL) && (
                            <>
                                {/* Botón para confirmar */}
                                <button className={styles.btnModal}
                                        onClick={props.onConfirm}>Confirmar
                                </button>
                            </>
                        )}
                        {props.buttonsType === ModalButtonsType.CONFIRM_CANCEL && (
                            <>
                                {/* Botón para cancelar */}
                                <button className={styles.btnModal}
                                        onClick={props.onCancel}>Cancelar
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ModalFC;