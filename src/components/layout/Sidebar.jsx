import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import { DiagnosticoIcono, DiagAnonimoIcono, HistDiagnosticoIcono, ListPacienteIcono } from "../icons/IconosSidebar";
import { detAbrirMenu } from "../../utils/Responsividad";

/**
 * Menú de navegación lateral de la aplicación.
 * @returns JSX.Element
 */
export default function Sidebar() {
    const navegacion = useNavegacion();
    const navigate = useNavigate();

    /**
     * Manejador de cierre del menú lateral. Se utiliza en
     * dispositivos móviles.
     */
    const manejadorCerrarMenu = () => {
        navegacion.setCerrandoMenu(true);
        navegacion.setMostrarMenu(false);
    };

    /**
     * Manejador de transición de cierre del menú lateral. Se utiliza
     * en dispositivos móviles.
     */
    const manejadorTranscionCerrar = () => {
        navegacion.setCerrandoMenu(false);
    };

    /**
     * Manejador de clic en los elementos del menú lateral.
     * Redirecciona al usuario a la ruta correspondiente.
     * @param {int} id - ID de la ruta
     */
    const manejadorClicMenu = (id) => {
        switch (id) {
            case 0:
                navegacion.setPaginaAnterior(window.location.pathname);
                navigate("/menu-principal", { replace: true });
                break;
            case 1:
                navegacion.setPaginaAnterior(window.location.pathname);
                navigate("/pacientes", { replace: true });
                break;
            case 2:
                navegacion.setPaginaAnterior(window.location.pathname);
                navigate("/diagnostico-paciente", { replace: true });
                break;
            case 3:
                navegacion.setPaginaAnterior(window.location.pathname);
                navigate("/diagnostico-anonimo", { replace: true });
                break;
            case 4:
                navegacion.setPaginaAnterior(window.location.pathname);
                navigate("/diagnosticos", { replace: true });
                break;
        }
    };

    return (
        <Drawer
            variant={navegacion.variantSidebar}
            open={navegacion.mostrarMenu}
            onClose={manejadorCerrarMenu}
            onTransitionEnd={manejadorTranscionCerrar}
            sx={{
                // Se encarga de cerrar el menú en tablets o computadores. No se usa en móviles.
                display: (detAbrirMenu(navegacion.mostrarMenu, navegacion.dispositivoMovil, navegacion.orientacion)) ? "none" : "block",
                width: 240,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
            }}
            anchor="left">
            <Toolbar />
            <Box sx={{ overflow: "auto" }}>
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => manejadorClicMenu(0)}>
                            <ListItemIcon>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText primary="Menú principal" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => manejadorClicMenu(1)}>
                            <ListItemIcon>
                                <ListPacienteIcono />
                            </ListItemIcon>
                            <ListItemText primary="Pacientes" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => manejadorClicMenu(2)}>
                            <ListItemIcon>
                                <DiagnosticoIcono />
                            </ListItemIcon>
                            <ListItemText primary="Diagnosticar paciente" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => manejadorClicMenu(3)}>
                            <ListItemIcon>
                                <DiagAnonimoIcono />
                            </ListItemIcon>
                            <ListItemText primary="Diagnóstico anónimo" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => manejadorClicMenu(4)}>
                            <ListItemIcon>
                                <HistDiagnosticoIcono />
                            </ListItemIcon>
                            <ListItemText primary="Historial de diagnósticos" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        </Drawer>
    );
}