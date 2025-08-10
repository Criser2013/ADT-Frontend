import {
    Box, Paper, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, TablePagination, TableSortLabel, TextField, Typography, InputAdornment,
    Toolbar, IconButton, Stack, Tooltip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useState, useMemo, useEffect } from "react";
import { visuallyHidden } from "@mui/utils";
import { obtenerComparadorStrNum } from "../../utils/Ordenamiento";
import { buscar } from "../../utils/Busqueda";
import { useNavegacion } from "../../contexts/NavegacionContext";

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
 * @param {String} lblSeleccion - Texto del botón de selección de filas.
 * @param {String} campoId - Nombre del campo que se usará como identificador único de cada fila.
 * @param {String} lblBusq - Texto del placeholder del campo de búsqueda.
 * @param {Boolean} activarBusqueda - Si se muestra el campo de búsqueda.
 * @param {Boolean} activarSeleccion - Si se activa el modo de selección de filas.
 * @param {String} terminoBusqueda - Valor inicial del campo de búsqueda.
 * @param {Array[String]} camposBusq - Lista de campos en los que se buscará el término ingresado.
 * @param {Function} cbClicCelda - Callback para manejar el clic en una
 * @param {Function} cbAccion - Callback para manejar la acción del botón de selección de filas.
 * @param {JSX.Element} icono - Icono a mostrar en el botón de acción de selección de filas.
 * @param {String} tooltipAccion - Texto del tooltip del botón de acción de selección de filas.
 * @returns JSX.Element
 */
