import { Box, Button, Grid, IconButton, Typography, CircularProgress, Link, Tooltip, Paper } from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { useCredenciales } from "../../contexts/CredencialesContext";
import ReCAPTCHA from "react-google-recaptcha";
import BtnTema from "../../components/layout/BtnTema";
import { URL_CONDICIONES, URL_MANUAL_USUARIO } from "../../../constants";
import fondoClaro from "../../assets/fondo_claro.png";
import fondoOscuro from "../../assets/fondo_oscuro.png";
import icono from "../../assets/icono.png";
import ModalSimple from "../../components/modals/ModalSimple";
import CloseIcon from "@mui/icons-material/Close";
import Check from "../../components/tabs/Check";
import { peticionApi } from "../../services/Api";

/**
 * Página de inicio de sesión que permite a los usuarios acceder a la aplicación.
 * Si el usuario ya está autenticado, se redirige automáticamente al menú principal.
 * @returns {JSX.Element}
 */
export default function IniciarSesionPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    const navegacion = useNavegacion();
    const credenciales = useCredenciales();
    const CAPTCHA = useRef(null);
    const [desactivarBtn, setDesactivarBtn] = useState(true);
    const [cargandoBtn, setCargandoBtn] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [captchaAceptado, setCaptchaAceptado] = useState(false);
    const [terminosAceptados, setTerminosAceptados] = useState(false);
    const [modal, setModal] = useState({
        mensaje: "", mostrar: false
    });
    const cargandoAuth = useMemo(() => {
        return auth.cargando || !credenciales.verSiCredsFirebaseEstancargadas();
    }, [auth.cargando, credenciales.verSiCredsFirebaseEstancargadas]);
    const width = useMemo(() => {
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
    }, [navegacion]);
    const centrar = useMemo(() => {
        const { dispositivoMovil, orientacion, alto } = navegacion;
        if ((!dispositivoMovil && (alto >= 800)) || (dispositivoMovil && (orientacion == "vertical"))) {
            return "center";
        } else {
            return null;
        }
    }, [navegacion]);
    const temaCaptcha = useMemo(() => navegacion.tema, [navegacion.tema]);
    const fondoImg = useMemo(() => {
        return temaCaptcha === "light" ? fondoClaro : fondoOscuro;
    }, [temaCaptcha]);
    const reCAPTCHAApi = useMemo(() => {
        return credenciales.obtenerRecaptcha();
    }, [credenciales.obtenerRecaptcha]);

    /**
     * Verifica la autenticación del usuario y redirige si ya está autenticado.
     */
    useEffect(() => {
        document.title = "Iniciar sesión - HADT";
        navegacion.setPaginaAnterior("");
    }, []);

    useEffect(() => {
        setDesactivarBtn(!(captchaAceptado && terminosAceptados));
    }, [captchaAceptado, terminosAceptados]);

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
        setCargando(true);
        navegacion.cambiarTema();
        setTimeout(() => {
            setTerminosAceptados(false);
            setDesactivarBtn(true);
            setCargando(false);
        }, 100);
    };

    /**
     * Activa o desactiva el botón de inicio de sesión basado en la respuesta de reCAPTCHA.
     * @param {String|null} token - Token de reCAPTCHA recibido al completar el desafío.
     */
    const manejadorReCAPTCHA = async (token) => {
        const res = (typeof token == "string");
        if (res) {
            verificarRespuesta(token);
        } else {
            setCaptchaAceptado(false);
            //setDesactivarBtn(true);
        }
    };

    /**
     * Comprueba que la respuesta de reCAPTCHA sea que un usuario es un humano.
     * @param {string} token - Token de ReCAPTCHA
     */
    const verificarRespuesta = async (token) => {
        setCargandoBtn(true);
        const res = await peticionApi("", "recaptcha", "POST", { token: token }, "Se ha producido un error al verificar el CAPTCHA. Reintentalo nuevamente.");

        if (res.success) {
            if (res.data.success) {
                setCaptchaAceptado(true);
                //setDesactivarBtn(false);
            } else {
                setModal({ 
                    mostrar: true, titulo: "❌ Error",
                    mensaje: "No se ha podido comprobar que seas un humano. Reintenta el CAPTCHA nuevamente."
                });
                CAPTCHA.current.reset();
            }
        } else {
            let txtError = res.error;
            if (typeof res.error != "string") {
                for (const i of res.error) {
                    txtError += `${i} `;
                }
            }
            CAPTCHA.current.reset();
            setModal({ titulo: "❌ Error", mostrar: true, mensaje: txtError });
        }
        setCargandoBtn(false);
    };

    /**
     * Manejador del botón para cerrar el modal.
     */
    const manejadorBtnModal = () => {
        setModal((x) => ({ ...x, mostrar: false }));
    };

    return (
        <>
            {(cargando || cargandoAuth) ? (
                <Box alignItems="center" display="flex" justifyContent="center" height="100vh">
                    <CircularProgress />
                </Box>
            ) : (
                <Box display="flex" justifyContent="end" alignItems="center" height="100vh" sx={{ backgroundImage: `url(${fondoImg})`, backgroundSize: "cover" }}>
                    <Paper sx={{ width: width, padding: "4vh", overflow: "auto", height: "100%", display: "flex", alignItems: centrar }}>
                        <Grid columns={12} spacing={2} container>
                            <Grid size={12} display="flex" justifyContent="end">
                                <IconButton aria-label="delete" onClick={manejadorBtnCambiarTema} size="large">
                                    <BtnTema />
                                </IconButton>
                            </Grid>
                            <Grid container columnSpacing="20px" columns={12} alignItems="center">
                                <Grid size={3}>
                                    <img src={icono} height="90vh" width="90vh" alt="derp" />
                                </Grid>
                                <Grid size={9}>
                                    <Typography align="left" variant="h4" fontWeight="bold">
                                        Herramienta de Apoyo para el diagnóstico de TEP
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid container columns={1} spacing={2} size={12}>
                                <Grid size={1}>
                                    <Typography align="left" variant="body1">
                                        ¡Ingresa a la aplicación y utiliza nuestro modelo de apoyo para el diagnóstico de TEP
                                        requiriendo unos cuantos datos de laboratorio!
                                    </Typography>
                                </Grid>
                                <Grid size={1}>
                                    <Typography align="left" variant="body1">
                                        Cada diagnóstico realizado es una contribución a la recolección de datos para entrenar
                                        mejores modelos
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid size={12} display="flex" justifyContent="center">
                                <ReCAPTCHA
                                    theme={temaCaptcha}
                                    onChange={manejadorReCAPTCHA}
                                    sitekey={reCAPTCHAApi}
                                    ref={CAPTCHA} />
                            </Grid>
                            {!auth.autenticado ? (
                                <Grid size={12} display="flex" justifyContent="left">
                                 <Check
                                    activado={terminosAceptados}
                                    manejadorCambios={(e) => setTerminosAceptados(e.target.checked)}
                                    etiqueta={
                                        <>
                                        He leido y acepto la&nbsp;
                                            <Link target="_blank" href={URL_CONDICIONES}>política de privacidad</Link>
                                        .
                                        </>}/>
                            </Grid>) : null}
                            <Grid size={12} justifyContent="center" display="flex">
                                <Tooltip title="Ingresa a la aplicación con tu cuenta de Google">
                                    <span style={{ width: "100%" }}>
                                        <Button
                                            startIcon={<GoogleIcon fontSize="large" />}
                                            fullWidth
                                            onClick={manejadorBtnIniciarSesion}
                                            variant="contained"
                                            disabled={desactivarBtn}
                                            loading={cargandoBtn}
                                            loadingPosition="end"
                                            sx={{ textTransform: "none" }}>
                                            {auth.autenticado ? "Ir a la aplicación" : "Iniciar sesión"}
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Grid>
                            <Grid size={12}>
                                <Typography align="center" variant="body1" marginLeft="auto" marginRight="auto">
                                    <b>¡Los datos de tus pacientes no se comparten con nosotros!</b>
                                </Typography>
                                <br />
                                <Typography align="center" variant="body1" marginLeft="auto" marginRight="auto">
                                    ¿Necesitas ayuda? ¡consulta nuestro <Link target="_blank" href={URL_MANUAL_USUARIO}>manual de instrucciones</Link>!
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                    <ModalSimple
                        abrir={modal.mostrar}
                        titulo={"❌ Error"}
                        mensaje={modal.mensaje}
                        txtBtn="Cerrar"
                        iconoBtn={<CloseIcon />}
                        manejadorBtnModal={manejadorBtnModal}
                    />
                </Box>)}

        </>
    );
};