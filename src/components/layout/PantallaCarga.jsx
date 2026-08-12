import { Box, CircularProgress } from "@mui/material";


/**
 * Pantalla de carga usada junto con el layout de la aplicación.
 * @param {String|Number} altura Altura de la pantalla de carga. Por defecto es 85vh.
 * @returns {JSX.Element}
 */
export default function PantallaCarga({ altura = "85vh" }) {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" height={altura}>
            <CircularProgress />
        </Box>
    );
};