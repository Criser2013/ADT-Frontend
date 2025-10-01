import { Tooltip } from "@mui/material";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useNavegacion } from "../../contexts/NavegacionContext";
import { useTranslation } from "react-i18next";

/**
 * Botón para cambiar el tema de la aplicación.
 * @returns {JSX.Element}
 */
export default function BtnTema() {
    const { tema } = useNavegacion();
    const { t } = useTranslation();

    if (tema == "light") {
        return (
            <Tooltip title={t("txtAyudaBtnTemaOscuro")}>
                <DarkModeIcon color="inherit" />
            </Tooltip>
        );
    } else {
        return (
            <Tooltip title={t("txtAyudaBtnTemaClaro")}>
                <LightModeIcon color="inherit" />
            </Tooltip>
        );
    }
};