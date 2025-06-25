import {
    Grid, Typography, TextField, Button, MenuItem, FormControl, FormGroup, FormControlLabel, InputLabel,
    Select, OutlinedInput, Box, Checkbox, Chip, Fab
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MenuLayout from "../components/layout/MenuLayout";
import TabHeader from "../components/tabs/TabHeader";
import SaveIcon from '@mui/icons-material/Save';
import dayjs from "dayjs";
import { COMORBILIDADES } from "../../constants";
import { useState } from "react";
import ClearIcon from '@mui/icons-material/Clear';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

export default function PruebaPage() {
    const [comorbilidades, setComorbilidades] = useState([]);
    const fechaActual = dayjs();

    const sexos = [{ texto: "Seleccione el sexo", val: 0 },
    { texto: "Masculino", val: 1 },
    { texto: "Femenino", val: 2 }];
    const listadoPestanas = [
        { texto: "Lista de pacientes", url: "/pacientes" },
        { texto: "Añadir paciente", url: "/pacientes/crear" }];

    /**
     * Maneja los cambios en el campo de selección de comorbilidades.
     * @param {Event} event 
     */
    const manejadorCambiosComor = (event) => {
        setComorbilidades(event.target.value);
    };

    /**
     * Manejador cuando el usuario hace clic en el botón de eliminar un chip de comorbilidad.
     * @param {String} comorbilidad - Nombre de la comorbilidad a eliminar
     */
    const manejadorBtnQuitarChip = (comorbilidad) => {
        const aux = comorbilidades.filter((x) => x !== comorbilidad);
        setComorbilidades(aux);
    };

    /**
     * Manejador de clic en el botón de pregunta.
     * @param {Event} e Evento del mouse
     */
    const manejadorBtnPregunta = (e) => {
        console.log("clickeado");
    };

    return (
        <MenuLayout>
            <TabHeader
                titulo="Añadir paciente"
                pestanas={listadoPestanas}
                tooltip="Volver a la pestaña de pacientes" />
            <Grid container columns={2} spacing={1} rowSpacing={2} paddingTop="2vh" overflow="auto">
                <Grid size={2}>
                    <Typography variant="h5">
                        <b>Datos personales</b>
                    </Typography>
                </Grid>
                <Grid size={2}>
                    <TextField
                        fullWidth
                        label="Nombre"
                        name="nombre"
                    />
                </Grid>
                <Grid size={1}>
                    <TextField
                        fullWidth
                        label="Número de cédula"
                        name="cedula"
                    />
                </Grid>
                <Grid size={1}>
                    <TextField
                        select
                        label="Sexo"
                        fullWidth
                        defaultValue={0}>
                        {sexos.map((x) => (
                            <MenuItem key={x.val} value={x.val}>
                                {x.texto}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid size={1}>
                    <TextField
                        fullWidth
                        name="telefono"
                        label="Teléfono"
                    />
                </Grid>
                <Grid size={1}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Fecha de nacimiento"
                            disableFuture={true}
                            
                            sx={{ width: "100%" }}
                        /* 
                        label="Fecha y hora de la reserva"
                                    name="fecha"
                                    error={setErrFecha}
                                    value={dayjs(reserva.fecha)}
                                    minDate={dayjs()}
                                    maxDate={dayjs().add(2, "days")}
                                    onChange={handleChangeFecha}
                                    timeSteps={{ hours: 1, minutes: 15 }}
                                    minTime={dayjs().set("hour", 9).set("minute", 0)}
                                    maxTime={dayjs().set("hour", 21).set("minute", 45)}
                                    slotProps={{
                                        textField: {
                                            helperText: errFecha ? "Debes seleccionar una fecha y hora futura." : ""
                                        },
                                    }}
                        */
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid size={2}>
                    <Typography variant="h5">
                        <b>Condiciones médicas preexistentes</b>
                    </Typography>
                </Grid>
                <Grid size={2}>
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox size="small" />}
                            label="El paciente padece otra enfermedad." />
                    </FormGroup>
                </Grid>
                <Grid size={2}>
                    <FormControl sx={{ width: "100%" }}>
                        <InputLabel id="comorbilidades-tag">Padecimiento(s) del paciente</InputLabel>
                        <Select
                            labelId="comorbilidades-tag"
                            multiple
                            value={comorbilidades}
                            onChange={manejadorCambiosComor}
                            fullWidth
                            input={<OutlinedInput id="select-multiple-chip" label="Padecimiento(s) del paciente" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} onDelete={() => manejadorBtnQuitarChip(value)} deleteIcon={<ClearIcon />} />
                                    ))}
                                </Box>
                            )}>
                            {COMORBILIDADES.map((x) => (
                                <MenuItem
                                    key={x}
                                    value={x}>
                                    {x}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid display="flex" justifyContent="center" size={12}>
                    <Button
                        startIcon={<SaveIcon />}
                        variant="contained"
                        sx={{
                            textTransform: "none"
                        }}>
                        <b>Guardar</b>
                    </Button>
                </Grid>
                <Grid display="flex" justifyContent="end" size={2}>
                    <Fab color="primary" onClick={manejadorBtnPregunta} aria-label="add">
                        <QuestionMarkIcon />
                    </Fab>
                </Grid>
            </Grid>
        </MenuLayout >
    );
};