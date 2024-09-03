// Importa los estilos
import styles from "@public/styles/modules/backgroundLayout.module.css"; // Importa el favicon (icono de la aplicación)
// Importa los módulos necesarios
import React, {ReactNode} from "react";
import Sidebar from "@/components/Sidebar";

// Define el layout de las páginas con fondo claro
// (Inclye la barra lateral, ya que solo se muestra en páginas con fondo claro)
export default function BackgroundLayoutWhite({children}: Readonly<{ children: ReactNode }>) {
    return (
        <div className={styles.backgroundWhite}>
            <Sidebar/>
            {children} {/* Renderiza el contenido de la página */}
            <ul className={styles.circles}> {/* Efecto del fondo */}
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