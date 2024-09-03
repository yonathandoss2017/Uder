"use client"; // Hook del lado del cliente (Se ejecuta en el navegador)

// Importa los módulos necesarios
import {useContext} from 'react';
import {ModalContext, ModalContextType} from "@/app/hooks/modals/ModalProvider";

/**
 * Exporta el hook useModal para ser utilizado en otros componentes.
 * Permite acceder al contexto del modal para crear y mostrar modales.
 * @returns {ModalContextType} - Retorna el contexto del modal. (createModal y modals)
 */
export const useModal = (): ModalContextType => {
    const context: ModalContextType | undefined = useContext(ModalContext); // Obtiene el contexto del modal

    if (!context) { // Si el contexto no está definido, lanza un error (Falta el ModalProvider)
        throw new Error('useModal debe ser usado dentro de un ModalProvider');
    }

    return context// Retorna el contexto del modal
};
