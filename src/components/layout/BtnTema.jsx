import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { IconButton, Tooltip } from "@mui/material";
import { useNavegacion } from "../../hooks/Navegacion";
import { useTranslation } from "react-i18next";

/**
 * Botón para cambiar el tema de la aplicación.
 * @param {String} color Color del botón (default, primary, secondary, inherit, etc).
 * @param {String} tamano Tamaño del botón (small, medium, large).
 * @returns {JSX.Element}
 */
export default function BtnTema({ tamano = "medium", color = "default" }) {
    const { cambiarTema, tema } = useNavegacion();
    const { t } = useTranslation();

    function manejadorBtnCambiarTema() {
        cambiarTema(tema);
    };

    if (tema == "light") {
        return (
            <IconButton color={color} size={tamano} onClick={manejadorBtnCambiarTema}>
            <Tooltip title={t("txtAyudaBtnTemaOscuro")}>
                <DarkModeIcon color="inherit" />
            </Tooltip>
            </IconButton>
        );
    } else {
        return (
            <IconButton color={color} size={tamano} onClick={manejadorBtnCambiarTema}>
                <Tooltip title={t("txtAyudaBtnTemaClaro")}>
                    <LightModeIcon color="inherit" />
                </Tooltip>
            </IconButton>
        );
    }
};