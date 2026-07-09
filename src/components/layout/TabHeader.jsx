import WestIcon from '@mui/icons-material/West';
import { Link, Breadcrumbs, Stack, Typography, Box, IconButton, Tooltip, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";


/**
 * Header de las pestañas CRUD.
 * @param {String} url URL de la ruta a la que se redirige al hacer click en el botón de retroceder.
 * @param {String} titulo Título de la pestaña actual
 * @param {Array<Object>} pestanas Lista de pestañas con objetos de la forma { texto: String, url: String }.
 * @param {String} tooltip Texto ayuda para el botón de retroceso.
 * @param {Boolean} activarBtnAtras Indicador para mostrar el botón de volver atrás, de forma predeterminada es true.
 * @returns {JSX.Element}
 */
export default function TabHeader({ url = null, titulo, pestanas, tooltip, activarBtnAtras = true }) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    function manejadorBtnAtras() {
        if (url) {
            navigate(url);
        } else {
            navigate(-1);
        }
    };

    return (
        <Box>
            <Stack direction="row" spacing={1}>
                {activarBtnAtras ? (
                    <Tooltip title={tooltip ? tooltip : t("txtVolverAtras")}>
                        <IconButton onClick={manejadorBtnAtras}>
                            <WestIcon />
                        </IconButton>
                    </Tooltip>) : null}
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        {titulo}
                    </Typography>
                    <Breadcrumbs>
                        {(pestanas && (pestanas.length > 0)) ? (
                            pestanas.map((x) => {
                                return (
                                    <Link
                                        key={x.url}
                                        underline="hover"
                                        color="inherit"
                                        onClick={() => navigate(x.url)}
                                        sx={{ cursor: "pointer" }}>
                                        {x.texto}
                                    </Link>
                                );
                            })
                        ) : null}
                    </Breadcrumbs>
                </Box>
            </Stack>
            <Divider orientation="horizontal" sx={{ margin: "1vh 0vw" }}/>
        </Box>
    );
};