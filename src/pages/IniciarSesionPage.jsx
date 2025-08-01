import { Box, Button, Grid, IconButton, Typography, CircularProgress, Link, Tooltip } from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';
import ContrastIcon from '@mui/icons-material/Contrast';
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useNavegacion } from "../contexts/NavegacionContext";
import { useCredenciales } from "../contexts/CredencialesContext";
import ReCAPTCHA from "react-google-recaptcha";

/**
 * Página de inicio de sesión que permite a los usuarios acceder a la aplicación.
 * Si el usuario ya está autenticado, se redirige automáticamente al menú principal.
 * @returns JSX.Element
 */
export default function IniciarSesionPage() {
    const auth = useAuth();
    const navigation = useNavigate();
    const navegacion = useNavegacion();
    const credenciales = useCredenciales();
    const CAPTCHA = useRef(null);
    const [desactivarBtn, setDesactivarBtn] = useState(true);
    const width = useMemo(() => {
        const { dispositivoMovil, orientacion } = navegacion;
        if (!dispositivoMovil) {
            return "60vh";
        } else if (dispositivoMovil && orientacion == "vertical") {
            return "100vh";
        } else {
            return "90vh";
        }
    }, [navegacion.dispositivoMovil, navegacion.orientacion]);
    const height = useMemo(() => {
        return navegacion.dispositivoMovil ? "96vh" : "97.5vh";
    },[navegacion.dispositivoMovil]);
    const reCAPTCHAApi = useMemo(() => {
        return credenciales.obtenerRecaptcha();
    }, [credenciales.obtenerRecaptcha()]);

    /**
     * Verifica la autenticación del usuario y redirige si ya está autenticado.
     */
    useEffect(() => {
        document.title = "Iniciar sesión - HADT";
        navegacion.setPaginaAnterior("");

        if (auth.tokenDrive != null) {
            navigation("/menu", { replace: true });
        }
    }, [auth.tokenDrive]);

    /**
     * Manejador de eventos del botón para iniciar sesión.
     */
    const manejadorBtnIniciarSesion = async () => {
        const { user } = auth.authInfo;

        if (user == null) {
            await auth.iniciarSesionGoogle();
        } else {
            await auth.reautenticarUsuario(user);
        }
    };

    /**
     * Manejador de eventos del botón para cambiar tema.
     */
    const manejadorBtnCambiarTema = () => {
        console.log("presionado");
    };

    /**
     * Activa o desactiva el botón de inicio de sesión basado en la respuesta de reCAPTCHA.
     * @param {String|null} token - Token de reCAPTCHA recibido al completar el desafío.
     */
    const manejadorReCAPTCHA = (token) => {
        setDesactivarBtn(!(typeof token == "string"));
    };

    return (
        <>
            {auth.cargando ? (
                <Box alignItems="center" display="flex" justifyContent="center" height="100vh">
                    <CircularProgress />
                </Box>
            ) : (
                <Box display="flex" justifyContent="end" height={height} bgcolor="black">
                    <Grid columns={12} spacing={1} container display="flex" alignItems="center" height="100%" width={width} bgcolor="white" padding="0vh 2vh" overflow="auto">
                        <Grid size={12} display="flex" justifyContent="end">
                            <Tooltip title="Cambiar tema">
                                <IconButton aria-label="delete" onClick={manejadorBtnCambiarTema}>
                                    <ContrastIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid container size={12} alignItems="center">
                            <Grid size={3}>
                                <img src={logo} height="50px" width="50px" alt="derp" />
                            </Grid>
                            <Grid size={9}>
                                <Typography align="left" variant="h4" color="primary">
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
                            <ReCAPTCHA
                                onChange={manejadorReCAPTCHA}
                                sitekey={reCAPTCHAApi}
                                ref={CAPTCHA} />
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
                                ¿Necesitas ayuda? ¡consulta nuestro <Link href="/manual">manual de instrucciones</Link>!
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>)}

        </>
    );
};