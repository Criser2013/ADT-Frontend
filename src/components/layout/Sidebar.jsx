import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import { DiagnosticoIcono, DiagAnonimoIcono, HistDiagnosticoIcono, ListPacienteIcono, DatosIcono } from "../icons/IconosSidebar";
import { detAbrirMenu } from "../../utils/Responsividad";
import { useAuth } from "../../contexts/AuthContext";
import PeopleIcon from '@mui/icons-material/People';
import { useMemo } from "react";
import { CODIGO_ADMIN } from "../../../constants";
import { useTranslation } from "react-i18next";

/**
 * Menú de navegación lateral de la aplicación.
 * @returns {JSX.Element}
 */
export default function Sidebar() {
    const navegacion = useNavegacion();
    const navigate = useNavigate();
    const auth = useAuth();
    const { t } = useTranslation();
    const filas = useMemo(() => {
        const { rolVisible, modoUsuario } = auth.authInfo;
        const usuario = [
            { txt: t("titMenu"), icono: <HomeIcon />, ruta: "/menu" },
            { txt: t("txtPacientes"), icono: <ListPacienteIcono />, ruta: "/pacientes" },
            { txt: t("titDiagnosticoPaciente"), icono: <DiagnosticoIcono />, ruta: "/diagnostico-paciente" },
            { txt: t("titDiagnosticoAnonimo"), icono: <DiagAnonimoIcono />, ruta: "/diagnostico-anonimo" },
            { txt: t("txtHistorialDiagnosticos"), icono: <HistDiagnosticoIcono />, ruta: "/diagnosticos" },
        ];
        const admin = [
            { txt: t("titMenu"), icono: <HomeIcon />, ruta: "/menu" },
            { txt: t("txtDatosRecolectados"), icono: <DatosIcono />, ruta: "/diagnosticos" },
            { txt: t("txtUsuarios"), icono: <PeopleIcon />, ruta: "/usuarios" },
        ];

        if (rolVisible != null && (rolVisible != CODIGO_ADMIN || modoUsuario)) {
            return usuario;
        } else if (rolVisible != null && rolVisible == CODIGO_ADMIN && !modoUsuario) {
            return admin;
        } else {
            return usuario;
        }
    }, [auth.authInfo]);
    const mostrarMenu = useMemo(() => {
        return detAbrirMenu(navegacion.mostrarMenu, navegacion.dispositivoMovil, navegacion.orientacion) ? "none" : "block";
    }, [navegacion.mostrarMenu, navegacion.dispositivoMovil, navegacion.orientacion]);


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
     * @param {String} url - Ruta a la que se redirige al usuario.
     */
    const manejadorClicMenu = (url) => {
        navegacion.setPaginaAnterior(window.location.pathname);
        navigate(url);

        if (navegacion.variantSidebar == "temporary") {
            navegacion.setMostrarMenu(false);
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
                display: mostrarMenu, width: 240, flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
            }}
            anchor="left">
            <Toolbar />
            <Box sx={{ overflow: "auto" }}>
                <List>
                    {filas.map((x) => {
                        return (
                            <ListItem key={x.txt} disablePadding>
                                <ListItemButton onClick={() => manejadorClicMenu(x.ruta)}>
                                    <ListItemIcon>
                                        {x.icono}
                                    </ListItemIcon>
                                    <ListItemText primary={x.txt} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>
        </Drawer>
    );
};