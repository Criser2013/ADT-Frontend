import { Box, CircularProgress, Toolbar } from "@mui/material";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { useEffect, useMemo } from "react";

/**
 * Layout que contiene la sidebar y la barra de navegación superior.
 * @param {children} Children - Contenido a renderizar dentro del layout del menú
 * @returns JSX.Element
 */
export default function MenuLayout({ children }) {
    const auth = useAuth();
    const navigate = useNavigate();
    const navegacion = useNavegacion();
    const height = useMemo(() => {
        return navegacion.dispositivoMovil ? "96vh" : "97.5vh";
    }, [navegacion.dispositivoMovil]);
    const margin = useMemo(() => {
        const { dispositivoMovil, orientacion } = navegacion;

        if (dispositivoMovil && orientacion == "vertical") {
            return "4vw";
        } else {
            return "1.9vw";
        }
    }, [navegacion.dispositivoMovil, navegacion.orientacion]);
    const marginMenu = useMemo(() => {
        const { dispositivoMovil, orientacion, mostrarMenu } = navegacion;
        if (dispositivoMovil && orientacion == "vertical") {
            return "0px";
        } else if (orientacion == "horizontal" && mostrarMenu) {
            return "240px";
        }
    }, [navegacion.dispositivoMovil, navegacion.mostrarMenu, navegacion.orientacion]);
    const width = useMemo(() => {
        const { dispositivoMovil, orientacion, mostrarMenu } = navegacion;
        if ((!dispositivoMovil && !mostrarMenu)|| (dispositivoMovil && orientacion == "vertical")) {
            return "100vw";
        } else if (orientacion == "horizontal" && mostrarMenu) {
            return "calc(100vw - 240px)";
        }
    }, [navegacion.dispositivoMovil, navegacion.mostrarMenu, navegacion.orientacion]);

    /**
     * Si hay algún error de autenticación, muestra un modal con el mensaje de error y al cerrarlo
     * redirige a la página de inicio.
     */
    useEffect(() => {
        navegacion.setCallbackError({
            fn: () => {
                navigate("/", { replace: true });
            }
        });
    }, []);

    return (
        <>
            {auth.cargando ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={height}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box width={width} marginLeft={marginMenu}>
                    <NavBar />
                    <Sidebar />
                    <Box component="main" sx={{ padding: `2vh ${margin}`}}>
                        <Toolbar />
                        {children}
                    </Box>
                </Box>)}
        </>
    );
}