import CuadroBusqueda from "./CuadroBusqueda";
import Fila from "./Fila";
import Header from "./Header";
import {
    Box, Paper, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, TablePagination, TableSortLabel, TextField, Typography, InputAdornment,
    Toolbar, IconButton, Stack, Tooltip
} from "@mui/material";
import { obtenerComparadorStrNum } from "../../utils/Ordenamiento";
import { useState, useMemo, useEffect } from "react";
import { t } from "i18next";

/**
 * Datatable con paginación, ordenamiento y selección de filas.
 * @param {Array<Object>} datos Lista de datos a mostrar, debe tener un atributo o campo que sirva 
 * como identificador único de cada fila.
 * @param {Array<Object>} campos Lista de campos a motrar, debe ser un JSON con la estructura:
 * - id (String): Identificador del campo.
 * - label (String): Etiqueta del campo.
 * - componente (JSX.Element|null): Componente para renderizar el campo. Si es null, se mostrará 
 * el valor del campo directamente.
 * @param {String} campoId Nombre del campo que se usará como identificador único de cada fila.
 * @param {String} lblBusqueda Texto del placeholder del campo de búsqueda.
 * @param {String} lblSeleccion Texto a mostrar cuando hay filas seleccionadas.
 * @param {String} tooltipBtnAccion Tooltip del botón de acción de selección de filas.
 * @param {Boolean} activarBusqueda Indicador para activar el campo de búsqueda.
 * @param {Boolean} activarSeleccion Indicador para activar el modo de selección de filas.
 * @param {Array<String>} camposBusqueda Lista de campos en los que se buscará el término ingresado.
 * @param {String} campoOrdenInicial Campo por el cual se ordenarán los datos inicialmente.
 * @param {String} direccionOrdenInicial Dirección del orden inicial ("asc" o "desc").
 * @param {Function} callbackClicCelda Callback para ejecutar una acción cuando se hace clic en una 
 * celda de la tabla.
 * @param {Function} callbackBtnAccion Callback para ejecutar una acción cuando se hace clic en el 
 * botón de acción de selección de filas.
 * @param {JSX.Element} icono Icono a mostrar en el botón de acción de selección de filas.
 * @returns {JSX.Element}
 */
export default function Datatable({ 
    datos, campos, campoId = "id", lblBusqueda = "", lblSeleccion, tooltipBtnAccion = "", activarBusqueda = true,
    activarSeleccion = true, camposBusqueda = [], campoOrdenInicial = "id", direccionOrdenInicial = "desc",
    callbackClicCelda = null, callbackBtnAccion = null, icono = null
}) {

    const [auxDatos, setAuxDatos] = useState(datos);
    const [campoOrden, setCampoOrden] = useState(campoOrdenInicial ? campoOrdenInicial : campos[0].id);
    const [filasEnPagina, setFilasEnPagina] = useState(5);
    const [modoSeleccion, setModoSeleccion] = useState(false);
    const [orden, setOrden] = useState(direccionOrdenInicial);
    const [pagina, setPagina] = useState(0);
    const [seleccionados, setSeleccionados] = useState([]); 
    const filas = useMemo(() =>
        [...auxDatos]
            .sort(obtenerComparadorStrNum(orden, campoOrden))
            .slice(pagina * filasEnPagina, pagina * filasEnPagina + filasEnPagina),
        [auxDatos, orden, campoOrden, pagina, filasEnPagina]);
    const filasVacias = (pagina > 0) ? Math.max(0, (1 + pagina) * filasEnPagina - datos.length) : 0;

    useEffect(() => {
        if (seleccionados.length > 0) {
            setModoSeleccion(true);
        } else {
            setModoSeleccion(false);
        }

    }, [seleccionados, setModoSeleccion]);

    useEffect(() => {
        setAuxDatos([...datos]);
    }, [datos]);

    /**
     * @param {Number} pagina Número de página a mostrar.
     */
    function manejadorBtnCambiarPagina(pagina) {
        setPagina(pagina);
    };

    /**
     * @param {Event} e 
     */
    function manejadorBtnCambiarFilasPorPagina(e) {
        setFilasEnPagina(parseInt(e.target.value, 10));
        setPagina(0);
    };

    /**
     * @param {Event} e 
     * @param {Object} instancia Datos de la instancia seleccionada/deseleccionada.
     */
    function manejadorBtnSeleccionarFila(e, instancia) {
        if (e.target.checked) {
            setSeleccionados((prev) => [...prev, instancia]);
        } else {
            setSeleccionados((prev) => prev.filter((x) => x.id != instancia));
        }
    };

    /**
     * @param {Event} e
     * @param {Object} instancia Datos de la instancia a la que se hizo clic.
     */
    function manejadorClicCelda(e, instancia) {
        if (modoSeleccion) {
            const estaSeleccionado = seleccionados.includes(instancia);
            manejadorBtnSeleccionarFila({ target: { checked: !estaSeleccionado } }, instancia);
        } else if (!modoSeleccion && callbackClicCelda) {
            callbackClicCelda(instancia);
        }
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Paper sx={{ width: "100%", mb: 2 }}>
                {((seleccionados.length > 0) || activarBusqueda) ? (
                    <CuadroBusqueda
                        datos={datos}
                        datosSeleccionados={seleccionados}
                        camposBusqueda={camposBusqueda}
                        lblSeleccion={lblSeleccion}
                        lblBusqueda={lblBusqueda}
                        tooltipBtnAccion={tooltipBtnAccion}
                        manejadorBtnAccion={callbackBtnAccion}
                        setDatosVisibles={setAuxDatos}
                        iconoBtnAccion={icono} />
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
                            setdireccionOrdenInicial={setOrden}
                            setCampoOrden={setCampoOrden} />
                        <TableBody>
                            {filas.map((x) => (
                                <Fila
                                    key={x[campoId]}
                                    campos={campos}
                                    datos={x}
                                    datosSeleccionados={seleccionados}
                                    campoId={campoId}
                                    activarSeleccion={activarSeleccion}
                                    manejadorClicCelda={manejadorClicCelda}
                                    manejadorClicSeleccion={manejadorBtnSeleccionarFila} />
                            ))}
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
                            {(filasVacias > 0) && (
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
                    count={datos.length}
                    rowsPerPage={filasEnPagina}
                    page={pagina}
                    onPageChange={manejadorBtnCambiarPagina}
                    onRowsPerPageChange={manejadorBtnCambiarFilasPorPagina}
                    labelRowsPerPage={t("txtFilasPorPag")}
                    labelDisplayedRows={({ from, to, count }) => (
                        t("txtPagina", {
                            from: from, to: to, 
                            count: (count != -1) ? count : t("txtPagina2", { to: to }) })
                    )} />
            </Paper>
        </Box>
    );
};