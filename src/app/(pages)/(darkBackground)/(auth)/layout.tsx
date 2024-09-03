// ==================================================================
// Este archivo es el layout principal de la aplicación, aquí se definen
// los elementos que se repetirán en todas las páginas de la aplicación.
// ==================================================================

// Importa los estilos
import styles from "@public/styles/modules/backgroundLayout.module.css"; // Importa el favicon (icono de la aplicación)
// Importa los módulos necesarios
import React, {ReactNode} from "react";

// Define el layout principal de la aplicación con los elementos comunes a todas las páginas
// children: Contenido de la página que se renderizará dentro del layout
export default function BackgroundLayoutDark({children}: Readonly<{ children: ReactNode }>) {
    return (
        <div className={styles.backgroundDark}>
            {children} {/* Renderiza el contenido de la página */}
            <ul className={`${styles.circles} ${styles.dark}`}> {/* Efecto del fondo */}
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
            </ul>
        </div>
    );
}