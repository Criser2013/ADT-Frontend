import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { buscar } from "../../utils/Busqueda";
import { Button, IconButton, InputAdornment, Stack, TextField, Toolbar, Tooltip, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";


const valoresPredet = { busqueda: "" };

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
    const { getValues, control, handleSubmit, reset, setValue } = useForm({
        defaultValues: valoresPredet, mode: "onBlur"
    });
    const [searchParams, setSearchParams] = useSearchParams();
    const textoBusqueda = searchParams.get("buscar") || "";

    function manejadorBusqueda() {
        setSearchParams({ buscar: getValues("busqueda") });
    };

    /**
     * @param {Event} e 
     */
    function manejadorBtnEnter(e) {
        if (e.key == "Enter") {
            e.preventDefault();
            handleSubmit(manejadorBusqueda)();
        }
    };

    function manejadorBtnLimpiar() {
        setDatosVisibles(datos);
        setSearchParams({});
        reset(valoresPredet);
    };

    useEffect(() => {
        const texto = searchParams.get("buscar") || "";
        const res = buscar(datos, texto, camposBusqueda);
        setDatosVisibles(res);
        setValue("busqueda", texto);
    }, [searchParams, camposBusqueda, datos, setDatosVisibles, setValue]);

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
                                <CheckBoxIcon sx={{ marginLeft: 1.5, mr: 1.5 }} />
                                <b>{datosSeleccionados.length} {lblSeleccion}</b>
                            </span>
                        </Typography>
                        <Tooltip title={tooltipBtnAccion}>
                            <IconButton
                                onClick={() => manejadorBtnAccion(datosSeleccionados)}
                                sx={{ marginRight: 1 }} >
                                {iconoBtnAccion ? iconoBtnAccion : null}
                            </IconButton>
                        </Tooltip>
                    </Stack>
                ) : null}
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="stretch"
                    width="100%" >
                    <Controller
                        name="busqueda"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                onKeyUp={manejadorBtnEnter}
                                placeholder={lblBusqueda}
                                sx={{
                                    width: { xs: "90%", md: "95%" },
                                    "& .MuiOutlinedInput-root": {
                                        height: 56
                                    },
                                }}
                                slotProps={{
                                    input: {
                                        endAdornment:
                                            (textoBusqueda.length > 0) ? (
                                                <InputAdornment position="end">
                                                    <Tooltip title={t("txtVaciarBusq")}>
                                                        <IconButton onClick={manejadorBtnLimpiar}>
                                                            <ClearIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </InputAdornment>
                                            ) : null,
                                    },
                                }}
                            />
                        )}
                    />
                    <Tooltip title={t("txtAyudaBtnBuscar")}>
                        <Button
                            variant="contained"
                            onClick={handleSubmit(manejadorBusqueda)}
                            sx={{
                                width: { xs: "10%", md: "5%" },
                                height: 56,
                                minWidth: 56
                            }} >
                            <SearchIcon />
                        </Button>
                    </Tooltip>
                </Stack>
            </Stack>
        </Toolbar>);
};