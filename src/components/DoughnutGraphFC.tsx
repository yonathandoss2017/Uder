// =============================================================================
// Componente de gráfico de dona reutilizable
// =============================================================================

"use client";  // Este es un componente del lado del cliente

// Importa los estilos
import styles from "@public/styles/modules/dashboard.module.css";

// Importa los módulos necesarios
import React, {ReactElement, useEffect, useState} from 'react';
import {Doughnut} from "react-chartjs-2";
import {Chart as ChartJS, ChartData, ChartOptions, registerables} from 'chart.js';

// Registra los módulos necesarios de Chart.js
ChartJS.register(...registerables);

// Definición de las propiedades esperadas por el componente
interface DoughnutGraphFCProps {
    title: string; // Título del gráfico
    type: string; // Tipo de datos del gráfico
    elements: { label: string, value: number }[]; // Elementos para mostrar en el gráfico
}

// Colores predeterminados para las secciones del gráfico
const chartColors: string[] = ['#36a2eb', '#c9cbcf', '#ff6384'];

/**
 * Función que genera los datos del gráfico de Dona.
 * @param {string} type - Tipo de datos del gráfico.
 * @param {Array<{ label: string, value: number }>} elements - Elementos del gráfico con etiquetas y valores.
 * @returns {ChartData<"doughnut">} - Datos formateados para el gráfico de Dona.
 */
function getChartData(type: string, elements: { label: string, value: number }[]): ChartData<"doughnut"> {
    return {
        labels: elements.map((element: { label: string, value: number }) => element.label),
        datasets: [
            {
                label: type,
                data: elements.map((element: { label: string, value: number }) => element.value),
                borderWidth: 2,
                backgroundColor: chartColors,
            }
        ]
    };
}

/**
 * Componente funcional que muestra un gráfico de Dona.
 * @param {DoughnutGraphFCProps} props - Propiedades del componente.
 * @returns {ReactElement} - Elemento React que representa el gráfico de Dona.
 */
const DoughnutGraphFC = (props: DoughnutGraphFCProps): ReactElement => {
    // Estado para los datos del gráfico
    let [dataChart, setDataChart]: [ChartData<"doughnut">, (dataChart: ChartData<"doughnut">) => void] =
        useState<ChartData<"doughnut">>(getChartData(props.type, props.elements));

    // Efecto para actualizar los datos del gráfico cuando cambian las propiedades
    useEffect(() => {
        setDataChart(getChartData(props.type, props.elements));
    }, [props.elements, props.type]);

    // Opciones de configuración para el gráfico de Dona
    const options: ChartOptions<"doughnut"> = {
        responsive: true,
        plugins: {
            legend: {
                display: false, // Oculta la leyenda del gráfico
            },
            title: {
                display: false, // Oculta el título del gráfico
            },
        },
        scales: {
            y: {
                beginAtZero: true // Comienza el eje Y desde cero
            }
        }
    };

    // Retorna el JSX del componente
    return (
        <>
            <h2>{props.title}</h2> {/* Título del gráfico */}
            <Doughnut className={styles.myChart} data={dataChart} options={options} /> {/* Gráfico de dona */}
        </>
    );
};

export default DoughnutGraphFC; // Exporta el componente DoughnutGraphFC para su uso en otras partes de la aplicación
