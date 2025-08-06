import {
    Grid, Typography, TextField, Button, MenuItem, Box, Tooltip, CircularProgress
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SaveIcon from '@mui/icons-material/Save';
import dayjs from "dayjs";
import { COMORBILIDADES } from "../../../constants";
import { useState, useMemo, useEffect } from "react";
import { validarNombre, validarNumero, validarTelefono } from "../../utils/Validadores";
import { useDrive } from "../../contexts/DriveContext";
import { oneHotEncondingOtraEnfermedad } from "../../utils/TratarDatos";
import { useNavigate } from "react-router";
import TabHeader from "./TabHeader";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { detTamCarga } from "../../utils/Responsividad";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import SelectChip from "./SelectChip";
import ModalSimple from "../modals/ModalSimple";
import { Controller, useForm } from "react-hook-form";
import Check from "./Check";

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
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState({
        mostrar: false, mensaje: "", titulo: ""
    });
    const width = useMemo(() => {
        return detTamCarga(navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho);
    }, [navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho]);
    const fechaActual = useMemo(() => dayjs(), []);
    const sexos = useMemo(() => [
        { texto: "Seleccione el sexo", val: 2 },
        { texto: "Masculino", val: 0 },
        { texto: "Femenino", val: 1 }
    ], []);
    const { setValue, control, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            "nombre": "", "cedula": cedula, "sexo": 2, "telefono": "",
            "fechaNacimiento": null, fechaCreacion: null, otraEnfermedad: false,
            otrasEnfermedades: []
        }, mode: "onBlur"
    });
    const otraEnfermedad = watch("otraEnfermedad");

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
     * Maneja el envío del formulario.
     * @param {JSON} datos - Datos del formulario.
     */
    const onSubmit = (datos) => {
        setCargando(true);
        guardar(datos);
    };

    /**
     * Carga los datos del paciente a editar.
     */
    const cargarDatosPaciente = async () => {
        const res = await drive.cargarDatosPaciente(cedula);
        if (res.success) {
            dayjs.extend(customParseFormat);
            setValue("nombre", res.data.personales.nombre);
            setValue("cedula", res.data.personales.cedula);
            setValue("sexo", res.data.personales.sexo);
            setValue("telefono", res.data.personales.telefono);
            setValue("fechaNacimiento", dayjs(res.data.personales.fechaNacimiento, "DD-MM-YYYY"));
            setValue("fechaCreacion", res.data.personales.fechaCreacion);
            setValue("otraEnfermedad", res.data.comorbilidades.length > 0);
            setValue("otrasEnfermedades", res.data.comorbilidades);
        } else {
            navigate("/pacientes", { replace: true });
        }
    };

    /**
     * Manejador del botón de cerrar en el modal.
     */
    const manejadorBtnModal = () => {
        setModal({ ...modal, mostrar: false });
    };

    /**
     * Verifica que el paciente no esté ya registrado y guarda los datos en Google Drive.
     */
    const guardar = (datos) => {
        const { nombre, sexo, fechaNacimiento, telefono, cedula, otraEnfermedad, otrasEnfermedades } = datos;
        const oneHotComor = oneHotEncondingOtraEnfermedad(otraEnfermedad ? otrasEnfermedades : []);
        const instancia = {
            nombre, sexo, telefono, cedula, ...oneHotComor, otraEnfermedad: otraEnfermedad ? 1 : 0
        };

        dayjs.extend(customParseFormat);
        instancia.fechaNacimiento = fechaNacimiento.format("DD-MM-YYYY");
        if (esAnadir) {
            instancia.fechaCreacion = dayjs().format("DD-MM-YYYY");
        } else {
            instancia.fechaCreacion = datos.fechaCreacion;
        }

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
                    <Grid container columns={2} spacing={1} rowSpacing={2} paddingTop="2vh" overflow="auto" paddingRight="1vh">
                        <Grid size={2}>
                            <Typography variant="h5">
                                <b>Datos personales</b>
                            </Typography>
                        </Grid>
                        <Grid size={2}>
                            <Controller
                                name="nombre"
                                control={control}
                                rules={{
                                    required: "Ingresa el nombre del paciente",
                                    validate: (x) => validarNombre(x) || "Debes ingresar el nombre del paciente"
                                }}
                                render={({ x }) => (
                                    <TextField
                                        fullWidth
                                        label="Nombre"
                                        {...x}
                                        error={!!errors.nombre}
                                        helperText={errors.nombre?.message}
                                    />)} />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="cedula"
                                control={control}
                                rules={{
                                    required: "Ingresa la cédula del paciente",
                                    validate: (x) => (validarNumero(x) && x.length > 6) || "Debes ingresar un número de cédula válido"
                                }}
                                render={({ x }) => (
                                    <TextField
                                        fullWidth
                                        label="Número de cédula"
                                        {...x}
                                        error={!!errors.cedula}
                                        helperText={errors.cedula?.message}
                                    />)} />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="sexo"
                                control={control}
                                rules={{
                                    required: "Selecciona el sexo del paciente",
                                    validate: (x) => x != 2 || "Debes seleccionar el sexo del paciente"
                                }}
                                render={({ x }) => (
                                    <TextField
                                        select
                                        label="Sexo"
                                        {...x}
                                        error={!!errors.sexo}
                                        helperText={errors.sexo?.message}
                                        fullWidth>
                                        {sexos.map((x) => (
                                            <MenuItem key={x.val} value={x.val}>
                                                {x.texto}
                                            </MenuItem>
                                        ))}
                                    </TextField>)} />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="telefono"
                                control={control}
                                rules={{
                                    required: "Ingresa el teléfono del paciente",
                                    validate: (x) => validarTelefono(x) || "Debes ingresar un número de teléfono válido (entre 8 y 10 dígitos)."
                                }}
                                render={({ x }) => (
                                    <TextField
                                        fullWidth
                                        label="Teléfono"
                                        {...x}
                                        error={!!errors.telefono}
                                        helperText={errors.telefono?.message} />)} />
                        </Grid>
                        <Grid size={1}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Controller
                                    name="fechaNacimiento"
                                    control={control}
                                    rules={{
                                        required: "Selecciona la fecha de nacimiento del paciente",
                                        validate: (x) => (x != null && !x.isAfter(fechaActual)) || "La fecha de nacimiento debe ser anterior a la fecha actual"
                                    }}
                                    render={({ x }) => (
                                        <DatePicker
                                            label="Fecha de nacimiento"
                                            disableFuture={true}
                                            name="fechaNacimiento"
                                            onChange={x.onChange}
                                            value={x.value}
                                            slotProps={{
                                                textField: {
                                                    error: !!errors.fechaNacimiento,
                                                    helperText: errors.fechaNacimiento?.message,
                                                }
                                            }}
                                            sx={{ width: "100%" }} />)} />
                            </LocalizationProvider>
                        </Grid>
                        <Grid size={2}>
                            <Typography variant="h5">
                                <b>Condiciones médicas preexistentes</b>
                            </Typography>
                        </Grid>
                        <Grid size={2}>
                            <Controller
                                name="otraEnfermedad"
                                control={control}
                                render={({ x }) => (
                                    <Check
                                        nombre="otraEnfermedad"
                                        etiqueta="El paciente padece otra enfermedad"
                                        activado={x.value}
                                        manejadorCambios={x.onChange} />)} />
                        </Grid>
                        {otraEnfermedad ? (
                            <Grid size={12}>
                                <Controller
                                    name="otrasEnfermedades"
                                    control={control}
                                    rules={{
                                        required: otraEnfermedad ? "Selecciona al menos un padecimiento" : false
                                    }}
                                    render={({ field }) => (
                                        <SelectChip
                                            valor={field.value}
                                            listaValores={COMORBILIDADES}
                                            manejadorCambios={field.onChange}
                                            nombre="otrasEnfermedades"
                                            error={!!errors.otrasEnfermedades}
                                            txtError={errors.otrasEnfermedades?.message}
                                            etiqueta="Padecimiento(s) del paciente"
                                        />)} />
                            </Grid>
                        ) : null}
                        <Grid display="flex" justifyContent="center" size={12}>
                            <Tooltip title="Guarda los datos del paciente.">
                                <Button
                                    startIcon={<SaveIcon />}
                                    variant="contained"
                                    onClick={handleSubmit(onSubmit)}
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