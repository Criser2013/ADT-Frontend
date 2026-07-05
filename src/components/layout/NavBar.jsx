import { AppBar, Avatar, IconButton, Popover, Tooltip, Typography, Toolbar, Box, MenuItem, Divider, Stack } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useAuth } from "../../hooks";
import { useNavigate } from "react-router";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { BtnTema } from "../layout";
import LogoutIcon from '@mui/icons-material/Logout';
import { URL_MANUAL_ADMIN, URL_MANUAL_USUARIO } from "../../constants";
import ArticleIcon from '@mui/icons-material/Article';
import { SwitchLabel } from "../tabs";
import { useTranslation } from "react-i18next";
import { SelectIdioma } from "../selects";
import MenuContext from "../../contexts/MenuContext";

/**
 * Barra de navegación que se muestra en las pewstañas que requieren autenticación.
 * @returns {JSX.Element}
 */
export default function Navbar() {
    const navigate = useNavigate();
    const { autenticado, cerrarSesion, usuario } = useAuth();
    const { mostrarMenu, setMostrarMenu } = useContext(MenuContext);
    const { t } = useTranslation();
    const [urlImg, setUrlImg] = useState("");
    const [popOver, setPopOver] = useState(null);
    const mostrarPopOver = Boolean(popOver);
    const idPopOver = mostrarPopOver ? "simple-popover" : undefined;

    useEffect(() => {
        if (autenticado) {
            setUrlImg(usuario.fotoUrl);
        }
    }, [usuario, autenticado]);

    function cerrarPopOver() {
        setPopOver(null);
    };

    function manejadorAbrirMenu() {
        setMostrarMenu((mostrarMenu) => !mostrarMenu);
    };

    function manejadorBtnInstrucciones() {
        const url = usuario?.rolVisible ? URL_MANUAL_ADMIN : URL_MANUAL_USUARIO;
        window.open(url, "_blank");
    };

    async function manejadorCerrarSesion() {
        const res = await cerrarSesion();
        if (res) {
            navigate("/", { replace: true });
        }
    };

    /**
     * @param {Event} e 
     */
    function manejadorSwitchModoUsuario(e) {
        usuario.modoUsuario = e.target.checked;
    };

    /**
     * @param {Event} e 
     */
    function manejadorBtnAvatar(e) {
        setPopOver(e.currentTarget);
    };

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexDirection="row"
                    width="100vw">
                    <Tooltip title={mostrarMenu ? t("txtCerrarMenu") : t("txtAbrirMenu")}>
                        <IconButton edge="start" color="inherit" onClick={manejadorAbrirMenu}>
                            {mostrarMenu ? <MenuOpenIcon /> : <MenuIcon />}
                        </IconButton>
                    </Tooltip>
                    <Typography variant="h6" fontWeight="bold">
                        HADT
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <SelectIdioma />
                        <BtnTema color="inherit" />
                        <Tooltip title={t("txtAyudaBtnManual")}>
                            <IconButton color="inherit" onClick={manejadorBtnInstrucciones}>
                                <ArticleIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t("txtAyudaAvatar")}>
                            <IconButton
                                color="inherit"
                                onClick={manejadorBtnAvatar}
                                aria-describedby={idPopOver}>
                                <Avatar
                                    alt={usuario ? usuario.nombre : t("txtUsuario")}
                                    src={urlImg}>
                                    {urlImg == "" ? <AccountCircleIcon sx={{ height: 47, width: 47 }} /> : null}
                                </Avatar>
                                <ArrowDropDownIcon color="inherit" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                    <Popover
                        id={idPopOver}
                        open={mostrarPopOver}
                        onClose={cerrarPopOver}
                        anchorEl={popOver}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                        PaperProps={{
                            sx: {
                                padding: 0,
                                marginTop: 1.5,
                                marginLeft: 0.75,
                                "& .MuiMenuItem-root": {
                                    typography: "body2",
                                    borderRadius: 0.75,
                                },
                            },
                        }}>
                        <Box padding="1vh 15px" maxWidth="90vw" fontWeight="bold">
                            <Typography variant="h6">
                                {usuario ? usuario.nombre : t("txtUsuario")}
                            </Typography>
                            <Typography variant="body2" maxWidth="100%" fontWeight="bold">
                                {usuario?.rol ? t("txtAdministrador") : t("txtMedico")}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" maxWidth="100%">
                                <span>
                                    <b>{t("txtCorreo")}: </b>
                                    {usuario ? usuario?.correo : "Correo@correo.com"}
                                </span>
                            </Typography>
                        </Box>
                        <Divider />
                        {usuario?.rol ? (
                            <>
                                <MenuItem onClick={() => manejadorSwitchModoUsuario(null)}>
                                    <SwitchLabel
                                        activado={usuario?.modoUsuario}
                                        etiqueta={usuario?.modoUsuario ? 
                                            t("txtDesactivarModoUsuario") : t("txtActivarModoUsuario")
                                        }
                                        manejadorCambios={manejadorSwitchModoUsuario}/>
                                </MenuItem>
                                <Divider />
                            </>) : null}
                        <MenuItem onClick={manejadorCerrarSesion}>
                            <Stack direction="row" spacing={1} display="flex" alignItems="center">
                                <LogoutIcon />
                                <Typography variant="body1" sx={{ padding: 0.5 }}>
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