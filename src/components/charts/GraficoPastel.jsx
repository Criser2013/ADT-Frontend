import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { useMemo } from 'react';
import { useNavegacion } from '../../contexts/NavegacionContext';

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
 * @param {boolean} responsive - Indica si el gráfico debe ser responsivo
 * @param {String} modoActualizacion - Modo de actualización del gráfico (default, "none", "resize", etc).
 * @returns {JSX.Element}
 */
export default function GraficoPastel({ titulo, datos, responsive = true, modoActualizacion = "default" }) {
    const { tema, ancho } = useNavegacion();
    const tamTitulo = useMemo(() => {
        const vw = (ancho / 100); // en pixeles
        const rem = 16;

        return Math.floor(vw + (rem * 0.35));
    }, [ancho]);
    const tamLeyenda = useMemo(() => {
        const vw = (ancho / 100); // en pixeles
        const rem = 16;

        return Math.floor(vw + (rem * 0.2));
    }, [ancho]);
    const colorTitulo = useMemo(() => {
        return tema == "dark" ? "#ffffff" : "#000000";
    }, [tema]);

    const opciones = useMemo(() => ({
        responsive: responsive,
        plugins: {
            legend: {
                position: 'top', labels: {
                    color: colorTitulo,
                    font: { size: tamLeyenda, family: 'Roboto' },
                    border: { color: "black" }
                }
            },
            title: {
                display: true, text: titulo, color: colorTitulo,
                font: { size: tamTitulo, family: "Raleway", weight: "bold" },
            }
        },
        elements: {
            arc: {
                borderColor: "#00000000"
            }
        }
    }), [titulo, colorTitulo]);

    return (
        <Pie data={datos} options={opciones} updateMode={modoActualizacion} style={{ maxHeight: "40vh" }} />
    );
};