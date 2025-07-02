import {
    Grid, Typography, TextField, Button, MenuItem, FormControl, FormGroup, FormControlLabel, InputLabel,
    Select, OutlinedInput, Box, Checkbox, Chip, Dialog, DialogContent, DialogActions, DialogTitle,
    FormHelperText
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SaveIcon from '@mui/icons-material/Save';
import dayjs from "dayjs";
import { COMORBILIDADES } from "../../../constants";
import { useState } from "react";
import { validarNombre, validarNumero, validarTelefono } from "../../utils/Validadores";
import { useDrive } from "../../contexts/DriveContext";
import { oneHotEncondingOtraEnfermedad } from "../../utils/TratarDatos";
import { useNavigate } from "react-router";

/**
 * Componente que representa el formularios para añadir/editar los datos de
 * un paciente.
 * @returns JSX.Element
 */
export default function FormAnadirPaciente({ setCargando, nombre = "", cedula = "", sexo = 2, telefono = "", fechaNacimiento = null, otrasEnfermedades = [], esAnadir = true }) {
    const drive = useDrive();
    const navigate = useNavigate();
    const [datos, setDatos] = useState({
        "nombre": nombre, "cedula": cedula, "sexo": sexo,
        "telefono": telefono, "fechaNacimiento": fechaNacimiento
    });
    const [comorActivadas, setComorActivadas] = useState(false);
    const [comorbilidades, setComorbilidades] = useState(otrasEnfermedades);
    const [errores, setErrores] = useState([
        { campo: "nombre", error: false, txt: "" },
        { campo: "cedula", error: false, txt: "" },
        { campo: "sexo", error: false, txt: "" },
        { campo: "telefono", error: false, txt: "" },
        { campo: "fecha", error: false, txt: "" },
        { campo: "comor", error: false, txt: "" },
    ]);
    const [modal, setModal] = useState({
        mostrar: false, txt: "", titulo: ""
    });
    const fechaActual = dayjs();
    const sexos = [{ texto: "Seleccione el sexo", val: 2 },
    { texto: "Masculino", val: 0 },
    { texto: "Femenino", val: 1 }];

    /**
     * Manejador de cambios en los campos de texto.
     * @param {Event} event 
     */
    const manejadorCambiosTxt = (event) => {
        setDatos({ ...datos, [event.target.name]: event.target.value });
    };

    /**
     * Manejador de cambios en el campo de fecha de nacimiento.
     * @param {dayjs} val - Fecha seleccionada.
     */
    const manejadorCambiosFecha = (val) => {
        setDatos({ ...datos, fechaNacimiento: val });
    };

    /**
     * Maneja los cambios en el campo de selección de comorbilidades.
     * @param {Event} event 
     */
    const manejadorCambiosComor = (event) => {
        setComorbilidades(event.target.value);
    };

    /**
     * Manejador del botón de cerrar en el modal.
     */
    const manejadorBtnModal = () => {
        setModal({ mostrar: false, txt: "", titulo: "" });
    };

    /**
     * Valida el campo que se indique, devuelve un JSON con el resultados.
     * @param {String} cod - Atributo "name" del campo que se está validando.
     * @returns JSON
     */
    const evaluarErrores = (cod) => {
        let res = { campo: cod, error: false, txt: "" };
        switch (true) {
            case (cod == "nombre" && !validarNombre(datos.nombre)):
                res = { error: true, txt: "Nombre inválido" };
                break;
            case (cod == "cedula" && (!validarNumero(datos.cedula) || datos.cedula.length < 6)):
                res = { error: true, txt: "Solo debes ingresar números" };
                break;
            case (cod == "fecha" && (datos.fechaNacimiento == null || datos.fechaNacimiento.isAfter(fechaActual))):
                res = { error: true, txt: "La fecha de nacimiento debe ser anterior a la fecha actual" };
                break;
            case (cod == "telefono" && !validarTelefono(datos.telefono)):
                res = { error: true, txt: "Solo debes ingresar números" };
                break;
            case (cod == "sexo" && datos.sexo > 1):
                res = { error: true, txt: "Selecciona el sexo del paciente" };
                break;
            case (cod == "comor" && (comorActivadas && comorbilidades.length == 0)):
                res = { error: true, txt: "Selecciona al menos un padecimiento" };
                break;
            default:
                break;
        }
        res["campo"] = cod;
        return res;
    };

    /**
     * Muestra un modal de error cuando los datos son inválidos.
     */
    const mostrarErrDatosInv = () => {
        setModal({
            mostrar: true, titulo: "Datos inválidos.",
            mensaje: "Los valores de algunos campos son inválidos."
        });
    };

    /**
     * Quita los errores de los campos en pantalla.
     */
    const limpiarErrores = () => {
        setErrores([
            { campo: "nombre", error: false, txt: "" },
            { campo: "cedula", error: false, txt: "" },
            { campo: "sexo", error: false, txt: "" },
            { campo: "telefono", error: false, txt: "" },
            { campo: "fecha", error: false, txt: "" },
            { campo: "comor", error: false, txt: "" }
        ]);
    };

    /**
     * Valida los datos ingresados por el usuario.
     */
    const validarDatos = () => {
        const errores = [];

        ["nombre", "cedula", "sexo", "telefono", "fecha", "comor"].forEach((x) => {
            errores.push(evaluarErrores(x));
        });

        const res = errores.every((x) => !x.error);
        setErrores(errores);

        return res;
    };

    /**
     * Manejador del botón de guardar.
     */
    const manejadorBtnGuardar = () => {
        limpiarErrores();
        const res = validarDatos();

        if (!res) {
            mostrarErrDatosInv();
        } else {
            setCargando(true);
            guardar();
        }
    };

    /**
     * Verifica que el paciente no esté ya registrado y guarda los datos en Google Drive.
     */
    const guardar = () => {
        const existe = drive.verificarExistePaciente(datos.cedula);
        if (existe) {
            setModal({
                mostrar: true,
                titulo: "Paciente ya registrado",
                mensaje: "El paciente ya se encuentra registrado en el sistema."
            });

            setCargando(false);
        } else {
            const oneHotComor = oneHotEncondingOtraEnfermedad(comorbilidades);
            const instancia = { ...datos, ...oneHotComor, otraEnfermedad: comorActivadas ? 1 : 0 };

            instancia.fechaNacimiento = datos.fechaNacimiento.format("DD-MM-YYYY");

            manejadorResGuardado(instancia);
        }
    };

    /**
     * Muestra el resultado del guardado del paciente.
     * @param {JSON} instancia - Datos del paciente.
     */
    const manejadorResGuardado = async (instancia) => {
        const res = await drive.anadirPaciente(instancia, !esAnadir);

        if (res.success) {
            navigate("/pacientes", { replace: true });
        } else {
            setModal({
                mostrar: true,
                titulo: "Error al añadir paciente",
                mensaje: res.error
            });
        }
        setCargando(false);
    };

    return (
        <>
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
                        value={datos.nombre}
                        onChange={manejadorCambiosTxt}
                        error={errores[0].error}
                        helperText={errores[0].txt}
                    />
                </Grid>
                <Grid size={1}>
                    <TextField
                        fullWidth
                        label="Número de cédula"
                        name="cedula"
                        value={datos.cedula}
                        onChange={manejadorCambiosTxt}
                        error={errores[1].error}
                        helperText={errores[1].txt}
                    />
                </Grid>
                <Grid size={1}>
                    <TextField
                        select
                        label="Sexo"
                        name="sexo"
                        value={datos.sexo}
                        onChange={manejadorCambiosTxt}
                        error={errores[2].error}
                        helperText={errores[2].txt}
                        fullWidth>
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
                        value={datos.telefono}
                        onChange={manejadorCambiosTxt}
                        error={errores[3].error}
                        helperText={errores[3].txt}
                    />
                </Grid>
                <Grid size={1}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Fecha de nacimiento"
                            disableFuture={true}
                            name="fechaNacimiento"
                            onChange={manejadorCambiosFecha}
                            slotProps={{
                                textField: {
                                    error: errores[4].error,
                                    helperText: errores[4].txt,
                                }
                            }}
                            sx={{ width: "100%" }} />
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
                            control={<Checkbox size="small" onChange={(e) => setComorActivadas(e.target.checked)} />}
                            label="El paciente padece otra enfermedad." />
                    </FormGroup>
                </Grid>
                {comorActivadas ? (<Grid size={2}>
                    <FormControl sx={{ width: "100%" }}>
                        <InputLabel id="comorbilidades-tag">Padecimiento(s) del paciente</InputLabel>
                        <Select
                            labelId="comorbilidades-tag"
                            multiple
                            value={comorbilidades}
                            onChange={manejadorCambiosComor}
                            fullWidth
                            name="comor"
                            error={errores[5].error}
                            input={<OutlinedInput id="select-multiple-chip" label="Padecimiento(s) del paciente" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} />
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
                        <FormHelperText error={errores[5].error}>{errores[5].txt}</FormHelperText>
                    </FormControl>
                </Grid>) : null}
                <Grid display="flex" justifyContent="center" size={12}>
                    <Button
                        startIcon={<SaveIcon />}
                        variant="contained"
                        onClick={manejadorBtnGuardar}
                        sx={{
                            textTransform: "none"
                        }}>
                        <b>Guardar</b>
                    </Button>
                </Grid>
            </Grid>
            <Dialog open={modal.mostrar}>
                <DialogTitle>{modal.titulo}</DialogTitle>
                <DialogContent>
                    <Typography>{modal.mensaje}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        variant="contained"
                        onClick={manejadorBtnModal}
                        sx={{ textTransform: "none" }}>
                        <b>Cerrar</b>
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};