import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";

import { buscar } from "../../utils/Busqueda";
import { IconButton, InputAdornment, Stack, TextField, Toolbar, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Cuadro de búsqueda del componente Datatable.
 * @param {Array<Object>} datos Arreglo de datos a buscar.
 * @param {Array} datosSeleccionados Arreglo de datos seleccionados.
 * @param {Array<String>} camposBusqueda Arreglo de campos en los que buscar.
 * @param {String} lblSeleccion Etiqueta para mostrar el número de datos seleccionados.
 * @param {String} lblBusqueda Etiqueta para el campo de búsqueda.
 * @param {String} tooltipBtnAccion Tooltip para el botón de acción.
 * @param {Function} manejadorBtnAccion Manejador del botón de acción.
 * @param {import("react").SetStateAction} setDatosVisibles Setter para actualizar los datos visibles en el Datatable.
 * @param {JSX.Element} iconoBtnAccion Icono para el botón de acción.
 * @returns {JSX.Element}
 */
export default function CuadroBusqueda({
    datos, datosSeleccionados, camposBusqueda, lblSeleccion, lblBusqueda,
    tooltipBtnAccion, manejadorBtnAccion, setDatosVisibles, iconoBtnAccion
}) {
    const { t } = useTranslation();
    const [txtBusqueda, setTxtBusqueda] = useState("");

    /**
     * Manejador de cambios en el campo de búsqueda. Realiza la búsqueda y actualiza los datos 
     * mientras el usuario escribe.
     * @param {Event} e 
     */
    function manejadorBusqueda(e) {
        const texto = e.target.value;
        setTxtBusqueda(texto);
        const res = buscar(datos, texto, camposBusqueda);
        setDatosVisibles(res);
    };

    function manejadorBtnLimpiar() {
        setTxtBusqueda("");
        setDatosVisibles(datos);
        document.getElementsByName("busq")[0].value = "";;
    };

    return (
        <Toolbar
            sx={{ padding: "2vh 0vw" }}>
            <Stack
                direction="column"
                display="flex"
                spacing={2}
                width="100%"
                alignItems="center">
                {(datosSeleccionados.length > 0) ? (
                    <Stack
                        direction="row"
                        display="flex"
                        width="100%"
                        justifyContent="space-between"
                        alignItems="center">
                        <Typography
                            sx={{ flex: "1 1 100%" }}
                            color="inherit"
                            variant="body1"
                            component="div">
                            <span style={{ display: "flex", alignItems: "center" }}>
                                <CheckBoxIcon sx={{ mr: 1.5 }} />
                                <b>{datosSeleccionados.length} {lblSeleccion}</b>
                            </span>
                        </Typography>
                        <Tooltip title={tooltipBtnAccion}>
                            <IconButton onClick={() => manejadorBtnAccion(datosSeleccionados)}>
                                {iconoBtnAccion ? iconoBtnAccion : null}
                            </IconButton>
                        </Tooltip>
                    </Stack>
                ) : null}
                <TextField
                    name="busq"
                    defaultValue={txtBusqueda}
                    placeholder={lblBusqueda}
                    onChange={manejadorBusqueda}
                    sx={{
                        width: { xs: "90%", md: "100%" },
                        paddingTop: (datosSeleccionados.length > 0) ? "0vh" : "1vh"
                    }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: (txtBusqueda.length > 0) ? (
                                <InputAdornment position="end">
                                    <Tooltip title={t("txtVaciarBusq")}>
                                        <IconButton onClick={manejadorBtnLimpiar}>
                                            <ClearIcon />
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                            ) : null
                        }
                    }}
                />
            </Stack>
        </Toolbar>);
};