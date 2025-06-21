import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import { useNavegacion } from "../contexts/NavegacionContext";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import DiagnosticoIcono from "./icons/DiagnosticoIcono";
import ListaPacientesIcono from "./icons/ListaPacientesIcono";
import DiagAnonIcono from "./icons/DiagnAnonIcono";
import HistorialDiagIcono from "./icons/HistorialDiagIcono";

export default function Sidebar() {
    const navegacion = useNavegacion();
    const navigate = useNavigate();

    const manejadorCerrarMenu = () => {
        navegacion.setCerrandoMenu(true);
        navegacion.setMostrarMenu(false);
    };

    const manejadorTranscionCerrar = () => {
        navegacion.setCerrandoMenu(false);
    };

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
                navigate("/diagnosticar-paciente", { replace: true });
                break;
            case 3:
                navegacion.setPaginaAnterior(window.location.pathname);
                navigate("/diagnostico-anonimo", { replace: true });
                break;
            case 4:
                navegacion.setPaginaAnterior(window.location.pathname);
                navigate("/historial-diagnosticos", { replace: true });
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
                display: (!navegacion.mostrarMenu && !navegacion.dispositivoMovil) ? "none" : "block",
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
                                <ListaPacientesIcono />
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
                                <DiagAnonIcono />
                            </ListItemIcon>
                            <ListItemText primary="Diagnóstico anónimo" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => manejadorClicMenu(4)}>
                            <ListItemIcon>
                                <HistorialDiagIcono color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="Historial de diagnósticos" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        </Drawer>
    );
}