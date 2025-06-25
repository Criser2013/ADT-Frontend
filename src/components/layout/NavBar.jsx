import { AppBar, Avatar, IconButton, Popover, Tooltip, Typography, Toolbar, Box, MenuItem, Divider, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router";
import { useNavegacion } from "../../contexts/NavegacionContext";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ContrastIcon from "@mui/icons-material/Contrast";
import { ConstructionOutlined } from "@mui/icons-material";

/**
 * Barra de navegación superior.
 * @returns JSX.Element
 */
export default function Navbar() {
    const auth = useAuth();
    const navegacion = useNavegacion();
    const navigate = useNavigate();
    const [popOver, setPopOver] = useState(null);
    const [img, setImg] = useState("");
    const open = Boolean(popOver);
    const idPopOver = open ? "simple-popover" : undefined;

    /**
     * Carga de la imagen del usuario a iniciar.
     */
    useEffect(() => {
        if (auth.authInfo.user != null) {
            setImg(auth.authInfo.user.photoURL);
        }
    }, [auth.authInfo.user]);

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
     * Manejador de evento para cambiar el tema de la aplicación.
     */
    const manejadorBtnTema = () => {
        console.log("botón de tema presionado");
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
        navegacion.setPaginaAnterior(window.location.pathname);
        navigate("/cerrar-sesion", { replace: true });
    };

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexDirection="row" width="100%" >
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={manejadorAbrirMenu}>
                        {navegacion.mostrarMenu ? <MenuOpenIcon /> : <MenuIcon />}
                    </IconButton>
                    <Typography variant="h6">HADT</Typography>

                    <Stack direction="row" spacing={1}>
                    <IconButton aria-label="delete" onClick={manejadorBtnTema}>
                        <ContrastIcon />
                    </IconButton>
                    <Tooltip title="Ver opciones de usuario">
                        <IconButton onClick={manejadorMousePopOver} color="inherit" aria-label="logout" aria-describedby={idPopOver}>
                            <Avatar alt="foto-usuario" src={img}>
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
                        <Box padding="1vh 3vh" maxWidth="90vh">
                            <Typography variant="h6" color="primary">
                                <b>{auth.authInfo.user != null ? auth.authInfo.user.displayName : "Usuario"}</b>
                            </Typography>
                            <Typography variant="body2" color="textSecondary" maxWidth="100%">
                                {auth.authInfo.user != null ? auth.authInfo.user.email : "Correo@correo.com"}
                            </Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={cerrarSesion}>
                            <Typography variant="body1" sx={{ p: 0.5 }}>
                                Cerrar sesión
                            </Typography>
                        </MenuItem>
                    </Popover>
                </Box>
            </Toolbar>
        </AppBar>
    );
};