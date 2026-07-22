import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend, useTheme, useMediaQuery
} from 'chart.js';
import { useMemo } from "react";
import { useTema } from "../../hooks/";

ChartJS.register(
    CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend
);

/**
 * Gráfico de barras de Chart.js
 * @param {String} titulo Título del gráfico
 * @param {Object} datos Datos a mostrar en el gráfico. Debe estar en la forma:  
 * ```
 * {  
 *   labels: ['Enero', 'Febrero', 'Marzo'], - nombres de las categorías  
 *   datasets: [{  
 *     label: 'Ventas', - opcional  
 *     data: [100, 200, 300], - los datos  
 *     backgroundColor: ['red', 'blue', 'green'], - colores de las barras  
 *   }]  
 * }
 * ````
 * @param {String} modoActualizacion Modo de actualización del gráfico (default, "none", "resize", etc).
 * @param {Number|undefined} alto Alto del gráfico (opcional). El valor `undefined` indica que el 
 * alto se ajusta automáticamente al contenedor.
 * @param {Number|undefined} ancho Ancho del gráfico (opcional). El valor `undefined` indica que 
 * el ancho se ajusta automáticamente al contenedor.
 * @returns {JSX.Element}
 */
export default function GraficoBarras({
    titulo, datos, modoActualizacion = "default", alto = undefined, ancho = undefined
}) {
    const { tema } = useTema();
    const theme = useTheme();
    const md = useMediaQuery(theme.breakpoints.up('md'));
    const lg = useMediaQuery(theme.breakpoints.up('lg'));
    const xl = useMediaQuery(theme.breakpoints.up('xl'));
    const tamLeyenda = useMemo(() => {
        if (xl) return 18;
        if (lg) return 16;
        if (md) return 14;
        return 12;
    }, [md, lg, xl]);
    const tamTitulo = useMemo(() => {
        if (xl) return 28;
        if (lg) return 24;
        if (md) return 20;
        return 16;
    }, [md, lg, xl]);
    const opciones = useMemo(() => {
        const colorTitulo = tema == "dark" ? "#ffffff" : "#000000";
        const colorMalla = tema == "dark" ? "#838383ff" : "#d3d3d3bd";

        return {
            responsivo: true,
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
        };
    }, [titulo, tema, tamLeyenda, tamTitulo]);

    return (
        <Bar
            redraw
            height={alto}
            width={ancho}
            data={datos}
            updateMode={modoActualizacion}
            options={opciones} />
    );
}