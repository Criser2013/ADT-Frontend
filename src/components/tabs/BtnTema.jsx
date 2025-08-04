import { Tooltip, useColorScheme } from "@mui/material";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

/**
 * Botón para cambiar el tema de la aplicación.
 * @returns {JSX.Element}
 */
export default function BtnTema() {
    const { mode } = useColorScheme();

    if (mode == "light") {
        return (
            <Tooltip title="Cambiar a modo oscuro">
                <DarkModeIcon color="inherit" />
            </Tooltip>
        );
    } else {
        return (
            <Tooltip title="Cambiar a modo claro">
                <LightModeIcon color="inherit" />
            </Tooltip>
        );
    }
};