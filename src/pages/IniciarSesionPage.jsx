import { Box, Button, Grid, IconButton, Typography, CircularProgress, Link, Tooltip } from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useNavegacion } from "../contexts/NavegacionContext";
import { useCredenciales } from "../contexts/CredencialesContext";
import ReCAPTCHA from "react-google-recaptcha";
import BtnTema from "../components/tabs/BtnTema";
import { URL_MANUAL_USUARIO } from "../../constants";

/**
 * Página de inicio de sesión que permite a los usuarios acceder a la aplicación.
 * Si el usuario ya está autenticado, se redirige automáticamente al menú principal.
 * @returns JSX.Element
 */
export default function IniciarSesionPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    const navegacion = useNavegacion();
    const credenciales = useCredenciales();
    const CAPTCHA = useRef(null);
    const [desactivarBtn, setDesactivarBtn] = useState(true);
    const [recargarCaptcha, setRecargarCaptcha] = useState(false);
    const cargandoAuth = useMemo(() => {
        return auth.cargando;
    }, [auth.cargando]);
    const width = useMemo(() => {
        const { dispositivoMovil, orientacion } = navegacion;
        if (!dispositivoMovil) {
            return "60vh";
        } else if (dispositivoMovil && orientacion == "vertical") {
            return "100vh";
        } else {
            return "100vh";
        }
    }, [navegacion.dispositivoMovil, navegacion.orientacion]);
    const height = useMemo(() => {
        return navegacion.dispositivoMovil ? "96vh" : "97.5vh";
    }, [navegacion.dispositivoMovil]);
    const temaCaptcha = useMemo(() => navegacion.tema, [navegacion.tema]);
    const reCAPTCHAApi = useMemo(() => {
        return credenciales.obtenerRecaptcha();
    }, [credenciales.obtenerRecaptcha()]);

    /**
     * Verifica la autenticación del usuario y redirige si ya está autenticado.
     */
    useEffect(() => {
        document.title = "Iniciar sesión - HADT";
        navegacion.setPaginaAnterior("");
    }, []);

    /*useEffect(() => {
        if (auth.autenticado) {
            navigate("/menu", { replace: true });
        }
    }, [auth.autenticado]);*/

    /**
     * Manejador de eventos del botón para iniciar sesión.
     */
    const manejadorBtnIniciarSesion = async () => {
        const { user } = auth.authInfo;

        if (user == null) {
            await auth.iniciarSesionGoogle().then((x) => {
                const res = (x.res == false) && (x.operacion == 0);
                if (res) {
                    navigate("/menu", { replace: true });
                }
            });
        } else {
            auth.reautenticarUsuario(user).then((x) => {
                const res = (x.res == false) && (x.operacion == 2);
                if (res) {
                    navigate("/menu", { replace: true });
                }
            });
        }
        setDesactivarBtn(true);
    };

    /**
     * Manejador de eventos del botón para cambiar tema.
     */
    const manejadorBtnCambiarTema = () => {
        setRecargarCaptcha(true);
        navegacion.cambiarTema();
        setTimeout(() => setRecargarCaptcha(false), 100);
    };

    /**
     * Activa o desactiva el botón de inicio de sesión basado en la respuesta de reCAPTCHA.
     * @param {String|null} token - Token de reCAPTCHA recibido al completar el desafío.
     */
    const manejadorReCAPTCHA = (token) => {
        const res = (typeof token == "string");
        setDesactivarBtn(!res);
    };

    return (
        <>
            {cargandoAuth ? (
                <Box alignItems="center" display="flex" justifyContent="center" height="100vh">
                    <CircularProgress />
                </Box>
            ) : (
                <Box display="flex" justifyContent="end" height={height}>
                    <Grid columns={12} spacing={1} container display="flex" alignItems="center" height="100%" width={width} padding="0vh 2vh" overflow="auto">
                        <Grid size={12} display="flex" justifyContent="end">
                            <IconButton aria-label="delete" onClick={manejadorBtnCambiarTema}>
                                <BtnTema />
                            </IconButton>
                        </Grid>
                        <Grid container size={12} alignItems="center">
                            <Grid size={3}>
                                <img src={logo} height="50px" width="50px" alt="derp" />
                            </Grid>
                            <Grid size={9}>
                                <Typography align="left" variant="h4" fontWeight="bold">
                                    Herramienta de Apoyo para el diagnóstico de TEP
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid size={12}>
                            <Typography align="left" variant="body1">
                                ¡Ingresa a la aplicación y utiliza nuestro modelo de apoyo para el diagnóstico de TEP
                                requiriendo unos cuentos datos de laboratorio!
                            </Typography>
                            <br />
                            <Typography align="left" variant="body1">
                                Cada diagnóstico realizado es una contribución a la recolección de datos para entrenar
                                mejores modelos. También puedes optar por realizar diagnósticos sin compartir los datos
                            </Typography>
                        </Grid>
                        <Grid size={12} display="flex" justifyContent="center">
                            {recargarCaptcha ? null : (
                                <ReCAPTCHA
                                    theme={temaCaptcha}
                                    onChange={manejadorReCAPTCHA}
                                    sitekey={reCAPTCHAApi}
                                    ref={CAPTCHA} />
                            )}
                        </Grid>
                        <Grid size={12} justifyContent="center" display="flex">
                            <Tooltip title="Ingresa a la aplicación con tu cuenta de Google">
                                <span style={{ width: "100%" }}>
                                    <Button
                                        startIcon={<GoogleIcon />}
                                        fullWidth
                                        onClick={manejadorBtnIniciarSesion}
                                        variant="contained"
                                        disabled={desactivarBtn}
                                        sx={{ textTransform: "none" }}>
                                        {auth.authInfo.user == null ? "Iniciar sesión" : "Ir a la aplicación"}
                                    </Button>
                                </span>
                            </Tooltip>
                        </Grid>
                        <Grid size={12}>
                            <Typography align="center" variant="body1" marginLeft="auto" marginRight="auto">
                                <b>¡Los datos de tus pacientes no se comparten con nosotros!</b>
                            </Typography>
                            <br />
                            <Typography align="left" variant="body1" marginLeft="auto" marginRight="auto">
                                ¿Necesitas ayuda? ¡consulta nuestro <Link href={URL_MANUAL_USUARIO}>manual de instrucciones</Link>!
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>)}

        </>
    );
};