export default function Datatable({ campos, datos, lblSeleccion, campoId = "id", lblBusq = "", activarBusqueda = false,
    activarSeleccion = true, terminoBusqueda = "", camposBusq = [], cbClicCelda = null, cbAccion = null, icono = null, tooltipAccion = "" }) {
    const navegacion = useNavegacion();
    const [orden, setOrden] = useState("desc");
    const [campoOrden, setCampoOrden] = useState(campos[0].id);
    const [numSeleccionados, setNumSeleccionados] = useState(0);
    const [seleccionados, setSeleccionados] = useState([]);
    const [pagina, setPagina] = useState(0);
    const [filasEnPagina, setFilasEnPagina] = useState(5);
    const [busqueda, setBusqueda] = useState(terminoBusqueda);
    const [auxDatos, setAuxDatos] = useState(datos);
    const [modoSeleccion, setModoSeleccion] = useState(false);
    const padding = useMemo(() => {
        return !modoSeleccion ? "1vh" : "0vh";
    }, [modoSeleccion]);
    const filas = useMemo(() =>
        [...auxDatos]
            .sort(obtenerComparadorStrNum(orden, campoOrden))
            .slice(pagina * filasEnPagina, pagina * filasEnPagina + filasEnPagina),
        [auxDatos, orden, campoOrden, pagina, filasEnPagina]);
    const numFilas = useMemo(() => auxDatos.length, [auxDatos]);
    const nombresCampos = useMemo(() => campos.map((campo) => campo.id), [campos]);
    const compsCampos = useMemo(() => {
        const aux = {};
        campos.forEach((campo) => {
            aux[campo.id] = campo.componente;
        });
        return aux;
    }, [campos]);
    const tamCampoBusq = useMemo(() => {
        return (navegacion.dispositivoMovil && navegacion.orientacion != "horizontal") ? "90%" : "100%";
    }, [navegacion.dispositivoMovil, navegacion.orientacion]);
    const indeterminado = useMemo(() => numSeleccionados > 0 && (numSeleccionados < numFilas || numSeleccionados < datos.length),
        [numSeleccionados, numFilas, datos.length]);
    const seleccionTodos = useMemo(() => numFilas > 0 && (numSeleccionados === numFilas || numSeleccionados === datos.length),
        [numSeleccionados, numFilas, datos.length]);
    const filasVacias = pagina > 0 ? Math.max(0, (1 + pagina) * filasEnPagina - datos.length) : 0;

    /**
     * Activando el modo de selección si hay filas seleccionadas.
     */
    useEffect(() => {
        if (numSeleccionados > 0) {
            setModoSeleccion(true);
        } else {
            setModoSeleccion(false);
        }

    }, [numSeleccionados]);

    /**
     * Actualizando los datos auxiliares cuando cambian los datos originales.
     */
    useEffect(() => {
        setAuxDatos(datos);
    }, [datos]);

    /**
     * Manejador de evento para seleccionar o deseleccionar todas las filas.
     * @param {Event} event 
     */
    const seleccionarTodo = (event) => {
        if (event.target.checked) {
            setNumSeleccionados(numFilas);
            setSeleccionados(auxDatos.map((x) => x[campoId]));
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

    /**
     * Manejador de cambios en el campo de búsqueda.
     * @param {Event} e 
     */
    const manejadorBusqueda = (e) => {
        setBusqueda(e.target.value);
        setAuxDatos(
            ((e.target.value.length > 0) && (camposBusq.length > 0)) ? buscar(datos, e.target.value, camposBusq) : datos);
    };

    /**
     * Manejador del botón de limpiar búsqueda.
     */
    const manejadorBtnLimpiarBusq = () => {
        setPagina(0);
        setAuxDatos(datos);
        setBusqueda("");
        document.getElementsByName("busq")[0].value = "";
    };

    /**
     * Manejador de clic en una celda de la tabla.
     * @param {Event} e - Evento de clic.
     * @param {JSON} instancia - Instancia de fila de datos.
     */
    const manejadorClicCelda = (e, instancia) => {
        if (cbClicCelda != null && !modoSeleccion && e.target.checked == undefined) {
            cbClicCelda(instancia);
        } else if (modoSeleccion && e.target.checked == undefined) {
            const id = !seleccionados.includes(instancia[campoId]);
            seleccionarFila({ target: { checked: id } }, instancia[campoId]);
        }
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Paper sx={{ width: "100%", mb: 2 }}>
                {(numSeleccionados > 0 || activarBusqueda) ? (
                    <Toolbar
                        sx={{ padding: "1vh 0vw" }}>
                        <Stack
                            direction="column"
                            display="flex"
                            spacing={2}
                            width="100%"
                            alignItems="center">
                            {numSeleccionados > 0 ? (
                                <Stack direction="row" display="flex" width="100%" justifyContent="space-between" alignItems="center">
                                    <Typography
                                        sx={{ flex: "1 1 100%" }}
                                        color="inherit"
                                        variant="body1"
                                        component="div">
                                            <span style={{ display: "flex", alignItems: "center" }}>
                                                <CheckBoxIcon sx={{ mr: 1.5 }} />
                                                <b>{numSeleccionados} {lblSeleccion}</b>
                                            </span>
                                    </Typography>
                                    <Tooltip title={tooltipAccion}>
                                        <IconButton onClick={(e) => cbAccion(seleccionados, e)}>
                                            {icono ? icono : null}
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            ) : null}
                            <TextField
                                name="busq"
                                placeholder={lblBusq}
                                defaultValue={terminoBusqueda}
                                onChange={manejadorBusqueda}
                                sx={{ width: tamCampoBusq, paddingTop: padding }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (busqueda.length > 0) ? (
                                            <InputAdornment position="end">
                                                <Tooltip title="Limpiar cuadro de búsqueda">
                                                    <IconButton onClick={manejadorBtnLimpiarBusq}>
                                                        <ClearIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </InputAdornment>
                                        ) : null
                                    }
                                }}
                            />
                        </Stack>
                    </Toolbar>) : null}
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size="medium">
                        <TableHead>
                            <TableRow>
                                {activarSeleccion ? (
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            indeterminate={indeterminado}
                                            checked={seleccionTodos}
                                            onChange={seleccionarTodo}
                                        />
                                    </TableCell>
                                ) : null}
                                {campos.map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        align="left"
                                        onClick={() => (headCell.ordenable ? cambiarOrden(headCell.id) : null)}
                                        sortDirection={campoOrden === headCell.id ? orden : false}>
                                        <TableSortLabel
                                            active={headCell.ordenable ? (campoOrden === headCell.id) : false}
                                            direction={campoOrden === headCell.id ? orden : "asc"}>
                                            <b>{headCell.label}</b>
                                            {campoOrden === headCell.id ? (
                                                <Box component="span" sx={visuallyHidden}>
                                                    {orden === "desc" ? "sorted descending" : "sorted ascending"}
                                                </Box>
                                            ) : null}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filas.length == 0 ? (
                                <TableRow>
                                    <Typography
                                        variant="body2"
                                        align="center" component="th"
                                        width="100%" colSpan={campos.length + 1}
                                        sx={{ padding: "10vh 0vw" }}>
                                        {busqueda.length > 0 ? "No se encontraron resultados para la búsqueda." : "No hay datos para mostrar."}
                                    </Typography>
                                </TableRow>
                            ) : null}
                            {filas.map((x, i) => {
                                const estaSeleccionada = seleccionados.includes(x[campoId]);
                                const labelId = `enhanced-table-checkbox-${i}`;
                                return (
                                    <TableRow
                                        hover
                                        onClick={(e) => manejadorClicCelda(e, x)}
                                        tabIndex={-1}
                                        key={x[campoId]}
                                        selected={estaSeleccionada}
                                        sx={{ cursor: cbClicCelda != null ? "pointer" : "default" }}>
                                        {activarSeleccion ? (
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    color="primary"
                                                    checked={estaSeleccionada}
                                                    onClick={(e) => seleccionarFila(e, x[campoId])}
                                                    inputProps={{
                                                        "aria-labelledby": labelId,
                                                    }}
                                                />
                                            </TableCell>) : null}
                                        {nombresCampos.map((y) => {
                                            return (
                                                <TableCell key={`${x.id}-${y}`}>
                                                    {compsCampos[y] ? compsCampos[y](x) : x[y]}
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
                    labelRowsPerPage="Filas por página"
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
                />
            </Paper>
        </Box>
    );
};