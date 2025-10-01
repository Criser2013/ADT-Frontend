import { Box, Grid, Typography } from "@mui/material";
import GraficoBarras from "../charts/GraficoBarras";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * Componente que muestra un gráfico de barras LIME de la instancia.
 * @param {JSON} datos - Datos a mostrar en el gráfico. Debe seguir la forma de los gráficos.
 * @returns {JSX.Element}
 */
export default function ContLime({ datos, varianteTits = "h5", negritaTit = false }) {
    const navegacion = useNavegacion();
    const { t } = useTranslation();
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
    const datosGrafico = useMemo(() => {
        const aux = [];
        for (const i of datos.labels) {
            const auxi = i.split(/=|<=|=>|<|>/).map((x) => x.trim());
            aux.push(i.replace(auxi[0], t(auxi[0])));
        }
        datos.labels = aux;

        for (let i = 0; i < 2; i++) {
            datos.datasets[i].label = t(datos.datasets[i].label);
        }

        return datos;
    }, [datos, navegacion.idioma]);

    return (
        <Grid container columns={12}>
            <Grid size={12}>
                <Typography variant={varianteTits} paddingBottom="2vh" fontWeight={negritaTit ? "bold" : "normal"}>
                    {t("titExplicacion")}
                </Typography>
            </Grid>
            <Grid size={12}>
                <Typography>
                    {t("txtExplicacion")}
                </Typography>
            </Grid>
            <Grid display="flex" size={12} justifyContent="center">
                <Box display="flex" maxHeight={alto} width={ancho} justifyContent="center" alignItems="center">
                    <GraficoBarras
                        responsive={responsivo}
                        altura={tamGrafico.altura}
                        anchura={tamGrafico.anchura}
                        datos={datosGrafico}
                        modoActualizacion="resize"
                        titulo={t("titLime")} />
                </Box>
            </Grid>
        </Grid>
    );
};