import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useMemo } from 'react';
import { useNavegacion } from '../../contexts/NavegacionContext';

ChartJS.register(
    CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend
);

/**
 * Gráfico de barras de Chart.js
 * @param {String} titulo - Título del gráfico
 * @param {JSON} datos - Datos a mostrar en el gráfico. Debe estar en la forma:  
 * {  
 *   labels: ['Enero', 'Febrero', 'Marzo'], - nombres de las categorías  
 *   datasets: [{  
 *     label: 'Ventas', - opcional  
 *     data: [100, 200, 300], - los datos  
 *     backgroundColor: ['red', 'blue', 'green'], - colores de las barras  
 *   }]  
 * }  
 * @param {Array} colores - Colores para las barras del gráfico
 * @param {String} modoActualizacion - Modo de actualización del gráfico (default, "none", "resize", etc).
 * @returns {JSX.Element}
 */
export default function GraficoBarras({ titulo, datos, modoActualizacion = "default" }) {
    const { tema } = useNavegacion();
    const colorTitulo = useMemo(() => {
        return tema == "dark" ? "#ffffff" : "#000000";
    }, [tema]);
    const colorMalla = useMemo(() => {
        return tema == "dark" ? "#838383ff" : "#d3d3d3bd";
    }, [tema]);
    const opciones = useMemo(() => ({
            responsive: true,
            plugins: {
                legend: {
                    position: 'top', labels: {
                        color: colorTitulo,
                        font: { size: 14, family: 'Roboto' }
                    }
                },
                title: {
                    display: true, text: titulo, color: colorTitulo,
                    font: { size: 16, family: "Raleway", weight: "bold" },
                },
            },
            scales: {
                x: {
                    grid: { color: colorMalla },
                    ticks: {
                        color: colorTitulo,
                        font: { size: 14, family: 'Roboto' },
                    }
                },
                y: {
                    grid: { color: colorMalla },
                    ticks: {
                        color: colorTitulo,
                        font: { size: 14, family: 'Roboto' },
                    }
                }
            }
        }), [titulo, colorTitulo, colorMalla]);

    return (
        <Bar data={datos} options={opciones} updateMode={modoActualizacion} />
    );
}