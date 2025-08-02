import { Card, Typography } from "@mui/material";

/**
 * Tarjeta que se muestra en el menú principal del usuario.
 * @param {String} titulo - Título de la tarjeta.
 * @param {String|Number} valor - Valor a mostrar en la tarjeta. 
 * @returns {JSX.Element}
 */
export default function TarjetaMenuPrincipal ({ titulo, valor }) {
    return (
        <Card>
            <Typography variant="h6" align="center" padding="0vh 2vh">
                {titulo}
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
                {valor}
            </Typography>
        </Card>
    );
}