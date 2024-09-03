// Importa el estilo del componente
import styles from "@public/styles/modules/loading.module.css"
// Importa módulos necesarios
import {ReactElement} from 'react';

/**
 * Componente de carga de las páginas de la aplicación (Spinner de carga)
 */
function LoadingPage(): ReactElement {
    return (
        <main className={styles.loadingPage}>
            <div className={styles.loadingAnimation}>
                <div className={styles.spinner}></div>
                <p>Cargando...</p>
            </div>
        </main>
    );
}

// Exporta el componente
export default LoadingPage;
