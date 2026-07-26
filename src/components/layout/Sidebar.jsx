import HomeIcon from "@mui/icons-material/Home";
import MenuContext from "../../contexts/MenuContext";
import PeopleIcon from '@mui/icons-material/People';
import {
    Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Toolbar, useMediaQuery
} from "@mui/material";
import {
    DiagnosticoIcono, DiagAnonimoIcono, HistDiagnosticoIcono, ListPacienteIcono,
    DatosIcono
} from "../icons/IconosSidebar";
import { useAuth } from "../../hooks";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";


/**
 * Menú de navegación lateral de las pestañas de autenticación.
 * @returns {JSX.Element}
 */
export default function Sidebar() {
    const navigate = useNavigate();
    const theme = useTheme();
    const { usuario } = useAuth();
    const { t } = useTranslation();
    const { mostrarMenu, setMostrarMenu } = useContext(MenuContext);
    const urlUsuarios = [
        { txt: t("titMenu"), icono: <HomeIcon />, ruta: "/menu" },
        { txt: t("txtPacientes"), icono: <ListPacienteIcono />, ruta: "/pacientes" },
        { txt: t("titDiagnosticoPaciente"), icono: <DiagnosticoIcono />, ruta: "/diagnosticos/paciente" },
        { txt: t("titDiagnosticoAnonimo"), icono: <DiagAnonimoIcono />, ruta: "/diagnosticos/anonimo" },
        { txt: t("txtHistorialDiagnosticos"), icono: <HistDiagnosticoIcono />, ruta: "/diagnosticos" },
    ];
    const urlAdmin = [
        { txt: t("titMenu"), icono: <HomeIcon />, ruta: "/menu" },
        { txt: t("txtDatosRecolectados"), icono: <DatosIcono />, ruta: "/diagnosticos" },
        { txt: t("txtUsuarios"), icono: <PeopleIcon />, ruta: "/usuarios" },
    ];
    const filas = usuario?.rolVisible ? urlAdmin : urlUsuarios;
    const escritorio = useMediaQuery(theme.breakpoints.up("md"));

    useEffect(() => {
        setMostrarMenu(escritorio);
    }, [escritorio, setMostrarMenu]);

    /**
     * @param {String} url Ruta a la que se redirige al usuario.
     */
    function manejadorClicMenu(url) {
        setMostrarMenu(false);
        navigate(url);
    };

    return (
        <Drawer
            variant={escritorio ? "persistent" : "temporary"}
            open={mostrarMenu}
            onClose={() => setMostrarMenu(false)}
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