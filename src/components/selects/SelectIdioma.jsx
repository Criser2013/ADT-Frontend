import CheckIcon from '@mui/icons-material/Check';
import IconoEspanol from "/icons/icono_espanol.svg";
import IconoIngles from "/icons/icono_ingles.svg";
import TranslateIcon from '@mui/icons-material/Translate';
import { Button, MenuItem, Popover, Stack, Tooltip, Typography } from "@mui/material";
import useIdioma, { idiomaEspanol, idiomaIngles } from "../../hooks/idioma-hook";
import { useState } from "react";
import { useTranslation } from "react-i18next";


/**
 * Componente para seleccionar el idioma de la aplicación.
 * @returns {JSX.Element}
 */
export default function SelectIdioma() {
    const { i18n } = useTranslation();
    const { idioma, cambiarIdioma } = useIdioma();
    const [popOver, setPopOver] = useState(null);
    const open = Boolean(popOver);
    const idPopOver = open ? "simple-popover" : undefined;
    const idiomas = [
        { codigo: idiomaEspanol, nombre: "Español (🇪🇸)", icono: IconoEspanol },
        { codigo: idiomaIngles, nombre: "English (🇬🇧)", icono: IconoIngles }
    ];

    /**
     * @param {string} idioma Código del idioma a cambiar.
     */
    function cambiarIdiomaApp(idioma) {
        cambiarIdioma(idioma);
        setPopOver(null);
    };

    /**
     * @param {Event} event
     */
    function manejadorMousePopOver(event) {
        setPopOver(event.currentTarget);
    };

    return (
        <>
            <Tooltip title={i18n.t('txtAyudaSelectIdioma')}>
                <Button
                    aria-describedby={idPopOver}
                    onClick={manejadorMousePopOver}
                    color="inherit"
                    startIcon={<TranslateIcon fontSize="large" />}
                    sx={{ textTransform: "uppercase" }}>
                    {idioma}
                </Button>
            </Tooltip>
            <Popover
                id={idPopOver}
                open={open}
                onClose={() => setPopOver(null)}
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
                {idiomas.map((idioma) => (
                    <MenuItem key={idioma.codigo} onClick={() => cambiarIdiomaApp(idioma.codigo)}>
                        <Stack direction="row" spacing={1} display="flex" alignItems="center">
                            <img src={idioma.icono} alt={idioma.nombre} style={{ width: 30, height: 15 }} />
                            <Typography variant="body1" sx={{ p: 0.5 }}>
                                {idioma.nombre}
                            </Typography>
                            {idioma == idioma.codigo ? <CheckIcon /> : null}
                        </Stack>
                    </MenuItem>
                ))}
            </Popover>
        </>
    );
};