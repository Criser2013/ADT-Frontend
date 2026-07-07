import {
    Box, Paper, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, TablePagination, TableSortLabel, TextField, Typography, InputAdornment,
    Toolbar, IconButton, Stack, Tooltip
} from "@mui/material";
import CuadroBusqueda from "./CuadroBusqueda";
import Fila from "./Fila";
import Header from "./Header";

import { useState, useMemo, useEffect } from "react";
import { obtenerComparadorStrNum } from "../../utils/Ordenamiento";

import { t } from "i18next";

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
 * @param {String|null} campoOrdenInicial - Campo por el cual se ordenarán inicialmente los datos.
 * @param {String} dirOrden - Dirección del orden inicial ("asc" o "desc").
 * @param {Boolean} cargarInfoToda - Si se cargan todos los datos al seleccionar todos las filas o solo el campo establecido en el parámetro campoId.
 * @returns {JSX.Element}
 */
export default function Datatable({ campos, datos, lblSeleccion, campoId = "id", lblBusq = "", activarBusqueda = false,
    activarSeleccion = true, camposBusq = [], cbClicCelda = null, cbAccion = null, icono = null, tooltipAccion = "",
    campoOrdenInicial = null, dirOrden = "desc", cargarInfoToda = false }) {
    const [orden, setOrden] = useState(dirOrden);
    const [campoOrden, setCampoOrden] = useState(campoOrdenInicial != null ? campoOrdenInicial : campos[0].id);
    const [numSeleccionados, setNumSeleccionados] = useState(0);
    const [seleccionados, setSeleccionados] = useState([]);
    const [pagina, setPagina] = useState(0);
    const [filasEnPagina, setFilasEnPagina] = useState(5);
    const [auxDatos, setAuxDatos] = useState(datos);
    const [modoSeleccion, setModoSeleccion] = useState(false);
    const filas = useMemo(() =>
        [...auxDatos]
            .sort(obtenerComparadorStrNum(orden, campoOrden))
            .slice(pagina * filasEnPagina, pagina * filasEnPagina + filasEnPagina),
        [auxDatos, orden, campoOrden, pagina, filasEnPagina]);
    const numFilas = useMemo(() => auxDatos.length, [auxDatos]);
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
            setSeleccionados((prev) => [...prev, cargarInfoToda ? auxDatos.find((x) => x[campoId] == id) : id]);
        } else {
            setNumSeleccionados((x) => x - 1);
            setSeleccionados((prev) => prev.filter((x) => cargarInfoToda ? x[campoId] != id : x != id));
        }
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
                    <CuadroBusqueda
                        datos={auxDatos}
                        datosSeleccionados={seleccionados}
                        camposBusqueda={camposBusq}
                        lblSeleccion={lblSeleccion}
                        lblBusq={lblBusq}
                        tooltipBtnAccion={tooltipAccion}
                        manejadorBtnAccion={cbAccion}
                        setDatosVisibles={setAuxDatos} />
                ) : null}
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size="medium">
                        <Header
                            datos={datos}
                            campos={campos}
                            orden={orden}
                            campoOrden={campoOrden}
                            activarSeleccion={activarSeleccion}
                            numDatos={datos.length}
                            numSeleccionados={seleccionados.length}
                            setDatosSeleccionados={setSeleccionados}
                            setDirOrden={setOrden}
                            setCampoOrden={setCampoOrden} />
                        <TableBody>
                            {(auxDatos.length == 0) ? (
                                <TableRow>
                                    <Typography
                                        variant="body2"
                                        align="center" component="th"
                                        width="100%" colSpan={campos.length + 1}
                                        sx={{ padding: "10vh 0vw" }}>
                                        {t("txtNoDatosTabla")}
                                    </Typography>
                                </TableRow>
                            ) : null}
                            {filas.map((x) => (
                                <Fila
                                    key={x[campoId]}
                                    datos={x}
                                    datosSeleccionados={seleccionados}
                                    campoId={campoId}
                                    activarSeleccion={activarSeleccion}
                                    manejadorClicCelda={manejadorClicCelda}
                                    manejadorClicSeleccion={seleccionarFila}
                                    campos={campos} />
                            ))}
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
                    labelRowsPerPage={t("txtFilasPorPag")}
                    labelDisplayedRows={({ from, to, count }) => t("txtPagina", { from: from, to: to, count: (count !== -1) ? count : t("txtPagina2", { to: to }) })}
                />
            </Paper>
        </Box>
    );
};