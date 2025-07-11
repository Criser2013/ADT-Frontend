import { FormGroup, Checkbox, FormControlLabel } from "@mui/material";

/**
 * Componente de checkbox con etiqueta.
 * @param {boolean} checked - Estado del checkbox
 * @param {function} manejadorCambios - Función para manejar cambios en el checkbox
 * @param {string} lbl - Etiqueta del checkbox
 * @param {string} nombre - Nombre del checkbox
 * @returns JSX.Element
 */
export default function Check({ checked, manejadorCambios, etiqueta, nombre }) {
    return (
        <FormGroup>
            <FormControlLabel
                control={
                    <Checkbox checked={checked}
                        size="medium"
                        name={nombre}
                        onChange={manejadorCambios} />
                }
                label={etiqueta} />
        </FormGroup>
    );
};