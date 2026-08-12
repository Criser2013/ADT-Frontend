import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Box, CircularProgress, Toolbar } from "@mui/material";
import { useAuth } from "../../hooks";
import { useState } from "react";


/**
 * Layout que contiene la sidebar y la barra de navegación superior.
 * @param {children} Children Contenido a renderizar dentro del layout del menú
 * @returns {JSX.Element}
 */
export default function MenuLayout({ children }) {
    const { cargando } = useAuth();
    const [mostrarMenu, setMostrarMenu] = useState(false);

    return (
        <>
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
                    <Navbar mostrarMenu={mostrarMenu} setMostrarMenu={setMostrarMenu} />
                    <Sidebar mostrarMenu={mostrarMenu} setMostrarMenu={setMostrarMenu} />
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
        </>
    );
}