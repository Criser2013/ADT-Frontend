import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS, Title, Tooltip, Legend, ArcElement
} from 'chart.js';

ChartJS.register(
    ArcElement, Title, Tooltip, Legend,
);

/**
 * Gráfico de pastel de Chart.js
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
 * @param {String} modoActualizacion - Modo de actualización del gráfico (default, "none", "resize", etc).
 * @returns {JSX.Element}
 */
export default function GraficoPastel({ titulo, datos, modoActualizacion = "default" }) {
    const opciones = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true, text: titulo, color: "rgb(0, 0, 0)", font: { size: 13 },
            },
        },
    };

    return (
        <Pie data={datos} options={opciones} updateMode={modoActualizacion} style={{ maxHeight: "40vh"}} />
    );
};