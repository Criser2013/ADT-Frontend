import { Box, TableHead, TableRow, TableCell, Checkbox, TableSortLabel } from "@mui/material";
import { visuallyHidden } from "@mui/utils";


/**
 * Cabecera del componente datatable.
 * @param {Array<Object>} datos Lista de datos a mostrar en el datatable.
 * @param {Array<Object>} campos Lista de campos a mostrar, debe ser un JSON con la estructura:
 * - id (String): Identificador del campo.
 * - label (String): Etiqueta del campo.
 * - componente (JSX.Element|null): Componente para renderizar el campo. Si es null, se mostrará el valor del campo directamente.
 * @param {String} orden Dirección del ordenamiento ("asc" o "desc").
 * @param {String} campoOrden Campo por el cual se ordenarán las filas.
 * @param {Boolean} activarSeleccion Indicador para activar la selección de filas.
 * @param {Number} numDatos Número total de filas del datatable.
 * @param {Number} numSeleccionados Número de filas seleccionadas.
 * @param {import("react").SetStateAction} setDatosSeleccionados Callback para actualizar la lista de filas seleccionadas.
 * @param {import("react").SetStateAction} setDirOrden Callback para actualizar la dirección del ordenamiento.
 * @param {import("react").SetStateAction} setCampoOrden Callback para actualizar el campo por el cual se ordenarán las filas.
 * @returns  {JSX.Element}
 */
export default function Header({
    datos, campos, orden, campoOrden, activarSeleccion, numDatos, numSeleccionados,
    setDatosSeleccionados, setDirOrden, setCampoOrden
}) {

    /**
     * @param {Event} e 
     */
    function seleccionarTodo(e) {
        if (e.target.checked) {
            setDatosSeleccionados([]);
        } else {
            setDatosSeleccionados(datos);
        }
    };

    /**
     * @param {String} campo ID del campo que permite ordenar las filas del datatable.
     */
    function cambiarOrden(campo) {
        if (campo == campoOrden) {
            setDirOrden((x) => {
                if (x == "asc") {
                    return "desc";
                } else {
                    return "asc";
                }
            });
        } else {
            setCampoOrden(campo);
            setDirOrden("asc");
        }  
    };

    return (
        <TableHead>
            <TableRow>
                {activarSeleccion ? (
                    <TableCell padding="checkbox">
                        <Checkbox
                            color="primary"
                            indeterminate={(numSeleccionados > 0) && (numSeleccionados < numDatos)}
                            checked={(numDatos > 0) && (numSeleccionados == numDatos)}
                            onChange={seleccionarTodo} />
                    </TableCell>
                ) : null}
                {campos.map((campo) => (
                    <TableCell
                        key={campo.id}
                        align="left"
                        onClick={() => (campo.ordenable ? cambiarOrden(campo.id) : null)}
                        sortDirection={(campoOrden == campo.id) ? orden : false} >
                        <TableSortLabel
                            active={campoOrden == campo.id}
                            direction={campoOrden == campo.id ? orden : "asc"}>
                            <b>{campo.label}</b>
                            {campoOrden == campo.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {orden == "desc" ? "sorted descending" : "sorted ascending"}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
};