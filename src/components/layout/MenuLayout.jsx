import MenuContext from "../../contexts/MenuContext";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";
import { useAuth } from "../../hooks";
import { useState } from "react";
import { Box, CircularProgress, Toolbar } from "@mui/material";


/**
 * Layout que contiene la sidebar y la barra de navegación superior.
 * @param {children} Children - Contenido a renderizar dentro del layout del menú
 * @returns {JSX.Element}
 */
export default function MenuLayout({ children }) {
    const { cargando } = useAuth();
    const [mostrarMenu, setMostrarMenu] = useState(false);

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
                        xs: "100vw", md: mostrarMenu ? "100vw" : `calc(100vw - 240px)`,
                    }}
                    marginLeft={{
                        xs: "0px", md: mostrarMenu ? "240px" : "0px"
                    }}>
                    <NavBar />
                    <Sidebar />
                    <Box component="main"
                        sx={{ 
                            paddingVertical: "2vh", paddingHorizontal: {
                                xs: "4vw", md: "1.9vw"
                                }}}>
                        <Toolbar />
                        {children}
                    </Box>
                </Box>)}
        </MenuContext>
    );
}