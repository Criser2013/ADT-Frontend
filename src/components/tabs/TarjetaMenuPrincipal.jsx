import { Box, Card, Stack, Typography } from "@mui/material";

/**
 * Tarjeta que se muestra en el menú principal del usuario.
 * @param {String} titulo - Título de la tarjeta.
 * @param {String|Number} valor - Valor a mostrar en la tarjeta. 
 * @param {JSX.Element} icono - Icono a mostrar en la tarjeta.
 * @param {String} colorFondo - Color de fondo de la tarjeta.
 * @param {String} colorTexto - Color del texto de la tarjeta.
 * @param {String} ColorFondoIcono - Color de fondo del icono.
 * @returns {JSX.Element}
 */
export default function TarjetaMenuPrincipal({ titulo, valor, icono, colorFondo = "#cce4f2", colorTexto = "#182d6d", ColorFondoIcono = "#aeccea" }) {
    return (
        <Card elevation={0} sx={{
            width: "100%", height: "80%", display: "flex", justifyContent: "center",
            alignItems: "center", backgroundColor: colorFondo, borderRadius: 5, padding: "3vh 0vh"
        }}>
            <Stack direction="column" spacing={1} display="flex" justifyContent="center" alignItems="center">
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    borderRadius={10}
                    sx={{ backgroundColor: ColorFondoIcono, height: "7vh", width: "7vh", }}>
                    {icono}
                </Box>
                <Typography variant="subtitle1" fontSize={25} color={colorTexto} align="center">
                    <b>{valor}</b>
                </Typography>
                <Typography variant="h6" align="center" color={colorTexto}>
                    {titulo}
                </Typography>
            </Stack>
        </Card>
    );
}