"use client";  // Este es un componente del lado del cliente

// Importa los estilos de la página de inicio
import styles from "@public/styles/modules/dashboard.module.css";

// Importa los módulos necesarios
import React, {ReactElement, useEffect, useState} from 'react';
import DoughnutGraphFC from "@/components/DoughnutGraphFC";
import {contarEquipos} from "@/services/EquiposService";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHammer, faNotesMedical, faShieldHalved} from "@fortawesome/free-solid-svg-icons";
import {useToken} from "@/app/hooks/TokenProvider";

// Enumeración para los tipos de gráficos disponibles
enum GraphType {
    EquiposActivos = 'Equipos Activos',
    EquiposEnGarantia = 'Equipos en garantía',
    EquiposEnIntervencion = 'Equipos en intervención'
}

// Interfaz para los valores del gráfico
interface GraphValues {
    label: string;
    value: number;
}

export interface HomeGraphFCProps {
    sessionAPIToken: string;
}

/**
 * Componente funcional que muestra estadísticas dinámicas de equipos y un gráfico de rosquilla.
 * @param {HomeGraphFCProps} props - Propiedades del componente.
 * @returns {ReactElement} - Elemento React que representa el componente.
 */
const HomeGraphFC: React.FC<HomeGraphFCProps> = (props: HomeGraphFCProps): ReactElement => {

    // Obtenemos el token de sesión del cliente
    const {sessionAPIToken } = useToken();

    // Estados para almacenar la cantidad de equipos, equipos activos, equipos en garantía y equipos en intervención respectivamente
    const [cantEquipos, setCantEquipos]: [number, (value: number) => void] = useState<number>(0);
    const [cantEquiposActivos, setCantEquiposActivos]: [number, (value: number) => void] = useState<number>(0);
    const [cantEquiposEnGarantia, setCantEquiposEnGarantia]: [number, (value: number) => void] = useState<number>(0);
    const [cantEquiposEnIntervencion, setCantEquiposEnIntervencion]: [number, (value: number) => void] = useState<number>(0);

    // Estado para almacenar el tipo de estadística seleccionada y los valores para el gráfico
    const [selectedStatistic, setSelectedStatistic]: [GraphType, (value: GraphType) => void] = useState<GraphType>(GraphType.EquiposActivos);
    const [graphValues, setGraphValues]: [GraphValues[], (value: GraphValues[]) => void] = useState<GraphValues[]>([]);


    /**
     * Efecto que se ejecuta al cargar el componente.
     * Actualiza la cantidad de equipos, equipos activos, equipos en garantía y equipos en intervención.
     */
    useEffect((): void => {

        // Prócedimiento asíncrono autoinvocado que actualiza los datos y valores del gráfico
        (async (): Promise<void> => {

            if(sessionAPIToken === undefined || sessionAPIToken==null) return;

            // Actualizar la cantidad de equipos, equipos activos, equipos en garantía y equipos en intervención
            setCantEquipos(await contarEquipos(sessionAPIToken));
            setCantEquiposActivos(await contarEquipos(sessionAPIToken, {activo: true}));
            setCantEquiposEnGarantia(await contarEquipos(sessionAPIToken, {garantiaEnFecha: new Date()}));
            setCantEquiposEnIntervencion(await contarEquipos(sessionAPIToken, {enIntervencion: true}));

        })();
    }, []);


    /**
     * Efecto que se ejecuta al cargar el componente y cada vez que cambian los estados
     * de cantEquipos, cantEquiposActivos, cantEquiposEnGarantia, cantEquiposEnIntervencion
     * o selectedStatistic. Actualiza los valores del gráfico.
     */
    useEffect((): void => {

        // Prócedimiento asíncrono autoinvocado que actualiza los datos y valores del gráfico
        (async (): Promise<void> => {

            // Actualizar los valores del gráfico según la estadística seleccionada
            switch (selectedStatistic) {
                case GraphType.EquiposEnGarantia:
                    setGraphValues([
                        {label: 'En garantía', value: cantEquiposEnGarantia},
                        {label: 'Sin garantía', value: (cantEquipos - cantEquiposEnGarantia)}
                    ]);
                    break;
                case GraphType.EquiposEnIntervencion:
                    setGraphValues([
                        {label: 'En intervención', value: cantEquiposEnIntervencion},
                        {label: 'Sin intervención', value: (cantEquipos - cantEquiposEnIntervencion)}
                    ]);
                    break;
                default: // Por defecto, se muestra la cantidad de equipos activos y dados de baja
                    setGraphValues([
                        {label: 'Activos', value: cantEquiposActivos},
                        {label: 'Dados de baja', value: (cantEquipos - cantEquiposActivos)}
                    ]);
                    break;
            }
        })();
    }, [cantEquipos, cantEquiposActivos, cantEquiposEnGarantia, cantEquiposEnIntervencion, selectedStatistic]);

    // Retorna el JSX del componente
    return (
        <div className={styles.datos}>
            <div className={styles.tarjetas}>
                {/* Tarjetas para mostrar las estadísticas de equipos */}
                <button className={styles.tarjetasEquipos}
                        onClick={() => setSelectedStatistic(GraphType.EquiposActivos)}>
                    <div className={styles.infoTarjetasEquipos}>
                        <h3>Equipos Activos</h3>
                        <p>{cantEquiposActivos}</p>
                    </div>
                    <FontAwesomeIcon className={styles.icon} icon={faNotesMedical}/>
                </button>
                <button className={styles.tarjetasEquipos}
                        onClick={() => setSelectedStatistic(GraphType.EquiposEnGarantia)}>
                    <div className={styles.infoTarjetasEquipos}>
                        <h3>Equipos en garantía</h3>
                        <p>{cantEquiposEnGarantia}</p>
                    </div>
                    <FontAwesomeIcon className={styles.icon} icon={faShieldHalved}/>
                </button>
                <button className={styles.tarjetasEquipos}
                        onClick={() => setSelectedStatistic(GraphType.EquiposEnIntervencion)}>
                    <div className={styles.infoTarjetasEquipos}>
                        <h3>Equipos en Intervención</h3>
                        <p>{cantEquiposEnIntervencion}</p>
                    </div>
                    <FontAwesomeIcon className={styles.icon} icon={faHammer}/>
                </button>
            </div>
            {/* Componente de gráfico de rosquilla para mostrar las estadísticas */
            }
            <div className={styles.grafico}>
                <DoughnutGraphFC
                    elements={graphValues}
                    title={selectedStatistic}
                    type={"Equipos"}
                />
            </div>
        </div>
    );
};

// Exporta el componente HomeGraphFC para ser utilizado en otras partes de la aplicación
export default HomeGraphFC;
