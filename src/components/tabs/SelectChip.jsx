import { FormControl, InputLabel, Select, Box, OutlinedInput, MenuItem, FormHelperText, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";

/**
 * Componente de selección múltiple con chips.
 * @param {Array[String]} valor - Valores seleccionados.
 * @param {Array[String]} listaValores - Lista de valores disponibles para seleccionar.
 * @param {Function} manejadorCambios - Función para manejar cambios en la selección
 * @param {String} nombre - Atributo "name" del componente.
 * @param {Boolean} error - Indica si hay un error en la selección.
 * @param {String} txtError - Mensaje de error a mostrar si hay un error.
 * @param {String} etiqueta - Etiqueta del campo de selección.
 * @param {Boolean} desactivado - Indica si el campo está desactivado.
 * @returns {JSX.Element}
 */
export default function SelectChip({ valor, listaValores, manejadorCambios, nombre, error, txtError, etiqueta, desactivado = false }) {
    const { t } = useTranslation();
    return (
        <FormControl sx={{ width: "100%" }}>
            <InputLabel id="select-chip-tag">
                {etiqueta}
            </InputLabel>
            <Select
                labelId="select-chip-tag"
                multiple
                value={valor}
                onChange={manejadorCambios}
                fullWidth
                name={nombre}
                error={error}
                disabled={desactivado}
                input={<OutlinedInput id="select-multiple-chip" label={etiqueta} />}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                            <Chip key={value} label={t(value)} />
                        ))}
                    </Box>
                )}>
                {listaValores.map((x) => (
                    <MenuItem
                        key={x}
                        value={x}>
                        {t(x)}
                    </MenuItem>
                ))}
            </Select>
            <FormHelperText error={error}>
                {txtError}
            </FormHelperText>
        </FormControl>
    );
};