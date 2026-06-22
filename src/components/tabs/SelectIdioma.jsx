import { MenuItem, Tooltip, Button, Popover, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import TranslateIcon from '@mui/icons-material/Translate';
import CheckIcon from '@mui/icons-material/Check';
import { useNavegacion } from "../../hooks/Navegacion";
import iconoEspanol from "../../assets/iconos/icono_espanol.svg";
import iconoIngles from "../../assets/iconos/icono_ingles.svg";

/**
 * Componente que permite seleccionar el idioma de la aplicación.
 * @returns {JSX.Element}
 */
export default function SelectIdioma() {
    const { i18n } = useTranslation();
    const { idioma, cambiarIdioma } = useNavegacion();
    const [popOver, setPopOver] = useState(null);
    const open = Boolean(popOver);
    const idPopOver = open ? "simple-popover" : undefined;

    /**
     * Cierra el PopOver de selección de idioma.
     */
    const cerrarPopOver = () => {
        setPopOver(null);
    };

    /**
     * Envoltorio para cambiar el idioma de la aplicación.
     * @param {string} idioma 
     */
    const cambiarIdiomaApp = (idioma) => {
        cambiarIdioma(idioma);
        cerrarPopOver();
    };

    /**
     * Manejador de evento de clic para mostrar el PopOver de usuario.
     * @param {Event} event 
     */
    const manejadorMousePopOver = (event) => {
        setPopOver(event.currentTarget);
    };

    return (
        <>
            <Tooltip title={i18n.t('txtAyudaSelectIdioma')}>
                <Button
                    aria-describedby={idPopOver}
                    onClick={manejadorMousePopOver}
                    color="inherit"
                    startIcon={<TranslateIcon fontSize="large" />}>
                    {idioma.toUpperCase()}
                </Button>
            </Tooltip>
            <Popover
                id={idPopOver}
                open={open}
                onClose={cerrarPopOver}
                anchorEl={popOver}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
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
                <MenuItem onClick={() => cambiarIdiomaApp("es")}>
                    <Stack direction="row" spacing={1} display="flex" alignItems="center">
                        <img src={iconoEspanol} alt="Español" style={{ width: 30, height: 15 }} />
                        <Typography variant="body1" sx={{ p: 0.5 }}>
                            Español (🇪🇸)
                        </Typography>
                        {idioma === "es" ? <CheckIcon /> : null}
                    </Stack>
                </MenuItem>
                <MenuItem onClick={() => cambiarIdiomaApp("en")}>
                    <Stack direction="row" spacing={1} display="flex" alignItems="center">
                        <img src={iconoIngles} alt="Inglés" style={{ width: 30, height: 15 }} />
                        <Typography variant="body1" sx={{ p: 0.5 }}>
                            English (🇬🇧)
                        </Typography>
                        {idioma === "en" ? <CheckIcon /> : null}
                    </Stack>
                </MenuItem>
            </Popover>
        </>
    );
};