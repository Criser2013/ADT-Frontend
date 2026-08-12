import {
    Chart as ChartJS, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useMediaQuery, useTheme } from "@mui/material";
import { useMemo } from 'react';
import { useTema } from "../../hooks";

ChartJS.register(
    ArcElement, Title, Tooltip, Legend,
);

/**
 * Gráfico de pastel de Chart.js
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
 * ```
 * @param {String} modoActualizacion Modo de actualización del gráfico (default, "none", "resize", etc).
 * @returns {JSX.Element}
 */
export default function GraficoPastel({ titulo, datos, modoActualizacion = "resize" }) {
    const theme = useTheme();
    const md = useMediaQuery(theme.breakpoints.up('md'));
    const lg = useMediaQuery(theme.breakpoints.up('lg'));
    const xl = useMediaQuery(theme.breakpoints.up('xl'));
    const { tema } = useTema();
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
        return {
            responsive: true,
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
        };
    }, [tema, titulo, tamLeyenda, tamTitulo]);
    return (
        <Pie
            redraw={true}
            data={datos}
            options={opciones}
            updateMode={modoActualizacion}
            style={{ maxHeight: "40vh" }} />
    );
};