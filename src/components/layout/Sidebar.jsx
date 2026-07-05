import HomeIcon from "@mui/icons-material/Home";
import MenuContext from "../../contexts/MenuContext";
import PeopleIcon from '@mui/icons-material/People';
import {
    Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Toolbar
} from "@mui/material";
import {
    DiagnosticoIcono, DiagAnonimoIcono, HistDiagnosticoIcono, ListPacienteIcono,
    DatosIcono
} from "../icons/IconosSidebar";
import { useAuth } from "../../contexts/AuthContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";


/**
 * Menú de navegación lateral de las pestañas de autenticación.
 * @returns {JSX.Element}
 */
export default function Sidebar() {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const { t } = useTranslation();
    const { mostrarMenu, setMostrarMenu } = useContext(MenuContext);
    const urlUsuarios = [
        { txt: t("titMenu"), icono: <HomeIcon />, ruta: "/menu" },
        { txt: t("txtPacientes"), icono: <ListPacienteIcono />, ruta: "/pacientes" },
        { txt: t("titDiagnosticoPaciente"), icono: <DiagnosticoIcono />, ruta: "/diagnostico-paciente" },
        { txt: t("titDiagnosticoAnonimo"), icono: <DiagAnonimoIcono />, ruta: "/diagnostico-anonimo" },
        { txt: t("txtHistorialDiagnosticos"), icono: <HistDiagnosticoIcono />, ruta: "/diagnosticos" },
    ];
    const urlAdmin = [
        { txt: t("titMenu"), icono: <HomeIcon />, ruta: "/menu" },
        { txt: t("txtDatosRecolectados"), icono: <DatosIcono />, ruta: "/diagnosticos" },
        { txt: t("txtUsuarios"), icono: <PeopleIcon />, ruta: "/usuarios" },
    ];
    const filas = usuario.rolVisible ? urlAdmin : urlUsuarios;

    function manejadorCerrarMenu() {
        setMostrarMenu(false);
    };

    /**
     * @param {String} url Ruta a la que se redirige al usuario.
     */
    function manejadorClicMenu(url) {
        setMostrarMenu(false);
        navigate(url);
    };

    return (
        <Drawer
            variant={{
                xs: "temporary", sm: "temporary", md: "temporary",
                lg: "permanent", xl: "permanent"
            }}
            open={mostrarMenu}
            onClose={manejadorCerrarMenu}
            sx={{
                // Se encarga de cerrar el menú en tablets o computadores. No se usa en móviles.
                display: mostrarMenu, width: 240, flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
            }}
            anchor="left">
            <Toolbar />
            <Box sx={{ overflow: "auto" }}>
                <List>
                    {filas.map((x) => (
                        <ListItem key={x.txt} disablePadding>
                            <ListItemButton onClick={() => manejadorClicMenu(x.ruta)}>
                                <ListItemIcon>
                                    {x.icono}
                                </ListItemIcon>
                                <ListItemText primary={x.txt} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
};