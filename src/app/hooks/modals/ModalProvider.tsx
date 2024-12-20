"use client"; // Indica que este componente se ejecuta del lado del cliente en Next.js.

import React, {
    createContext,
    MutableRefObject,
    ReactElement,
    ReactNode,
    useCallback,
    useMemo,
    useRef,
    useState
} from "react";
import ModalFC, {ModalButtonsType, ModalFCProps} from "@/components/ModalFC"; // Importa el componente de modal y los tipos asociados.

export interface ModalContextType {
    createModal: (props: CreateModalFCProps) => { show: () => void; close: () => void }; // Tipo del contexto, define el método createModal y un objeto para gestionar modales.
    modals: ReactElement; // Representa la colección de modales que se van a renderizar.
}

export const ModalContext: React.Context<ModalContextType | undefined> = createContext<ModalContextType | undefined>(undefined); // Crea el contexto para los modales, con un valor inicial indefinido.

interface ModalProviderProps {
    children: ReactNode; // Define que ModalProvider acepta hijos (otros componentes).
}

export interface CreateModalFCProps {
    children: ReactNode; // Contenido del modal.
    onClose?: () => void; // Función opcional que se ejecuta al cerrar el modal.
    title?: string; // Título del modal.
    buttonsType?: ModalButtonsType; // Tipo de botones que se mostrarán en el modal.
    onConfirm?: () => void | Promise<void>; // Función opcional para manejar la acción de confirmar.
    onCancel?: () => void; // Función opcional para manejar la acción de cancelar.
    extendOnClose?: boolean; // Indica si onClose se ejecuta automáticamente tras onCancel/onConfirm. (Por defecto true)
    isSidebarOpen?: boolean; // Indica si la barra lateral está abierta, para ajustar el estilo del modal. (Por defecto true)
}

/**
 * Interfaz para el tipo de retorno de la función createModal.
 *
 * @property {() => void} show - Método para mostrar el modal.
 * @property {() => void} close - Método para cerrar el modal.
 */
export interface ModalInstance {
    show: () => void;  // Muestra el modal.
    close: () => void; // Cierra el modal.
}

export const ModalProvider: React.FC<ModalProviderProps> = ({children}) => {
    const [listModals, setListModals]: [ // Estado para almacenar la lista de modales.
        (ModalFCProps & { id: number })[],
        React.Dispatch<React.SetStateAction<(ModalFCProps & { id: number })[]>>
    ] = useState<Array<ModalFCProps & { id: number }>>([]);

    // Asigna un número único a cada modal.
    const nextId: MutableRefObject<number> = useRef(1); // Referencia mutable para almacenar el siguiente ID de modal. (Longitud de la lista + 1)

    /**
     * Método para crear un nuevo modal.
     *
     * @param {CreateModalFCProps} props - Propiedades del modal a crear.
     * @returns {ModalInstance} - Retorna un objeto con los métodos para interactuar con el modal. (close)
     */
    const createModal = useCallback((props: CreateModalFCProps): ModalInstance => {
        // Obtiene el siguiente ID para el modal (Es la cantidad de modales actuales + 1)
        let id: number = nextId.current;
        // Función para cerrar el modal y ejecutar onClose si está definido.
        const closeModal = (): void => {
            if (props.onClose) props.onClose(); // Llama a la función onClose pasada en las props si existe.
            setListModals((list: (ModalFCProps & { id: number })[]) => list.filter((modal: (ModalFCProps & { id: number })):boolean => modal.id !== id)); // Elimina el modal usando su ID
            nextId.current--; // Disminuye el contador de modales.
        };

        // Función para manejar la cancelación del modal.
        const cancelModal = (): void => {
            if (props.extendOnClose == undefined || props.extendOnClose) closeModal(); // Cierra el modal si extendOnClose es true o no está definido.
            if (props.onCancel) props.onCancel(); // Llama a la función onCancel pasada en las props si existe.
        };

        // Función para manejar la confirmación del modal.
        const confirmModal = (): void => {
            if (props.extendOnClose == undefined || props.extendOnClose) closeModal(); // Cierra el modal si extendOnClose es true o no está definido.
            if (props.onConfirm) props.onConfirm(); // Llama a la función onConfirm pasada en las props si existe.
        };

        const isSidebarOpen: boolean = props.isSidebarOpen ?? true; // Establece el estado de la barra lateral por defecto.
        const buttonsType: ModalButtonsType = props.buttonsType ?? ModalButtonsType.CONFIRM; // Establece el tipo de botones por defecto.

        // Configura las propiedades del modal, asociando las funciones de cierre, confirmación y cancelación.
        const modal: ModalFCProps = {
            ...props,
            onClose: closeModal,
            onCancel: cancelModal,
            onConfirm: confirmModal,
            isSidebarOpen,
            buttonsType,
            zIndex: 0, // (Se ajusta en el renderizado)
        };

        // Función para mostrar el modal agregándolo a la lista.
        const showModal = (): void => {
            setListModals((prev: (ModalFCProps & { id: number })[]) => [...prev, {...modal, id}]); // Agrega el modal a la lista.
            nextId.current++; // Aumenta el contador de modales.
        };


        // Retorna un objeto ModalInstance con los métodos show y close.
        return {show: showModal, close: closeModal};
    }, []);

    // Usa useMemo para memorizar la lista de modales, optimizando el renderizado.
    const modals = useMemo(() => (
        <>
            {/* Mapea la lista de modales y renderiza cada uno, ajustando el zIndex según su posición en la lista */}
            {listModals.map((modal, index) => (
                <ModalFC
                    key={index} // Usa el índice como clave única.
                    onClose={modal.onClose} // Pasa la función de cerrar.
                    buttonsType={modal.buttonsType} // Pasa el tipo de botones.
                    title={modal.title} // Pasa el título del modal.
                    onConfirm={modal.onConfirm} // Pasa la función de confirmar.
                    onCancel={modal.onCancel} // Pasa la función de cancelar.
                    zIndex={1000 + index} // Ajusta el zIndex para superponer los modales correctamente.
                    isSidebarOpen={modal.isSidebarOpen} // Pasa el estado de la barra lateral.
                >
                    {modal.children} {/* Renderiza el contenido del modal */}
                </ModalFC>
            ))}
        </>
    ), [listModals]); // Dependencia en listModals para actualizar la lista de modales cuando cambia.

    // Memoiza el valor del contexto, incluyendo los métodos y la lista de modales.
    const contextValue = useMemo(() => ({
        createModal,
        modals,
    }), [createModal, modals]);

    // Provee el contexto a los componentes hijos.
    return (
        <ModalContext.Provider value={contextValue}>
            {modals} {/* Renderiza los modales actuales */}
            {children} {/* Renderiza los componentes hijos */}
        </ModalContext.Provider>
    );
};
