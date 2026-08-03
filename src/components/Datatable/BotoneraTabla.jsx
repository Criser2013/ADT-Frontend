import BtnTabla from "./BtnTabla";
import { Button, Grid, Tooltip } from "@mui/material";


/**
 * Botonera para utilizar en las filas del datatable, que permite mostrar varios botones con diferentes funcionalidades.
 * @param {Object} instancia Instancia de la fila en la tabla.
 * @param {Array<Object>} botones Arreglo de objetos que representan los botones a mostrar. Cada objeto debe tener las claves:
 * - "id" (String): Identificador único del botón.
 * - "color" (String): Color del botón.
 * - "icono" (JSX.Element|null): Icono que se mostrará en el botón. Por defecto es null.
 * - "txtAyuda" (String): Texto de ayuda que se mostrará al pasar el mouse sobre el botón.
 * - "manejadorClic" (Function): Función que se ejecutará al hacer clic en el botón.
 * @returns {JSX.Element}
 */
export default function BotoneraTabla({ instancia, botones }) {
    return (
        <Grid container size={botones.length} spacing={1} columns={1} justifyContent="center" alignItems="center">
            {botones.map(({ id, color, icono, txtAyuda, manejadorClic }) => (
                <Grid item key={id}>
                    <BtnTabla
                        instancia={instancia}
                        manejadorBtn={manejadorClic}
                        txtAyuda={txtAyuda}
                        color={color}
                        icono={icono}/>
                </Grid>
            ))}
        </Grid>
    );
};