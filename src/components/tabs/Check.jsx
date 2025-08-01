import { FormGroup, Checkbox, FormControlLabel } from "@mui/material";

/**
 * Componente de checkbox con etiqueta.
 * @param {Boolean} activado - Estado del checkbox
 * @param {function} manejadorCambios - Función para manejar cambios en el checkbox
 * @param {string} lbl - Etiqueta del checkbox
 * @param {string} nombre - Nombre del checkbox
 * @param {boolean} desactivado - Indica si el checkbox está desactivado
 * @param {string} tamano - Tamaño del checkbox (small, medium, large)
 * @returns JSX.Element
 */
export default function Check({ activado, manejadorCambios, etiqueta, nombre = "", desactivado = false, tamano = "medium" }) {
    return (
        <FormGroup>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={!!activado}
                        size={tamano}
                        name={nombre}
                        disabled={desactivado}
                        onChange={manejadorCambios} />
                }
                label={etiqueta} />
        </FormGroup>
    );
};