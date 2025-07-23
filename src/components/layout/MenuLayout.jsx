import { Box, CircularProgress, Toolbar } from "@mui/material";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { useEffect } from "react";

/**
 * Layout que contiene la sidebar y la barra de navegación superior.
 * @param {children} Children - Contenido a renderizar dentro del layout del menú
 * @returns JSX.Element
 */
export default function MenuLayout({ children }) {
    const auth = useAuth();
    const navigate = useNavigate();
    const navegacion = useNavegacion();

    /**
     * Si hay algún error de autenticación, muestra un modal con el mensaje de error y al cerrarlo
     * redirige a la página de inicio.
     */
    useEffect(() => {
        navegacion.setCallbackError({
            fn: () => {
                navigate("/");
            }
        });
    }, []);

    return (
        <>
            {auth.cargando ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="98vh">
                    <CircularProgress />
                </Box>
            ) : (
                <Box display="flex">
                    <NavBar />
                    <Sidebar />
                    <Box component="main" sx={{ padding: "2vh 1vh" }}>
                        <Toolbar />
                        {children}
                    </Box>
                </Box>)}
        </>
    );
}