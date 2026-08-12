import FondoClaro from "/backgrounds/fondo_claro.png";
import FondoOscuro from "/backgrounds/fondo_oscuro.png";
import { Box, Button, Paper, Typography, CircularProgress } from "@mui/material";
import { useAppConfig, useAuth, useIdioma } from "../../hooks";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import useTema, { temaClaro } from "../../hooks/tema-hook";

/**
 * Página 404 de la aplicación.
 * @returns {JSX.Element}
 */
export default function Page404() {
    const navigate = useNavigate();
    const { autenticado } = useAuth();
    const { aplicacionIniciada } = useAppConfig();
    const { idioma } = useIdioma();
    const { t } = useTranslation();
    const { tema } = useTema();

    useEffect(() => {
        document.title = `${t("tit404")}`;
    }, [idioma, t]);

    function manejadorBtn() {
        const url = (autenticado) ? "/menu" : "/";
        navigate(url, { replace: true });
    };

    return (
        !aplicacionIniciada ? (
            <Box display="flex" height="100vh" alignItems="center" justifyContent="center">
                <CircularProgress />
            </Box>
        ) : (
            <Box
                display="flex"
                width="100%"
                height="100vh"
                justifyContent="center"
                alignItems="center"
                sx={{
                    backgroundImage: `url(${tema == temaClaro ? FondoClaro : FondoOscuro})`,
                    backgroundSize: "cover"
                }}>
                <Paper sx={{ padding: "6vh" }}>
                    <Typography variant="h3" align="center">
                        {t("tit404")}
                    </Typography>
                    <Typography variant="h1" color="primary" align="center" fontWeight="bold">
                        404
                    </Typography>
                    <Button
                        fullWidth
                        color="primary"
                        variant="contained"
                        onClick={manejadorBtn}
                        sx={{
                            textTransform: "none",
                            marginTop: "3vh"
                        }}>
                        <b>{t("txt404")}</b>
                    </Button>
                </Paper>
            </Box>)
    );
};