import { Box, Button, Grid, IconButton, Typography, CircularProgress, Link, Tooltip, Paper } from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';
import { useEffect, useState } from "react";
import { Trans } from "react-i18next";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useNavegacion } from "../../hooks/Navegacion";
import { useCredenciales } from "../../contexts/CredencialesContext";
import BtnTema from "../../components/layout/BtnTema";
import { URL_CONDICIONES, URL_MANUAL_USUARIO } from "../../../constants";
import fondoClaro from "../../assets/fondos/fondo_claro.png";
import fondoOscuro from "../../assets/fondos/fondo_oscuro.png";
import icono from "../../assets/iconos/icono.png";
import ModalSimple from "../../components/modals/ModalSimple";
import CloseIcon from "@mui/icons-material/Close";
import Check from "../../components/tabs/Check";
import SelectIdioma from "../../components/tabs/SelectIdioma";
import Captcha from "../../components/captcha";

/**
 * Página de inicio de sesión que permite a los usuarios acceder a la aplicación.
 * @returns {JSX.Element}
 */
export default function IniciarSesionPage() {
    const { autenticado, iniciarSesion, cargando, usuario } = useAuth();
    const navigate = useNavigate();
    const { tema, idioma, paginaAnterior, cambiarTema } = useNavegacion();
    const { firebase } = useCredenciales();
    const { t } = useTranslation();
    const [desactivarBtn, setDesactivarBtn] = useState(true);
    const [btnCargando, setBtnCargando] = useState(false);
    const [captchaAceptado, setCaptchaAceptado] = useState(false);
    const [terminosAceptados, setTerminosAceptados] = useState(false);
    const [modal, setModal] = useState({
        mensaje: "", mostrar: false
    });
    /*const width = useMemo(() => {
        const { dispositivoMovil, orientacion, ancho } = navegacion;
        if (!dispositivoMovil && (ancho >= 1020)) {
            return "35vw";
        } else if (!dispositivoMovil && (ancho >= 550 && ancho < 1020)) {
            return "57vw";
        } else if ((!dispositivoMovil && (ancho < 550)) || (dispositivoMovil && (orientacion == "vertical"))) {
            return "100vw";
        } else {
            return "40vw";
        }
    }, [navegacion]);*/
    /*const centrar = useMemo(() => {
        const { dispositivoMovil, orientacion, alto } = navegacion;
        if ((!dispositivoMovil && (alto >= 800)) || (dispositivoMovil && (orientacion == "vertical"))) {
            return "center";
        } else {
            return null;
        }
    }, [navegacion]);*/

    useEffect(() => {
        paginaAnterior.current = "";
    }, [paginaAnterior]);

    useEffect(() => {
        document.title = t("titInicioSesion");
    }, [idioma, t]);

    /**
     * Habilita o deshabilita el botón de inicio de sesión basado en si el usuario ha 
     * aceptado los términos y ha completado el reCAPTCHA, o si ya está autenticado.
     */
    useEffect(() => {
        if (autenticado) {
            setDesactivarBtn(!captchaAceptado);
        } else {
            setDesactivarBtn(!(captchaAceptado && terminosAceptados));
        }
    }, [captchaAceptado, terminosAceptados, autenticado]);

    function manejadorBtnCambiarTema() {
        cambiarTema(tema);
        setCaptchaAceptado(false);
        setTerminosAceptados(false);
        setDesactivarBtn(true);
    };

    async function manejadorBtnIniciarSesion() {
        const resultadoExitoso = await iniciarSesion(usuario);
        if (!resultadoExitoso) {
            setDesactivarBtn(true);
        } else {
            navigate("/menu", { replace: true });
        }
    };

    function manejadorBtnModal() {
        setModal((x) => ({ ...x, mostrar: false }));
    };

    return (
        <>
            {(cargando || !firebase) ? (
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
                        backgroundImage: `url(${tema === "light" ? fondoClaro : fondoOscuro})`,
                        backgroundSize: "cover"
                    }}>
                    <Paper
                        sx={{
                            width: width, padding: "4vh", overflow: "auto", height: "100%",
                            display: "flex", alignItems: centrar
                        }}>
                        <Grid columns={12} spacing={2} container>
                            <Grid
                                container
                                display="flex"
                                columns={2}
                                size={12}
                                justifyContent="space-between"
                                alignItems="center">
                                <SelectIdioma />
                                <IconButton size="large" onClick={manejadorBtnCambiarTema}>
                                    <BtnTema />
                                </IconButton>
                            </Grid>
                            <Grid container alignItems="center" columns={12} columnSpacing="20px">
                                <Grid size={3}>
                                    <img src={icono} height="90vh" width="90vh" alt="logo" />
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
                                        activado={terminosAceptados}
                                        manejadorCambios={(e) => setTerminosAceptados(e.target.checked)}
                                        etiqueta={
                                            <Trans i18nKey="txt4InicioSesion" t={t}>
                                                He leído y acepto la&nbsp;
                                                <Link
                                                    target="_blank"
                                                    href={URL_CONDICIONES}
                                                >
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
                    <ModalSimple
                        mostrar={modal.mostrar}
                        titulo={t("tituloErr")}
                        mensaje={modal.mensaje}
                        txtBtn={t("txtBtnCerrar")}
                        manejadorBtn={manejadorBtnModal}
                        iconoBtn={<CloseIcon />}
                    />
                </Box>)}

        </>
    );
};