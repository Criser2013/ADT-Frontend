import MenuContext from "../../contexts/MenuContext";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";
import { useAuth } from "../../hooks";
import { useState } from "react";
import { Box, CircularProgress, Toolbar, useTheme, useMediaQuery } from "@mui/material";


/**
 * Layout que contiene la sidebar y la barra de navegación superior.
 * @param {children} Children - Contenido a renderizar dentro del layout del menú
 * @returns {JSX.Element}
 */
export default function MenuLayout({ children }) {
    const theme = useTheme();
    const escritorio = useMediaQuery(theme.breakpoints.up("md"));
    const { cargando } = useAuth();
    const [mostrarMenu, setMostrarMenu] = useState(escritorio);

    return (
        <MenuContext value={{ mostrarMenu, setMostrarMenu }}>
            {cargando ? (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height={{ xs: "96vh", md: "97.5vh" }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box
                    width={{
                        xs: "99vw", md: mostrarMenu ? `calc(99vw - 240px)` : "99vw"
                    }}
                    marginLeft={{
                        xs: "0px", md: mostrarMenu ? "240px" : "0px"
                    }}>
                    <NavBar />
                    <Sidebar />
                    <Box component="main"
                        sx={{
                            paddingTop: "2vh",
                            paddingLeft: { xs: "4vw", md: "1.9vw" },
                            paddingRight: { xs: "4vw", md: "1.9vw" }
                        }}>
                        <Toolbar />
                        {children}
                    </Box>
                </Box>)}
        </MenuContext>
    );
}