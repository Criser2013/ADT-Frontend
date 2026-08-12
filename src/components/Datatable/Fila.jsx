import { Checkbox, TableCell, TableRow } from "@mui/material";
import { useMemo } from "react";


/**
 * Fila del componente Datatable.
 * @param {Object} datos Datos de la fila.
 * @param {Array<String>} datosSeleccionados Lista de IDs de filas seleccionadas.
 * @param {String} campoId Nombre del campo que contiene el ID único de la fila.
 * @param {Boolean} activarSeleccion Indicador para activar la selección de filas.
 * @param {Function} manejadorClicCelda Manejador cuando se hace clic en una celda.
 * @param {Function} manejadorClicSeleccion Manejador cuando se hace clic en la casilla de selección.
 * @param {Array<Object>} campos Lista de campos a mostrar en la fila. Los objetos deben tener la estructura:
 * - id (String): Identificador del campo.
 * - label (String): Etiqueta del campo.
 * - componente (JSX.Element|null): Componente para renderizar el campo. Si es null, se mostrará el valor del campo directamente.
 * @returns {JSX.Element}
 */
export default function Fila({ 
    datos, datosSeleccionados, campoId, activarSeleccion, manejadorClicCelda = null, 
    manejadorClicSeleccion, campos
}) {
    const celdaSeleccionada = useMemo(() => (
        datosSeleccionados.includes(datos)
    ),[datosSeleccionados, datos]);


    return (
        <TableRow
            hover
            onClick={(e) => manejadorClicCelda(e, datos)}
            tabIndex={-1}
            selected={celdaSeleccionada}
            sx={{ cursor: manejadorClicCelda ? "pointer" : "default" }}>
            {activarSeleccion ? (
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        checked={celdaSeleccionada}
                        onClick={(e) => manejadorClicSeleccion(e, datos)}
                        inputProps={{
                            "aria-labelledby": `enhanced-table-checkbox-${datos[campoId]}`,
                        }} />
                </TableCell>) : null}
            {campos.map((campo) => (
                <TableCell key={`${datos[campoId]}-${campo.id}`}>
                    {campo.componente ? campo.componente(datos) : datos[campo.id]}
                </TableCell>
            ))}
        </TableRow>
    );
};