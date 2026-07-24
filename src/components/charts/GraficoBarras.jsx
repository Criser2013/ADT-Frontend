import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend
} from 'chart.js';
import { useMediaQuery, useTheme } from "@mui/material";
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
 * @returns {JSX.Element}
 */
export default function GraficoBarras({ titulo, datos, modoActualizacion = "default" }) {
    const theme = useTheme();
    const md = useMediaQuery(theme.breakpoints.up('md'));
    const lg = useMediaQuery(theme.breakpoints.up('lg'));
    const xl = useMediaQuery(theme.breakpoints.up('xl'));
    const { tema } = useTema();
    const tamLeyenda = useMemo(() => {
        if (xl) return 18;
        if (lg) return 16;
        if (md) return 14;
        return 10;
    }, [md, lg, xl]);

    const tamTitulo = useMemo(() => {
        if (xl) return 28;
        if (lg) return 24;
        if (md) return 20;
        return 12;
    }, [md, lg, xl]);
    const opciones = useMemo(() => {
        const colorTitulo = tema == "dark" ? "#ffffff" : "#000000";
        const colorMalla = tema == "dark" ? "#838383ff" : "#d3d3d3bd";

        return {
            responsive: true,
            maintainAspectRatio: false,
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
            redraw={true}
            data={datos}
            updateMode={modoActualizacion}
            options={opciones} />
    );
}