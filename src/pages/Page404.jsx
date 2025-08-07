import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

/**
 * Página 404 de la aplicación.
 * @returns {JSX.Element}
 */
export default function Page404() {
    const auth = useAuth();
    const navigate = useNavigate();

    /**
     * Manejador de eventos del botón para redirigir al usuario a la página principal.
     */
    const manejadorBtn = () => {
        const { uid } = auth.authInfo;
        let url = (uid != null) ? "/menu" : "/";
        navigate(url, { replace: true });
    };

    return (
        <Box width="100%" height="96vh" display="flex" justifyContent="center" alignItems="center">
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
        </Box>
    );
};