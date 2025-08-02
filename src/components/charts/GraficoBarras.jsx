import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
    Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useEffect } from 'react';

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
export default function GraficoBarras({ titulo, datos, colores, modoActualizacion = "default" }) {
    const opciones = {
        responsive: true,
        color: colores,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: titulo,
            },
        },
    };

    useEffect(() => {
        ChartJS.register(
            CategoryScale,
            LinearScale,
            BarElement,
            Title,
            Tooltip,
            Legend
        );
    }, []);

    return (
        <Bar data={datos} options={opciones} updateMode={modoActualizacion} />
    );
};