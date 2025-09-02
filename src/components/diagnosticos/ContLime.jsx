import { Box, Grid, Typography } from "@mui/material";
import GraficoBarras from "../charts/GraficoBarras";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { useMemo } from "react";

/**
 * Componente que muestra un gráfico de barras LIME de la instancia.
 * @param {JSON} datos - Datos a mostrar en el gráfico. Debe seguir la forma de los gráficos.
 * @returns {JSX.Element}
 */
export default function ContLime({ datos, varianteTits = "h5", negritaTit = false }) {
    const navegacion = useNavegacion();
    const ancho = useMemo(() => {
        const { dispositivoMovil, ancho } = navegacion;
        return dispositivoMovil || (!dispositivoMovil && ancho <= 700) ? "98vw" : "65vw";
    }, [navegacion]);
    const alto = useMemo(() => {
        const { dispositivoMovil, alto } = navegacion;
        return dispositivoMovil || (!dispositivoMovil && alto <= 700) ? "100vh" : "65vh";
    }, [navegacion]);
    const responsivo = useMemo(() => {
        const { dispositivoMovil, orientacion } = navegacion;
        return (dispositivoMovil && orientacion == "horizontal") || !dispositivoMovil;
    }, [navegacion]);
    const tamGrafico = useMemo(() => {
        if (responsivo) {
            return { altura: undefined, anchura: undefined };
        } else {
            return { altura: 350, anchura:  "400%" };
        }
    }, [responsivo]);

    return (
        <Grid container columns={12}>
            <Grid size={12}>
                <Typography variant={varianteTits} paddingBottom="2vh" fontWeight={negritaTit ? "bold" : "normal"}>
                    Explicación del diagnóstico
                </Typography>
            </Grid>
            <Grid size={12}>
                <Typography>
                    Este gráfico muestra cómo influye cada característica en la clasificación del diagnóstico según el modelo.
                </Typography>
            </Grid>
            <Grid display="flex" size={12} justifyContent="center">
                <Box display="flex" maxHeight={alto} width={ancho} justifyContent="center" alignItems="center">
                    <GraficoBarras
                        responsive={responsivo}
                        altura={tamGrafico.altura}
                        anchura={tamGrafico.anchura}
                        datos={datos}
                        modoActualizacion="resize"
                        titulo="Contribución de cada característica" />
                </Box>
            </Grid>
        </Grid>
    );
};