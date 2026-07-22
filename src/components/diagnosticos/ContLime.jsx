import { Box, Grid, Typography } from "@mui/material";
import GraficoBarras from "../charts/GraficoBarras";
import { useNavegacion } from "../../hooks/Navegacion";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * Componente que muestra un gráfico de barras LIME de la instancia.
 * @param {Diagnostico} diagnostico Instancia de diagnóstico con el atributo "explicacion" definido.
 * @returns {JSX.Element}
 */
export default function ContLime({ diagnostico, varianteTits = "h5", negritaTit = false }) {
    const { t } = useTranslation();

    const ancho = useMemo(() => {
        const { dispositivoMovil, ancho } = navegacion;
        return dispositivoMovil || (!dispositivoMovil && ancho <= 700) ? "98vw" : "65vw";
    }, [navegacion]);
    const alto = useMemo(() => {
        const { dispositivoMovil, alto } = navegacion;
        return dispositivoMovil || (!dispositivoMovil && alto <= 700) ? "100vh" : "65vh";
    }, [navegacion]);



    const tamGrafico = useMemo(() => {
        if (responsivo) {
            return { altura: undefined, anchura: undefined };
        } else {
            return { altura: 350, anchura:  "400%" };
        }
    }, [responsivo]);

    const datosGrafico = useMemo(() => {
        const { campos, datosPositivos, datosNegativos } = diagnostico.explicacion.datosGrafico;
        let txtPositivo = diagnostico?.diagnosticoModelo ? t("txtDiagnosticoPositivo") : t("txtDiagnosticoNegativo");
        let txtNegativo = diagnostico?.diagnosticoModelo ? t("txtDiagnosticoNegativo") : t("txtDiagnosticoPositivo");
        let colorPositivo = "";
        let colorNegativo = "";

        const camposTraducidos = [];
        for (const campo of campos) {
            const aux = campo.split(/=|<=|=>|<|>/).map((x) => x.trim());
            camposTraducidos.push(campo.replace(aux[0], t(aux[0])));
        }
        datos.labels = camposTraducidos;

        colorPositivo = diagnostico?.diagnosticoModelo ? "rgba(44,120,56, 2)" : "rgba(237, 108, 2, 255)";
        colorNegativo = diagnostico?.diagnosticoModelo ? "rgba(237, 108, 2, 255)" : "rgba(44,120,56, 2)";

        const datos = {
            labels: camposTraducidos,
            datasets: [
                {
                    label: txtPositivo,
                    data: datosPositivos,
                    backgroundColor: colorPositivo,
                },
                {
                    label: txtNegativo,
                    data: datosNegativos,
                    backgroundColor: colorNegativo,
                }
            ]
        };
        return datos;
    }, [diagnostico, t]);

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
                        responsive
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