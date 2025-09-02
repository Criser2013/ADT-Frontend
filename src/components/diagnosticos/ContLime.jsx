import { Box, Grid, Typography } from "@mui/material";
import GraficoBarras from "../charts/GraficoBarras";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { useMemo } from "react";

/**
 * Componente que muestra un gráfico de barras LIME de la instancia.
 * @param {JSON} datos - Datos a mostrar en el gráfico. Debe seguir la forma de los gráficos.
 * @param {number} width - Anchura del gráfico.
 * @param {number} height - Altura del gráfico.
 * @returns {JSX.Element}
 */
export default function ContLime({ datos }) {
    const navegacion = useNavegacion();
    const ancho = useMemo(() => {
        const { dispositivoMovil, ancho } = navegacion;
        return dispositivoMovil || (!dispositivoMovil && ancho <= 700) ? "98vw" : "65vw";
    }, [navegacion]);
    const alto = useMemo(() => {
        const { dispositivoMovil, alto } = navegacion;
        return dispositivoMovil || (!dispositivoMovil && alto <= 700) ? "100vh" : "65vh";
    }, [navegacion]);
    return (
        <Grid container columns={12}>
            <Grid size={12}>
                <Typography variant="h5" paddingBottom="2vh">
                    Explicación del diagnóstico del modelo
                </Typography>
            </Grid>
            <Grid size={12}>
                <Typography>
                    Este gráfico muestra cómo cada característica contribuye a la clasificación del diagnóstico. Una barra más alta indica que esa característica
                    tuvo una mayor influencia en la decisión del modelo para esa clase.
                </Typography>
            </Grid>
            <Grid display="flex" size={12} justifyContent="center">
                <Box display="flex" maxHeight={alto} width={ancho} justifyContent="center" alignItems="center">
                    <GraficoBarras
                        responsive={true}
                        datos={datos}
                        titulo="Contribución de cada característica con el tipo de diagnóstico" />
                </Box>
            </Grid>
        </Grid>
    );
};