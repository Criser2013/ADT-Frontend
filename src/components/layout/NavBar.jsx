import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArticleIcon from '@mui/icons-material/Article';
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import {
    AppBar, Avatar, IconButton, Tooltip, Typography, Toolbar, Box,
    Stack
} from "@mui/material";
import { BtnTema, PopOverAuth } from "../layout";
import { SelectIdioma } from "../selects";
import { useAuth } from "../../hooks";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { URL_MANUAL_ADMIN, URL_MANUAL_USUARIO } from "../../constants";


/**
 * Barra de navegación que se muestra en las pewstañas que requieren autenticación.
 * @param {Boolean} mostrarMenu Indica si el menú lateral se muestra o no.
 * @param {import("react").SetStateAction<Boolean>} setMostrarMenu Función que cambia el estado de mostrarMenu.
 * @returns {JSX.Element}
 */
export default function Navbar({ mostrarMenu, setMostrarMenu }) {
    const { autenticado, usuario } = useAuth();
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

    function manejadorAbrirMenu() {
        setMostrarMenu((mostrarMenu) => !mostrarMenu);
    };

    function manejadorBtnInstrucciones() {
        const url = usuario?.rolVisible ? URL_MANUAL_ADMIN : URL_MANUAL_USUARIO;
        window.open(url, "_blank");
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
                    <PopOverAuth
                        id={idPopOver}
                        mostrar={mostrarPopOver}
                        anchorEl={popOver}
                        setPopOver={setPopOver}/>
                </Box>
            </Toolbar>
        </AppBar> 
    );
};