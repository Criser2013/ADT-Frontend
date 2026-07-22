import { Grid, Typography } from "@mui/material";

/**
 * Componente para mostrar un campo númerico o de texto dentro de un grid.
 * @param {Number} tamano Tamaño del grid (1-12).
 * @param {String} titulo Título del campo.
 * @param {String|null} valor Valor del campo. Es opcional si se pasa un componente.
 * @param {JSX.Element|null} componente Componente opcional para mostrar el valor.
 * @returns {JSX.Element}
 */
export default function CampoTexto({ tamano, titulo, valor, componente = null }) {
    return (
        <Grid container size={tamano} columns={6} columnSpacing={1} rowGap={0} columnGap={0}>
            <Grid size={2}>
                <Typography variant="body1" fontWeight="bold">
                    {titulo}:
                </Typography>
            </Grid>
            <Grid size={4}>
                {componente ? {componente} : (
                    <Typography variant="body1">
                        {valor}
                    </Typography>)}
            </Grid>
        </Grid>
    );
};