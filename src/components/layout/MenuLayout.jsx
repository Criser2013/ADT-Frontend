import { Box, Toolbar } from "@mui/material";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";

/**
 * Layout que contiene la sidebar y la barra de navegación superior.
 * @param {children} Children - Contenido a renderizar dentro del layout del menú
 * @returns JSX.Element
 */
export default function MenuLayout({ children }) {
    return (
        <Box display="flex">
            <NavBar />
            <Sidebar />
            <Box component="main" sx={{ padding: "2vh 2vh" }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}