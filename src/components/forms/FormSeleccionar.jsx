import { Stack, Typography, TextField, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";

/**
 * Formulario para seleccionar un valor de una lista.
 * @param {String} texto - Texto que se mostrará en el campo de selección.
 * @param {Function} onChange - Función a ejecutar cuando se cambie el valor del campo de selección.
 * @param {boolean} error - Indica si hay un error en la selección.
 * @param {String} txtError - Texto del mensaje de error.
 * @param {String} valor - Valor actual del campo de selección.
 * @param {Array} valores - Lista de objetos con las opciones a mostrar en el campo
 * @returns {JSX.Element}
 */
export default function FormSeleccionar({ texto, onChange, error, txtError, valor, valores, children }) {
    const { t } = useTranslation();
    return (
        <Stack orientation="column" spacing={2} width="100%">
            <Typography variant="body1">
                {texto}
            </Typography>
            <TextField
                select
                value={valor}
                onChange={(e) => onChange(e.target.value)}
                error={error}
                helperText={error ? txtError : ""}
                fullWidth>
                {valores.map((x) => {
                    return (
                        <MenuItem key={x.valor} value={x.valor}>
                            {t(x.texto)}
                        </MenuItem>
                    );
                })}
            </TextField>
            { children }
        </Stack>
    );
};