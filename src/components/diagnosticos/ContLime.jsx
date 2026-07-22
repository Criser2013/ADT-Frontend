import { GraficoBarras } from "../charts";
import { Box, Grid, Typography } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * Componente que muestra un gráfico de barras LIME de la instancia.
 * @param {Diagnostico} diagnostico Instancia de diagnóstico con el atributo "explicacion" definido.
 * @returns {JSX.Element}
 */
export default function ContLime({ diagnostico }) {
    const { t } = useTranslation();
    const datosGrafico = useMemo(() => {
        const { campos, datosPositivos, datosNegativos } = diagnostico.explicacion.datosGrafico;
        const camposTraducidos = campos.map((campo) => {
            const [sintoma, _] = campo.split(/=|<=|=>|<|>/).map((x) => x.trim());
            return campo.replace(sintoma, t(sintoma));
        });
        const txtPositivo = diagnostico?.diagnosticoModelo ? t("txtDiagnosticoPositivo") :
            t("txtDiagnosticoNegativo");
        const txtNegativo = diagnostico?.diagnosticoModelo ? t("txtDiagnosticoNegativo") :
            t("txtDiagnosticoPositivo");
        const colorPositivo = diagnostico?.diagnosticoModelo ? "rgba(44,120,56, 2)" :
            "rgba(237, 108, 2, 255)";
        const colorNegativo = diagnostico?.diagnosticoModelo ? "rgba(237, 108, 2, 255)" :
            "rgba(44,120,56, 2)";
        return {
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
    }, [diagnostico, t]);

    return (
        <Grid container columns={1}>
            <Grid size={1}>
                <Typography variant="h5" paddingBottom="2vh">
                    {t("titExplicacion")}
                </Typography>
            </Grid>
            <Grid size={1}>
                <Typography>
                    {t("txtExplicacion")}
                </Typography>
            </Grid>
            <Grid display="flex" size={1} justifyContent="center">
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    maxHeight={{ xs: "65vh", md: "100vh" }}
                    width={{ xs: "98vw", md: "65vw" }} >
                    <GraficoBarras
                        datos={datosGrafico}
                        modoActualizacion="resize"
                        titulo={t("titLime")} />
                </Box>
            </Grid>
        </Grid>
    );
};