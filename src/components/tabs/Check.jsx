import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";


/**
 * Checkbox con etiqueta.
 * @param {Boolean} marcado Estado del checkbox
 * @param {Boolean} desactivar Indicador para desactivar el checkbox.
 * @param {Function} manejadorCambios Función para manejar cambios en el checkbox.
 * @param {String|JSX.Element} etiqueta Etiqueta del checkbox, puede ser un string o un elemento JSX.
 * @param {String} nombre Nombre para la etiqueta "name" del checkbox
 * @param {string} tamano Tamaño del componente (valores: "small", "medium", "large")
 * @returns {JSX.Element}
 */
export default function Check({
    marcado, desactivar = false, manejadorCambios, etiqueta,
    nombre = "check", tamano = "medium"
}) {
    return (
        <FormGroup>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={marcado}
                        size={tamano}
                        name={nombre}
                        disabled={desactivar}
                        onChange={manejadorCambios} />
                }
                label={etiqueta} />
        </FormGroup>
    );
};