import { Stack, Typography, TextField, MenuItem } from '@mui/material';

/**
 * Formulario para validar el diagnóstico de TEP.
 * @param {Function} onChange - Función a ejecutar cuando se cambiar el valor del diagnóstico.
 * @param {number} diagnostico - Valor actual del diagnóstico seleccionado.
 * @param {boolean} error - Indica si hay un error en la selección del diagnóstico
 * @returns JSX.Element
 */
export default function FormValidarDiag({ onChange, diagnostico, error }) {
    return (
        <Stack orientation="column" spacing={2} width="100%">
            <Typography variant="body1">
                Selecciona el diagnóstico de TEP del paciente:
            </Typography>
            <TextField
                select
                value={diagnostico}
                onChange={(e) => onChange(e.target.value)}
                error={error}
                helperText={error ? "Selecciona el diagnóstico definitivo del paciente" : ""}
                fullWidth>
                <MenuItem value={2}>
                    Seleccione el diagnóstico
                </MenuItem>
                <MenuItem value={0}>
                    Negativo
                </MenuItem>
                <MenuItem value={1}>
                    Positivo
                </MenuItem>
            </TextField>
        </Stack>
    );
};