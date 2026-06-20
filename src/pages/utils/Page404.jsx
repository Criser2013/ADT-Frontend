import { Box, Button, Paper, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useMemo } from "react";
import { useNavegacion } from "../../contexts/NavegacionContext";
import fondoClaro from "../../assets/fondos/fondo_claro.png";
import fondoOscuro from "../../assets/fondos/fondo_oscuro.png";
import { useTranslation } from "react-i18next";

/**
 * Página 404 de la aplicación.
 * @returns {JSX.Element}
 */
export default function Page404() {
    const { cargando , usuario } = useAuth();
    const { t } = useTranslation();
    const navegacion = useNavegacion();
    const navigate = useNavigate();
    const cargandoAuth = useMemo(() => {
        return usuario === null ? false : cargando;
    }, [usuario, cargando]);
    const fondoImg = useMemo(() => {
            return navegacion.tema === "light" ? fondoClaro : fondoOscuro;
        }, [navegacion.tema]);

    useEffect(() => {
        document.title = `${t("tit404")}`;
    }, [navegacion.idioma]);

    /**
     * Manejador de eventos del botón para redirigir al usuario a la página principal.
     */
    const manejadorBtn = () => {
        const { uid } = usuario;
        let url = (uid != null) ? "/menu" : "/";
        
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