import { Box, Paper, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, TablePagination, TableSortLabel } from '@mui/material';
import { useState, useMemo } from 'react';
import { visuallyHidden } from '@mui/utils';
import { obtenerComparadorStrNum } from '../../utils/Ordernamiento';

/**
 * Datatable con paginación, ordenamiento y selección de filas.
 * @param {JSON} param0 - Propiedades del componente.
 * @param {Array[JSON]} campos - Lista de campos a motrar, debe ser un JSON con la estructura:
 * {
 *   id: "idCampo", // Identificador del campo - string
 *   label: "Nombre del campo" // Nombre del campo a mostrar - string
 * }
 * @param {Array[JSON]} datos - Lista de datos a mostrar, debe ser un JSON con la estructura: |
 * {
 *   id: Id del dato // Debe ser un identificador único - string o number
 *   campo1: <valor>
 *   campo2: <valor>,
 *   ...
 * @returns JSX.Element
 */
export default function Datatable({ campos, datos }) {
    const [orden, setOrden] = useState('asc');
    const [campoOrden, setCampoOrden] = useState(campos[0].id);
    const [numSeleccionados, setNumSeleccionados] = useState(0);
    const [seleccionados, setSeleccionados] = useState([]);
    const [pagina, setPagina] = useState(0);
    const [filasEnPagina, setFilasEnPagina] = useState(5);
    const filas = useMemo(() =>
        [...datos]
            .sort(obtenerComparadorStrNum(orden, campoOrden))
            .slice(pagina * filasEnPagina, pagina * filasEnPagina + filasEnPagina),
        [orden, campoOrden, pagina, filasEnPagina]);
    const numFilas = useMemo(() => datos.length, [datos]);
    const nombresCampos = useMemo(() => campos.map((campo) => campo.id), [campos]);
    const filasVacias = pagina > 0 ? Math.max(0, (1 + pagina) * filasEnPagina - datos.length) : 0;


    /**
     * Manejador de evento para seleccionar o deseleccionar todas las filas.
     * @param {Event} event 
     */
    const seleccionarTodo = (event) => {
        if (event.target.checked) {
            setNumSeleccionados(numFilas);
            setSeleccionados(datos.map((x) => x.id));
        } else {
            setNumSeleccionados(0);
            setSeleccionados([]);
        }
    };

    /**
     * Manejador de cambio de página en la tabla.
     * @param {Event} event 
     * @param {Int} pagina 
     */
    const cambiarPagina = (event, pagina) => {
        setPagina(pagina);
    };

    /**
     * Manejador de cambios de la cantidad de filas por página en la tabla.
     * @param {Event} event 
     */
    const cambiarFilasPorPagina = (event) => {
        setFilasEnPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    /**
     * Manejador de selección/deselección de una fila.
     * @param {Event} e 
     * @param {String|Number} id 
     */
    const seleccionarFila = (e, id) => {
        if (e.target.checked) {
            setNumSeleccionados((x) => x + 1);
            setSeleccionados((prev) => [...prev, id]);
        } else {
            setNumSeleccionados((x) => x - 1);
            setSeleccionados((prev) => prev.filter((x) => x != id));
        }
    };

    /**
     * Manejador de cambios de orden en la tabla.
     * @param {String} campo 
     */
    const cambiarOrden = (campo) => {
        if (campo == campoOrden && orden == "asc") {
            setOrden("desc");
        } else if (campo == campoOrden && orden == "desc") {
            setOrden("asc");
        } else {
            setCampoOrden(campo);
            setOrden("asc");
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size="medium">
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        color="primary"
                                        indeterminate={numSeleccionados > 0 && numSeleccionados < numFilas}
                                        checked={numFilas > 0 && numSeleccionados === numFilas}
                                        onChange={seleccionarTodo}
                                    />
                                </TableCell>
                                {campos.map((headCell) => (
                                    <TableCell
                                        key={headCell.nombre}
                                        align="left"
                                        onClick={() => cambiarOrden(headCell.id)}
                                        sortDirection={campoOrden === headCell.id ? orden : false}>
                                        <TableSortLabel
                                            active={campoOrden === headCell.id}
                                            direction={campoOrden === headCell.id ? orden : 'asc'}
                                        >
                                            {headCell.label}
                                            {campoOrden === headCell.id ? (
                                                <Box component="span" sx={visuallyHidden}>
                                                    {orden === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                                </Box>
                                            ) : null}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filas.map((x, index) => {
                                const estaSeleccionada = seleccionados.includes(x.id);
                                const labelId = `enhanced-table-checkbox-${index}`;
                                return (
                                    <TableRow
                                        hover
                                        onClick={() => console.log("clicqueada")}
                                        tabIndex={-1}
                                        key={x.id}
                                        selected={estaSeleccionada}
                                        sx={{ cursor: 'pointer' }}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                color="primary"
                                                checked={estaSeleccionada}
                                                onClick={(e) => seleccionarFila(e, x.id)}
                                                inputProps={{
                                                    'aria-labelledby': labelId,
                                                }}
                                            />
                                        </TableCell>
                                        {nombresCampos.map((y) => {
                                            return (
                                                <TableCell key={`${x.id}-${y}`}>
                                                    {x[y]}
                                                </TableCell>
                                            );
                                        })
                                        }
                                    </TableRow>
                                );
                            })}
                            {filasVacias > 0 && (
                                <TableRow
                                    style={{
                                        height: 53 * filasVacias,
                                    }}>
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={numFilas}
                    rowsPerPage={filasEnPagina}
                    page={pagina}
                    onPageChange={cambiarPagina}
                    onRowsPerPageChange={cambiarFilasPorPagina}
                />
            </Paper>
        </Box>
    );
};