import CloseIcon from "@mui/icons-material/Close";
import FondoClaro from "/backgrounds/fondo_claro.png";
import FondoOscuro from "/backgrounds/fondo_oscuro.png";
import GoogleIcon from '@mui/icons-material/Google';
import Logo from "/logo.png";
import { Box, Button, Grid, IconButton, Typography, CircularProgress, Link, Tooltip, Paper } from "@mui/material";
import { BtnTema } from "../../components/layout";
import { Captcha } from "../../components/captcha";
import { Check } from "../../components/tabs";
import { SelectIdioma } from "../../components/selects";
import { Trans } from "react-i18next";
import { useAuth } from "../../hooks";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTema, { temaClaro } from "../../hooks/tema-hook";
import { useTranslation } from "react-i18next";
import { URL_CONDICIONES, URL_MANUAL_USUARIO } from "../../constants";

/**
 * Página de inicio de sesión que permite a los usuarios acceder a la aplicación.
 * @returns {JSX.Element}
 */
export default function IniciarSesionPage() {
    const navigate = useNavigate();
    const { autenticado, iniciarSesion, cargando, usuario } = useAuth();
    const { tema } = useTema();
    const { t } = useTranslation();
    const [btnCargando, setBtnCargando] = useState(false);
    const [captchaAceptado, setCaptchaAceptado] = useState(false);
    const [desactivarBtn, setDesactivarBtn] = useState(true);
    const [terminosAceptados, setTerminosAceptados] = useState(false);

    useEffect(() => {
        document.title = t("titInicioSesion");
    }, [t]);

    /**
     * Habilita o deshabilita el botón de inicio de sesión basado en si el usuario ha 
     * aceptado los términos (sino está autenticado) y ha completado el captcha.
     */
    useEffect(() => {
        if (autenticado) {
            setDesactivarBtn(!captchaAceptado);
        } else {
            setDesactivarBtn(!(captchaAceptado && terminosAceptados));
        }
    }, [captchaAceptado, terminosAceptados, autenticado]);

    async function manejadorBtnIniciarSesion() {
        const res = await iniciarSesion(usuario);
        if (res) {
            navigate("/menu", { replace: true });
        } else {
            setDesactivarBtn(true);
            setTerminosAceptados(false);
            setCaptchaAceptado(false);
        }
    };

    return (
        <>
            {(cargando) ? (
                <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
                    <CircularProgress />
                </Box>
            ) : (
                <Box
                    display="flex"
                    justifyContent="end"
                    alignItems="center"
                    height="100vh"
                    sx={{
                        backgroundImage: `url(${tema == temaClaro ? FondoClaro : FondoOscuro})`,
                        backgroundSize: "cover"
                    }}>
                    <Paper
                        sx={{
                            display: "flex",
                            width: {
                                xs: "100vw", sm: "57vw", md: "57vw", lg: "45vw", xl: "25vw"
                            },
                            height: "100%",
                            padding: "4vh",
                            overflow: "auto"
                        }}>
                        <Grid container columns={12} spacing={2}>
                            <Grid
                                container
                                display="flex"
                                columns={2}
                                size={12}
                                justifyContent="space-between"
                                alignItems="center">
                                <SelectIdioma />
                                <BtnTema tamano="large" />
                            </Grid>
                            <Grid container alignItems="center" columns={12} columnSpacing="20px">
                                <Grid size={3}>
                                    <img src={Logo} height="90vh" width="90vh" alt="logo" />
                                </Grid>
                                <Grid size={9}>
                                    <Typography align="left" variant="h4" fontWeight="bold">
                                        {t("titAplicacion")}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid container columns={1} spacing={2} size={12}>
                                <Grid size={1}>
                                    <Typography align="left" variant="body1">
                                        {t("txt1InicioSesion")}
                                    </Typography>
                                </Grid>
                                <Grid size={1}>
                                    <Typography align="left" variant="body1">
                                        {t("txt2InicioSesion")}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid size={12} display="flex" justifyContent="center">
                                <Captcha
                                    setCarga={setBtnCargando}
                                    setCaptchaAceptado={setCaptchaAceptado}
                                />
                            </Grid>
                            {(!autenticado) ? (
                                <Grid size={12} display="flex" justifyContent="left">
                                    <Check
                                        marcado={terminosAceptados}
                                        manejadorCambios={(e) => setTerminosAceptados(e.target.checked)}
                                        etiqueta={
                                            <Trans i18nKey="txt4InicioSesion" t={t}>
                                                He leído y acepto la&nbsp;
                                                <Link
                                                    target="_blank"
                                                    href={URL_CONDICIONES}>
                                                    política de privacidad
                                                </Link>.
                                            </Trans>} />
                                </Grid>) : null}
                            <Grid size={12} display="flex" justifyContent="center">
                                <Tooltip title={t("txtAyudaBtnInicioSesion")}>
                                    <span style={{ width: "100%" }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            disabled={desactivarBtn}
                                            loading={btnCargando}
                                            loadingPosition="end"
                                            onClick={manejadorBtnIniciarSesion}
                                            startIcon={<GoogleIcon fontSize="large" />}
                                            sx={{ textTransform: "none" }}>
                                            {autenticado ? t("txt2BtnInicioSesion") : t("txt1BtnInicioSesion")}
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Grid>
                            <Grid size={12}>
                                <Typography align="center" variant="body1" margin="auto">
                                    <b>{t("txt3InicioSesion")}</b>
                                </Typography>
                                <br />
                                <Typography align="center" variant="body1" margin="auto">
                                    <Trans i18nKey="txt5InicioSesion" t={t}>
                                        ¿Necesitas ayuda? ¡consulta nuestro
                                        <Link
                                            target="_blank"
                                            href={URL_MANUAL_USUARIO}>
                                            manual de instrucciones
                                        </Link>!
                                    </Trans>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>)}
        </>
    );
};