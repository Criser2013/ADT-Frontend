import { FormGroup, Checkbox, FormControlLabel } from "@mui/material";

/**
 * Componente de checkbox con etiqueta.
 * @param {boolean} checked - Estado del checkbox
 * @param {function} manejadorCambios - Función para manejar cambios en el checkbox
 * @param {string} lbl - Etiqueta del checkbox
 * @param {string} nombre - Nombre del checkbox
 * @param {boolean} desactivado - Indica si el checkbox está desactivado
 * @returns JSX.Element
 */
export default function Check({ checked, manejadorCambios, etiqueta, nombre, desactivado = false }) {
    return (
        <FormGroup>
            <FormControlLabel
                control={
                    <Checkbox checked={checked}
                        size="medium"
                        name={nombre}
                        disabled={desactivado}
                        onChange={manejadorCambios} />
                }
                label={etiqueta} />
        </FormGroup>
    );
};