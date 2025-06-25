import { Link, Breadcrumbs, Stack, Typography, Box, IconButton, Tooltip, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useNavegacion } from "../../contexts/NavegacionContext";
import WestIcon from '@mui/icons-material/West';

/**
 * Header de las pestañas CRUD.
 * @param {String} titulo - Título de la pestaña actual
 * @param {Array} pestanas - Lista de pestañas con sus textos y URLs
 * @param {String} tooltip - Texto del tooltip para el botón de retroceso.
 * @returns JSX.Element
 */
export default function TabHeader({ titulo, pestanas, tooltip }) {
    const navigate = useNavigate();
    const navegacion = useNavegacion();

    /**
     * Manejador de eventos del botón "Atrás".
     */
    const manejadorBtnAtras = () => {
        if (navegacion.paginaAnterior != "" && navegacion.paginaAnterior != null) {
            navigate(navegacion.paginaAnterior, { replace: true });
        }
    };

    return (
        <Box>
            <Stack direction="row" spacing={1}>
                <Tooltip
                    title={(tooltip != null && tooltip != undefined) ? tooltip : "Volver a la página anterior"}>
                    <IconButton onClick={manejadorBtnAtras}>
                        <WestIcon />
                    </IconButton>
                </Tooltip>
                <Box>
                    <Breadcrumbs>
                        {pestanas && pestanas.length > 0 ? (
                            pestanas.map((x) => {
                                return (
                                    <Link key={x.url} underline="hover" color="inherit" onClick={() => { navigate(x.url, { replace: true }); }} sx={{ cursor: "pointer" }}>
                                        {x.texto}
                                    </Link>
                                );
                            })
                        ) : null}
                    </Breadcrumbs>
                    <Typography variant="h5">
                        <b>{titulo}</b>
                    </Typography>
                </Box>
            </Stack>
            <Divider orientation="horizontal" sx={{ marginTop: "1vh", marginBottom: "1vh" }} />
        </Box>
    );
};