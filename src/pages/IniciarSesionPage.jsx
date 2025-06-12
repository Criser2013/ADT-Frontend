import { Box, Button, Grid, IconButton, Typography } from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';
import ContrastIcon from '@mui/icons-material/Contrast';
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCredentials } from "../contexts/CredentialsContext";

export default function IniciarSesionPage() {
    const auth = useAuth();
    const credentials = useCredentials();

    useEffect(() => {
        auth.setAuth(credentials.obtenerInstanciaAuth());
        auth.setDb(credentials.obtenerInstanciaDB());
    }, [credentials.obtenerInstanciaAuth()]);


    return (
        <Box display="flex" justifyContent="end" height="98vh" bgcolor="black">
            <Grid columns={12} spacing={1} container display="flex" alignItems="center" maxHeight="100%" maxWidth="60vh" bgcolor="white" paddingLeft="2vh" paddingRight="2vh" overflow="auto">
                <Grid size={12} display="flex" justifyContent="end">
                    <IconButton aria-label="delete">
                        <ContrastIcon />
                    </IconButton>
                </Grid>
                <Grid container size={12} alignItems="center">
                    <Grid size={3}>
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpm7h3wcfXJQvtxNkG6r5N--9DbneABGXkbQ&s"
                            height="50px" width="50px" alt="derp" />
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
                        variant="contained"
                        sx={{
                            textTransform: "none",
                        }}>
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
        </Box>
    );
};