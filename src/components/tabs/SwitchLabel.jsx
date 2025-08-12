import { Switch, FormControlLabel, FormGroup } from "@mui/material";

/**
 * Switch con etiqueta.
 * @param {Boolean} activado - Estado del componente
 * @param {string} etiqueta - Etiqueta del componente
 * @param {function} manejadorCambios - Función para manejar cambios en el switch
 * @param {string} tamano - Tamaño del switch (small, medium, large)
 * @returns {JSX.Element}
 */
export default function SwitchLabel({ activado, etiqueta, manejadorCambios, tamano = "medium" }) {
    return (
        <FormGroup>
            <FormControlLabel
                control={
                    <Switch
                        checked={activado}
                        onChange={manejadorCambios}
                        size={tamano}
                        slotProps={{ input: { 'aria-label': 'controlled' } }}/>
                }
                label={etiqueta} />
        </FormGroup>
    );
};