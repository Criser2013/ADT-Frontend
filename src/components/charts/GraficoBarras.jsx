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
 * @param {Array} responsive - Indica si el gráfico debe ser responsive
 * @param {String} modoActualizacion - Modo de actualización del gráfico (default, "none", "resize", etc).
 * @param {Number|undefined} altura - Alto del gráfico (opcional).
 * @param {Number|undefined} anchura - Ancho del gráfico (opcional).
 * @returns {JSX.Element}
 */
export default function GraficoBarras({ titulo, datos, responsive = true,
    modoActualizacion = "default", altura = undefined, anchura = undefined }) {
    const { tema, ancho } = useNavegacion();
    const tamTitulo = useMemo(() => {
        const vw = (ancho / 100); // en pixeles
        const rem = 16;

        return Math.max(Math.floor(vw + (rem * 0.35)), 16);
    }, [ancho]);
    const tamLeyenda = useMemo(() => {
        const vw = (ancho / 100); // en pixelesa
        const rem = 16;

        return Math.max(Math.floor(vw + (rem * 0.2)), 12);
    }, [ancho]);
    const colorTitulo = useMemo(() => {
        return tema == "dark" ? "#ffffff" : "#000000";
    }, [tema]);
    const colorMalla = useMemo(() => {
        return tema == "dark" ? "#838383ff" : "#d3d3d3bd";
    }, [tema]);
    const opciones = useMemo(() => ({
        responsive: responsive,
        plugins: {
            legend: {
                position: 'top', labels: {
                    color: colorTitulo,
                    font: { size: tamLeyenda, family: 'Roboto' }
                }
            },
            title: {
                display: true, text: titulo, color: colorTitulo,
                font: { size: tamTitulo, family: "Raleway", weight: "bold" },
            },
        },
        scales: {
            x: {
                grid: { color: colorMalla },
                ticks: {
                    color: colorTitulo,
                    font: { size: tamLeyenda, family: 'Roboto' },
                }
            },
            y: {
                grid: { color: colorMalla },
                ticks: {
                    color: colorTitulo,
                    font: { size: tamLeyenda, family: 'Roboto' },
                }
            }
        }
    }), [titulo, colorTitulo, colorMalla, tamLeyenda, tamTitulo]);

    return (
        <Bar height={altura} width={anchura} data={datos} options={opciones} updateMode={modoActualizacion} />
    );
}