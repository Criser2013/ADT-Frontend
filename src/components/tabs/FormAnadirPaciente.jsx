import {
    Grid, Typography, TextField, Button, MenuItem, FormGroup, FormControlLabel, Box, Checkbox,
    Tooltip, CircularProgress
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SaveIcon from '@mui/icons-material/Save';
import dayjs from "dayjs";
import { COMORBILIDADES } from "../../../constants";
import { useState, useMemo, useEffect } from "react";
import { validarNombre, validarNumero, validarTelefono } from "../../utils/Validadores";
import { useDrive } from "../../contexts/DriveContext";
import { oneHotEncondingOtraEnfermedad, validarArray } from "../../utils/TratarDatos";
import { useNavigate } from "react-router";
import TabHeader from "./TabHeader";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { detTamCarga } from "../../utils/Responsividad";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import SelectChip from "./SelectChip";
import ModalSimple from "../modals/ModalSimple";

/**
 * Componente que representa el formularios para añadir/editar los datos de
 * un paciente.
 * @param {Array[JSON]} listadoPestanas - Lista de pestañas para el encabezado.
 * @param {String} cedula - Cédula del paciente.
 * @param {Boolean} esAnadir - Indica si es para añadir un nuevo paciente o editar uno existente.
 * @returns JSX.Element
 */
export default function FormAnadirPaciente({ listadoPestanas, titPestana, cedula = "", esAnadir = true }) {
    const drive = useDrive();
    const navigate = useNavigate();
    const navegacion = useNavegacion();
    const [datos, setDatos] = useState({
        "nombre": "", "cedula": cedula, "sexo": 2,
        "telefono": "", "fechaNacimiento": null
    });
    const [cargando, setCargando] = useState(true);
    const [comorActivadas, setComorActivadas] = useState(false);
    const [comorbilidades, setComorbilidades] = useState([]);
    const [errores, setErrores] = useState([
        { campo: "nombre", error: false, txt: "" },
        { campo: "cedula", error: false, txt: "" },
        { campo: "sexo", error: false, txt: "" },
        { campo: "telefono", error: false, txt: "" },
        { campo: "fecha", error: false, txt: "" },
        { campo: "comor", error: false, txt: "" },
    ]);
    const [modal, setModal] = useState({
        mostrar: false, mensaje: "", titulo: ""
    });
    const width = useMemo(() => {
        return detTamCarga(navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho);
    }, [navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho]);
    const fechaActual = dayjs();
    const sexos = [{ texto: "Seleccione el sexo", val: 2 },
    { texto: "Masculino", val: 0 },
    { texto: "Femenino", val: 1 }];

    /**
     * Quita la pantalla de carga cuando se haya descargado el archivo de pacientes.
     */
    useEffect(() => {
        if (!drive.descargando && !esAnadir) {
            cargarDatosPaciente();
        }

        setCargando(drive.descargando);
    }, [drive.descargando]);

    /**
     * Carga los datos del paciente a editar.
     */
    const cargarDatosPaciente = async () => {
        const res = await drive.cargarDatosPaciente(cedula);
        if (res.success) {
            dayjs.extend(customParseFormat);
            setDatos({
                nombre: res.data.personales.nombre,
                cedula: res.data.personales.cedula,
                sexo: res.data.personales.sexo,
                telefono: res.data.personales.telefono,
                fechaNacimiento: dayjs(res.data.personales.fechaNacimiento, "DD-MM-YYYY"),
                fechaCreacion: res.data.personales.fechaCreacion
            });
            setComorActivadas(res.data.comorbilidades.length > 0);
            setComorbilidades(res.data.comorbilidades);
        } else {
            navigate("/pacientes", { replace: true });
        }
    };

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
        setModal({ ...modal, mostrar: false });
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
                res = { error: true, txt: "El número de teléfono debe contener entre 8 y 10 dígitos." };
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
            mostrar: true,
            titulo: "Datos inválidos.",
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
     * Manejador del botón de guardar.
     */
    const manejadorBtnGuardar = () => {
        limpiarErrores();
        const res = validarArray(
            ["nombre", "cedula", "sexo", "telefono", "fecha", "comor"],
            evaluarErrores,
            (x) => !x.error,
            setErrores
        );

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
        const oneHotComor = oneHotEncondingOtraEnfermedad(comorActivadas ? comorbilidades : []);
        const instancia = { ...datos, ...oneHotComor, otraEnfermedad: comorActivadas ? 1 : 0 };

        dayjs.extend(customParseFormat);
        instancia.fechaNacimiento = datos.fechaNacimiento.format("DD-MM-YYYY");
        instancia.fechaCreacion = dayjs().format("DD-MM-YYYY");
        manejadorResGuardado(instancia);
    };

    /**
     * Muestra el resultado del guardado del paciente.
     * @param {JSON} instancia - Datos del paciente.
     * @param {Boolean} esAnadir - Si es añadir o editar paciente.
     * @param {String} cedula - Cédula del paciente.
     */
    const manejadorResGuardado = async (instancia) => {
        const res = await drive.anadirPaciente(instancia, !esAnadir, cedula);
        if (res.success) {
            navigate("/pacientes", { replace: true });
        } else {
            setModal({
                mostrar: true,
                titulo: "Error al añadir paciente",
                mensaje: res.error
            });
            setCargando(false);
        }
    };

    return (
        <>
            {cargando ? (
                <Box display="flex" justifyContent="center" alignItems="center" width={width} height="85vh">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <TabHeader
                        urlPredet="/pacientes"
                        titulo={titPestana}
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
                                    value={datos.fechaNacimiento}
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
                                    control={<Checkbox checked={comorActivadas}
                                        size="medium"
                                        onChange={(e) => setComorActivadas(e.target.checked)} />}
                                    label="El paciente padece otra enfermedad." />
                            </FormGroup>
                        </Grid>
                        {comorActivadas ? (
                            <Grid size={12}>
                                <SelectChip
                                    valor={comorbilidades}
                                    listaValores={COMORBILIDADES}
                                    manejadorCambios={manejadorCambiosComor}
                                    nombre="comor"
                                    error={errores[5].error}
                                    txtError={errores[5].txt}
                                    etiqueta="Padecimiento(s) del paciente"
                                />
                            </Grid>
                        ) : null}
                        <Grid display="flex" justifyContent="center" size={12}>
                            <Tooltip title="Guarda los datos del paciente.">
                                <Button
                                    startIcon={<SaveIcon />}
                                    variant="contained"
                                    onClick={manejadorBtnGuardar}
                                    sx={{
                                        textTransform: "none"
                                    }}>
                                    <b>Guardar</b>
                                </Button>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </>)}
            <ModalSimple
                abrir={modal.mostrar}
                titulo={modal.titulo}
                mensaje={modal.mensaje}
                txtBtn="Cerrar"
                manejadorBtnModal={manejadorBtnModal}
            />
        </>
    );
};