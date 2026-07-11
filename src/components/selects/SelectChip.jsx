import { FormControl, InputLabel, Select, Box, 
    OutlinedInput, MenuItem, FormHelperText, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";


/**
 * Componente controlado de selección múltiple con chips.
 * @param {Array<String>} valores Valores seleccionados.
 * @param {Array<String>} listaValores Valores disponibles para seleccionar.
 * @param {String} etiqueta Etiqueta del campo de selección.
 * @param {Function} manejadorCambios Función para manejar cambios en la selección.
 * @param {String} nombre Atributo "name" del componente.
 * @param {Boolean} error Indicador para mostrar si hay un error en la selección.
 * @param {String} txtError Mensaje de error a mostrar.
 * @param {Boolean} desactivar Indica si el campo está desactivado.
 * @returns {JSX.Element}
 */
export default function SelectChip({ 
    valores, listaValores, etiqueta, manejadorCambios, nombre, error, txtError, 
    desactivar = false
}) {
    const { t } = useTranslation();
    return (
        <FormControl sx={{ width: "100%" }}>
            <InputLabel id="select-chip-tag">
                {etiqueta}
            </InputLabel>
            <Select
                fullWidth
                multiple
                labelId="select-chip-tag"
                value={valores}
                onChange={manejadorCambios}
                name={nombre}
                error={error}
                disabled={desactivar}
                input={<OutlinedInput id="select-multiple-chip" label={etiqueta} />}
                renderValue={(seleccionados) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {seleccionados.map((valores) => (
                            <Chip key={valores} label={t(valores)} />
                        ))}
                    </Box>
                )}>
                {listaValores.map((valores) => (
                    <MenuItem key={valores} value={valores}>
                        {t(valores)}
                    </MenuItem>
                ))}
            </Select>
            <FormHelperText error={error}>
                {txtError}
            </FormHelperText>
        </FormControl>
    );
};