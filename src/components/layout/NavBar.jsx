import { AppBar, Avatar, IconButton, Popover, Tooltip, Typography, Toolbar, Box, MenuItem, Divider, Stack } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router";
import { useNavegacion } from "../../hooks/Navegacion";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { BtnTema } from "../layout";
import LogoutIcon from '@mui/icons-material/Logout';
import { URL_MANUAL_ADMIN, URL_MANUAL_USUARIO } from "../../constants";
import ArticleIcon from '@mui/icons-material/Article';
import SwitchLabel from "../tabs/SwitchLabel";
import { useTranslation } from "react-i18next";
import SelectIdioma from "../tabs/SelectIdioma";

/**
 * Barra de navegación superior.
 * @returns {JSX.Element}
 */
export default function Navbar() {
    const { usuario, autenticado } = useAuth();
    const { t } = useTranslation();
    const navegacion = useNavegacion();
    const navigate = useNavigate();
    const [popOver, setPopOver] = useState(null);
    const [img, setImg] = useState("");
    const open = Boolean(popOver);
    const idPopOver = open ? "simple-popover" : undefined;
    const rol = useMemo(() => usuario?.rol, [usuario?.rol]);
    const txtRol = useMemo(() => {
        const { rol } = usuario;
        return rol ? t("txtAdministrador") : t("txtMedico");
    }, [usuario, navegacion.idioma]);
    const txtToolBtnMenu = useMemo(() => {
        return navegacion.mostrarMenu ? t("txtCerrarMenu") : t("txtAbrirMenu");
    }, [navegacion.mostrarMenu, navegacion.idioma]);
    const txtSwitch = useMemo(() => {
        const { modoUsuario } = usuario;
        if (modoUsuario === false) {
            return t("txtActivarModoUsuario");
        } else {
            return t("txtDesactivarModoUsuario");
        }
    }, [usuario, navegacion.idioma]);

    /**
     * Carga de la imagen del usuario a iniciar.
     */
    useEffect(() => {
        if (autenticado && usuario) {
            setImg(usuario.fotoUrl);
        } else if (!autenticado) {
            navigate("/", { replace: true });
        }
    }, [usuario, autenticado]);

    /**
     * Manejador de evento de clic para mostrar el PopOver de usuario.
     * @param {Event} event 
     */
    const manejadorMousePopOver = (event) => {
        setPopOver(event.currentTarget);
    };

    /**
     * Manejador de evento para abrir o cerrar el menú lateral.
     */
    const manejadorAbrirMenu = () => {
        if (!navegacion.cerrandoMenu) {
            navegacion.setMostrarMenu(!navegacion.mostrarMenu);
        }
    };

    /**
     * Manejador de evento para cerrar el PopOver de usuario.
     */
    const cerrarPopOver = () => {
        setPopOver(null);
    };

    /**
     * Manejador de evento para cerrar sesión.
     */
    const cerrarSesion = () => {
        navegacion.paginaAnterior.current = window.location.pathname;
        navigate("/cerrar-sesion", { replace: true });
    };

    /**
     * Abre una nueva pestaña con el manual de instrucciones.
     */
    const manejadorBtnInstrucciones = () => {
        const url = usuario?.rolVisible ? URL_MANUAL_ADMIN : URL_MANUAL_USUARIO;
        window.open(url, "_blank");
    };

    /**
     * Manejador de evento para cambiar el modo de usuario.
     * @param {Event} e 
     */
    const manejadorSwitchModoUsuario = (e) => {
        const modoUsuario = usuario?.modoUsuario;
        if (e == null) {
            e = { target: { checked: !modoUsuario } };
        }
        usuario.modoUsuario = e.target.checked;
        navegacion.setRecargarPagina(true);
    };

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexDirection="row" width="100vw" >
                    <Tooltip title={txtToolBtnMenu}>
                        <IconButton edge="start" color="inherit" onClick={manejadorAbrirMenu}>
                            {navegacion.mostrarMenu ? <MenuOpenIcon /> : <MenuIcon />}
                        </IconButton>
                    </Tooltip>
                    <Typography variant="h6"><b>HADT</b></Typography>
                    <Stack direction="row" spacing={1}>
                        <SelectIdioma />
                        <BtnTema color="inherit" />
                        <Tooltip title={t("txtAyudaBtnManual")}>
                            <IconButton color="inherit" onClick={manejadorBtnInstrucciones}>
                                <ArticleIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t("txtAyudaAvatar")}>
                            <IconButton onClick={manejadorMousePopOver} color="inherit" aria-describedby={idPopOver}>
                                <Avatar alt={usuario ? usuario.nombre : t("txtUsuario")} src={img}>
                                    {img === "" ? <AccountCircleIcon sx={{ height: 47, width: 47 }} /> : null}
                                </Avatar>
                                <ArrowDropDownIcon color="inherit" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                    <Popover
                        id={idPopOver}
                        open={open}
                        onClose={cerrarPopOver}
                        anchorEl={popOver}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                        PaperProps={{
                            sx: {
                                p: 0,
                                mt: 1.5,
                                ml: 0.75,
                                "& .MuiMenuItem-root": {
                                    typography: "body2",
                                    borderRadius: 0.75,
                                },
                            },
                        }}>
                        <Box padding="1vh 15px" maxWidth="90vw">
                            <Typography variant="h6">
                                <b>{usuario ? usuario.nombre : t("txtUsuario")}</b>
                            </Typography>
                            <Typography variant="body2" maxWidth="100%">
                                <b>{txtRol}</b>
                            </Typography>
                            <Typography variant="body2" color="textSecondary" maxWidth="100%">
                                <span><b>{t("txtCorreo")}: </b> {usuario ? usuario?.correo : "Correo@correo.com"}</span>
                            </Typography>
                        </Box>
                        <Divider />
                        {rol ? (
                            <>
                                <MenuItem onClick={() => manejadorSwitchModoUsuario(null)}>
                                    <SwitchLabel
                                        activado={usuario?.modoUsuario}
                                        etiqueta={txtSwitch}
                                        manejadorCambios={manejadorSwitchModoUsuario} />
                                </MenuItem>
                                <Divider />
                            </>) : null}
                        <MenuItem onClick={cerrarSesion}>
                            <Stack direction="row" spacing={1} display="flex" alignItems="center">
                                <LogoutIcon />
                                <Typography variant="body1" sx={{ p: 0.5 }}>
                                    {t("txtBtnCerrarSesion")}
                                </Typography>
                            </Stack>
                        </MenuItem>
                    </Popover>
                </Box>
            </Toolbar>
        </AppBar>
    );
};