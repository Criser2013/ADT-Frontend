import { AppBar, Avatar, IconButton, Popover, Tooltip, Typography, Toolbar, Box, MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useAuth } from '../contexts/AuthContext';
import icono from "../assets/usuario-icono.png";
import { useNavigate } from 'react-router';
import { useNavegacion } from '../contexts/NavegacionContext';

export default function NavBar() {
    const auth = useAuth();
    const navegacion = useNavegacion();
    const navigate = useNavigate();
    const [popOver, setPopOver] = useState(null);
    const [img, setImg] = useState(null);
    const open = Boolean(popOver);
    const idPopOver = open ? 'simple-popover' : undefined;

    /**
     * Carga de la imagen del usuario a iniciar.
     */
    useEffect(() => {
        if (auth.authInfo.user != null) {
            setImg(auth.authInfo.user.photoURL);
        }
        else {
            setImg(icono);
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
        <AppBar position="sticky">
            <Toolbar>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexDirection="row" width="100%" >
                <IconButton edge="start" color="inherit" aria-label="menu">
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6">HADT</Typography>
                <Tooltip title="Ver opciones de usuario">
                    <IconButton onClick={manejadorMousePopOver} color="inherit" aria-label="logout" aria-describedby={idPopOver}>
                        <Avatar alt="foto-usuario" src={img} />
                        <ArrowDropDownIcon color="inherit" />
                    </IconButton>
                </Tooltip>
                <Popover id={idPopOver} open={open} onClose={cerrarPopOver} anchorEl={popOver} anchorOrigin={{vertical: "bottom",horizontal: "right" }}>
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