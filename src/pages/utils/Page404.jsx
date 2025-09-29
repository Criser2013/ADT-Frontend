import { Box, Button, Paper, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useMemo } from "react";
import { useNavegacion } from "../../contexts/NavegacionContext";
import fondoClaro from "../../assets/fondos/fondo_claro.png";
import fondoOscuro from "../../assets/fondos/fondo_oscuro.png";

/**
 * Página 404 de la aplicación.
 * @returns {JSX.Element}
 */
export default function Page404() {
    const auth = useAuth();
    const navegacion = useNavegacion();
    const navigate = useNavigate();
    const cargandoAuth = useMemo(() => {
        return auth.authInfo.user == null ? false : auth.cargando;
    }, [auth.authInfo, auth.cargando]);
    const fondoImg = useMemo(() => {
            return navegacion.tema === "light" ? fondoClaro : fondoOscuro;
        }, [navegacion.tema]);

    useEffect(() => {
        document.title = "Página no encontrada - 404";
    }, []);

    /**
     * Manejador de eventos del botón para redirigir al usuario a la página principal.
     */
    const manejadorBtn = () => {
        const { uid } = auth.authInfo;
        let url = (uid != null) ? "/menu" : "/";
        if (url == "/") {
            auth.quitarPantallaCarga();
        }
        navigate(url, { replace: true });
    };

    return (
        cargandoAuth ? (
            <Box alignItems="center" display="flex" justifyContent="center" height="100vh">
                <CircularProgress />
            </Box>
        ) : (
            <Box width="100%" height="100vh" display="flex" justifyContent="center" alignItems="center" sx={{ backgroundImage: `url(${fondoImg})`, backgroundSize: "cover" }}>
                <Paper sx={{ padding: "6vh" }}>
                    <Typography variant="h3" align="center">
                        ¡Página no encontrada!
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
                        <b>Volver a la página principal</b>
                    </Button>
                </Paper>
            </Box>)
    );
};