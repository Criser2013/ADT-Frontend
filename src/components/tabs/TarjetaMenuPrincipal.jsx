import { Box, Card, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import { useNavegacion } from "../../contexts/NavegacionContext";

/**
 * Tarjeta que se muestra en el menú principal del usuario.
 * @param {String} titulo - Título de la tarjeta.
 * @param {String|Number} valor - Valor a mostrar en la tarjeta. 
 * @param {JSX.Element} icono - Icono a mostrar en la tarjeta.
 * @param {String} colorFondo - Color de fondo de la tarjeta.
 * @param {String} colorTexto - Color del texto de la tarjeta.
 * @param {String} ColorFondoIcono - Color de fondo del icono.
 * @param {String} altura - Altura de la tarjeta.
 * @returns {JSX.Element}
 */
export default function TarjetaMenuPrincipal({ titulo, valor, icono, colorFondo = "#cce4f2", colorTexto = "#182d6d", ColorFondoIcono = "#aeccea", altura = "80%" }) {
    const navegacion = useNavegacion();
    const tema = useMemo(() => navegacion.tema, [navegacion.tema]);
    const bgColor = useMemo(() => {
        return (tema == "light") ? colorFondo : "#272727";
    }, [tema, colorFondo]);
    const bgColorIcono = useMemo(() => {
        return (tema == "light") ? ColorFondoIcono : "#212020";
    }, [tema, ColorFondoIcono]);
    const colorFuente = useMemo(() => {
        return (tema == "light") ? colorTexto : "#ffffff";
    }, [tema, colorTexto]);

    return (
        <Card elevation={0} sx={{
            width: "100%", height: altura, display: "flex", justifyContent: "center",
            alignItems: "center", backgroundColor: bgColor, borderRadius: 5, padding: "3vh 0vh"
        }}>
            <Stack direction="column" spacing={1} display="flex" justifyContent="center" alignItems="center">
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    borderRadius={10}
                    sx={{ backgroundColor: bgColorIcono, height: "7vh", width: "7vh", }}>
                    {icono}
                </Box>
                <Typography variant="subtitle1" fontSize={25} color={colorFuente} align="center">
                    <b>{valor}</b>
                </Typography>
                <Typography variant="h6" align="center" color={colorFuente}>
                    {titulo}
                </Typography>
            </Stack>
        </Card>
    );
}