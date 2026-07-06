import LogoutIcon from '@mui/icons-material/Logout';
import {
    IconButton, Popover, Typography, Box,
    MenuItem, Divider, Stack
} from "@mui/material";
import { SwitchLabel } from "../tabs";
import { useAuth } from "../../hooks";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";


/**
 * Componente popover que se muestra al hacer click en el avatar del usuario.
 * Contiene funciones como cerrar sesión y cambiar el modo de usuario.
 * @param {JSX.Element} id Componente del que se desplegará el popover.
 * @param {Boolean} mostrar Indicador para mostrar el popover.
 * @param {JSX.Element} anchorEl Componente al que se anclará el popover.
 * @param {import("react").SetStateAction} setPopOver Función para cerrar el popover.
 * @returns {JSX.Element} 
 */
export default function PopOver({ id, mostrar, anchorEl, setPopOver }) {
    const navigate = useNavigate();
    const { cambiarModoUsuario, cerrarSesion, usuario } = useAuth();
    const { t } = useTranslation();

    function cerrarPopOver() {
        setPopOver(null);
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
        cambiarModoUsuario(e.target.checked);
    };

    return (
        <Popover
            id={id}
            open={mostrar}
            onClose={cerrarPopOver}
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
                sx: {
                    width: "min(90vw, 360px)",
                    maxWidth: "90vw",
                    padding: 0,
                    marginTop: 1.5,
                    marginLeft: 0.75,
                    "& .MuiMenuItem-root": {
                        typography: "body2",
                        borderRadius: 0.75,
                    },
                },
            }}>
            <Box padding="1vh 15px" width="100%" boxSizing="border-box">
                <Typography variant="h6" fontWeight="bold" sx={{ overflowWrap: "break-word" }}>
                    {usuario ? usuario.nombre : t("txtUsuario")}
                </Typography>
                <Typography variant="body2" maxWidth="100%" fontWeight="bold">
                    {usuario?.rol ? t("txtAdministrador") : t("txtMedico")}
                </Typography>
                <Typography variant="body2" color="textSecondary" maxWidth="100%" sx={{ wordWrap: "break-word", overflowWrap: "anywhere" }}>
                    <span>
                        <b>{t("txtCorreo")}: </b>
                        {usuario ? usuario?.correo : null}
                    </span>
                </Typography>
            </Box>
            <Divider />
            {usuario?.rol ? (
                <>
                    <MenuItem>
                        <SwitchLabel
                            activado={usuario?.modoUsuario}
                            etiqueta={usuario?.modoUsuario ?
                                t("txtDesactivarModoUsuario") : t("txtActivarModoUsuario")
                            }
                            manejadorCambios={manejadorSwitchModoUsuario} />
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
    );
};