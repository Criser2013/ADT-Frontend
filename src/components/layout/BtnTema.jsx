import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { IconButton, Tooltip } from "@mui/material";
import { useMemo } from "react";
import useTema, { temaClaro } from "../../hooks/tema-hook";
import { useTranslation } from "react-i18next";

/**
 * Botón para cambiar el tema de la aplicación.
 * @param {String} color Color del botón (default, primary, secondary, inherit, etc).
 * @param {String} tamano Tamaño del botón (small, medium, large).
 * @returns {JSX.Element}
 */
export default function BtnTema({ tamano = "medium", color = "default" }) {
    const { cambiarTema, tema } = useTema();
    const { t } = useTranslation();
    const txtTooltip = useMemo(() =>
        (tema === temaClaro) ? t("txtAyudaBtnTemaOscuro") : t("txtAyudaBtnTemaClaro")
        , [tema, t]);

    function manejadorBtnCambiarTema() {
        cambiarTema(tema);
    };

    return (
        <IconButton color={color} size={tamano} onClick={manejadorBtnCambiarTema}>
            <Tooltip title={txtTooltip}>
                {(tema == temaClaro) ? (
                    <DarkModeIcon color="inherit" />
                ) : (
                    <LightModeIcon color="inherit" />
                )}
            </Tooltip>
        </IconButton>
    );
};