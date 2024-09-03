// =============================================================================
// Componente funcional para mostrar mensajes de error.
// =============================================================================

"use client";  // Este es un componente del lado del cliente

// Importa estilos
import styles from "@public/styles/modules/message.module.css";

// Importa los módulos necesarios
import Link from 'next/link';
import {ReactElement} from "react";

interface ErrorFCProps {
    message?: string;
    customContent?: ReactElement;
}

/**
 * Componente funcional que muestra un mensaje de error.
 * @param props - Propiedades del mensaje de error.
 * @returns {ReactElement} - Elemento React que representa el mensaje de error.
 */
function ErrorFC(props: Readonly<ErrorFCProps>): ReactElement {
    // Retorna el JSX del mensaje de error
    return (
        <main className={styles.container}>
            {props.customContent ? (
                props.customContent
            ) : (
                <>
                    <h1>Error</h1>
                    <p>{props.message}</p>
                    <Link href={"/"} className="back-link">
                        Volver a la página de inicio
                    </Link>
                </>
            )}
        </main>
    );
}

// Exporta el componente ErrorFC para ser utilizado en otras partes de la aplicación
export default ErrorFC;
