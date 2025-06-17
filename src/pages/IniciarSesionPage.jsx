import { Box, Button, Grid, IconButton, Typography, CircularProgress, Dialog, DialogContent, DialogActions, DialogTitle } from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';
import ContrastIcon from '@mui/icons-material/Contrast';
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function IniciarSesionPage() {
    const auth = useAuth();
    const navigation = useNavigate();
    const [modal, setModal] = useState({
        mostrar: false, mensaje: ""
    });

    /**
     * Verifica la autenticación del usuario y redirige si ya está autenticado.
     */
    useEffect(() => {
        document.title = "Iniciar sesión - HADT";
        //auth.cerrarSesion(true);

        if (auth.tokenDrive != null) {
            navigation("/menu", { replace: true });
        }
    }, [auth, auth.tokenDrive, navigation]);

    /** 
     * Escucha y muestra los errores de autenticación que se presenten.
     */
    useEffect(() => {
        if (!auth.cargando && auth.authError.res) {
            setModal({ mostrar: true, mensaje: auth.authError.error });
        } else {
            setModal({ mostrar: false, mensaje: "" });
        }
    }, [auth, auth.cargando]);


    /**
     * Manejador de eventos del botón para iniciar sesión.
     */
    const manejadorBtnIniciarSesion = useCallback(async () => {
        await auth.iniciarSesionGoogle(true);
    }, [auth]);

    /**
     * Manejador de eventos del botón de cerrar el modal de error.
     */
    const manejadorBtnModal = useCallback(() => {
        setModal({ mostrar: false, mensaje: "" });
    }, [setModal]);

    /**
     * Manejador de eventos del botón para cambiar tema.
     */
    const manejadorBtnCambiarTema = useCallback(() => {
        console.log("presionado");
    }, []);

    return (
        <>
            {auth.cargando ? (
                <Box alignItems="center" display="flex" justifyContent="center" height="100vh">
                    <CircularProgress />
                </Box>
            ) : (
                <Box display="flex" justifyContent="end" height="98vh" bgcolor="black">
                    <Grid columns={12} spacing={1} container display="flex" alignItems="center" maxHeight="100%" maxWidth="60vh" bgcolor="white" paddingLeft="2vh" paddingRight="2vh" overflow="auto">
                        <Grid size={12} display="flex" justifyContent="end">
                            <IconButton aria-label="delete" onClick={manejadorBtnCambiarTema}>
                                <ContrastIcon />
                            </IconButton>
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
                        <Grid size={12} justifyContent="center" display="flex">
                            <Button
                                startIcon={<GoogleIcon />}
                                fullWidth
                                onClick={manejadorBtnIniciarSesion}
                                variant="contained"
                                sx={{ textTransform: "none" }}>
                                Iniciar sesión
                            </Button>
                        </Grid>
                        <Grid size={12}>
                            <Typography align="center" variant="body1" marginLeft="auto" marginRight="auto">
                                <b>¡Los datos de tus pacientes no se comparten con nosotros!</b>
                            </Typography>
                            <br />
                            <Typography align="left" variant="body1" marginLeft="auto" marginRight="auto">
                                ¡Necesitas ayuda? ¡consulta nuestro <a href="/manual">manual de instrucciones</a>!
                            </Typography>
                        </Grid>
                    </Grid>
                    <Dialog open={modal.mostrar}>
                        <DialogTitle>Error</DialogTitle>
                        <DialogContent>
                            <Typography>{modal.mensaje}</Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                type="submit"
                                variant="contained"
                                onClick={manejadorBtnModal}
                                sx={{ textTransform: "none" }}>
                                <b>Cerrar</b>
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>)}

        </>
    );
};