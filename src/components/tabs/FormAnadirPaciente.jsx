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
import customParseFormat from 'dayjs/plugin/customParseFormat';
import SelectChip from "./SelectChip";
import CloseIcon from "@mui/icons-material/Close";
import ModalSimple from "../modals/ModalSimple";
import { Controller, useForm } from "react-hook-form";
import Check from "./Check";
import { v6 } from "uuid";

/**
 * Componente que representa el formularios para añadir/editar los datos de
 * un paciente.
 * @param {Array[JSON]} listadoPestanas - Lista de pestañas para el encabezado.
 * @param {String} id - ID del paciente.
 * @param {Boolean} esAnadir - Indica si es para añadir un nuevo paciente o editar uno existente.
 * @returns {JSX.Element}
 */
export default function FormAnadirPaciente({ listadoPestanas, titPestana, id = "", esAnadir = true }) {
    const drive = useDrive();
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState({
        mostrar: false, mensaje: "", titulo: ""
    });
    const fechaActual = useMemo(() => dayjs(), []);
    const sexos = useMemo(() => [
        { texto: "Seleccione el sexo", val: 2 },
        { texto: "Masculino", val: 0 },
        { texto: "Femenino", val: 1 }
    ], []);
    const { setValue, control, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            id: id, "nombre": "", "cedula": "", "sexo": 2, "telefono": "",
            "fechaNacimiento": null, fechaCreacion: null, otraEnfermedad: false,
            otrasEnfermedades: []
        }, mode: "onBlur"
    });
    const [prevCedula, setPrevCedula] = useState("");
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
        const res = await drive.cargarDatosPaciente(id);
        if (res.success) {
            dayjs.extend(customParseFormat);

            setPrevCedula(res.data.personales.cedula);
            setValue("id", res.data.personales.id);
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
        const { nombre, sexo, fechaNacimiento, telefono, cedula, otraEnfermedad, otrasEnfermedades, id } = datos;
        const oneHotComor = oneHotEncondingOtraEnfermedad(otraEnfermedad ? otrasEnfermedades : []);
        const instancia = {
            nombre, sexo, telefono, cedula, ...oneHotComor, otraEnfermedad: otraEnfermedad ? 1 : 0
        };

        dayjs.extend(customParseFormat);
        instancia.fechaNacimiento = fechaNacimiento.format("DD-MM-YYYY");
        if (esAnadir) {
            instancia.id = v6();
            instancia.fechaCreacion = dayjs().format("DD-MM-YYYY");
        } else {
            instancia.id = id;
            instancia.fechaCreacion = datos.fechaCreacion;
        }

        manejadorResGuardado(instancia, prevCedula);
    };

    /**
     * Muestra el resultado del guardado del paciente.
     * @param {JSON} instancia - Datos del paciente.
     * @param {String} cedula - Cédula del paciente.
     */
    const manejadorResGuardado = async (instancia, cedula) => {
        const res = await drive.anadirPaciente(instancia, !esAnadir, cedula);
        if (res.success) {
            navigate("/pacientes", { replace: true });
        } else {
            setModal({
                mostrar: true,
                titulo: "❌ Error al añadir paciente",
                mensaje: res.error
            });
            setCargando(false);
        }
    };

    return (
        <>
            {cargando ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="85vh">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <TabHeader
                        urlPredet="/pacientes"
                        titulo={titPestana}
                        pestanas={listadoPestanas}
                        tooltip="Volver a la pestaña de pacientes" />
                    <Grid container columns={2} spacing={1} rowSpacing={2} paddingTop="2vh" overflow="auto" paddingRight="0.5vw">
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
                                render={({ field }) => (
                                    <TextField
                                        fullWidth
                                        label="Nombre"
                                        {...field}
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
                                render={({ field }) => (
                                    <TextField
                                        fullWidth
                                        label="Número de cédula"
                                        {...field}
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
                                render={({ field }) => (
                                    <TextField
                                        select
                                        label="Sexo"
                                        {...field}
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
                                render={({ field }) => (
                                    <TextField
                                        fullWidth
                                        label="Teléfono"
                                        {...field}
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
                                    render={({ field }) => (
                                        <DatePicker
                                            label="Fecha de nacimiento"
                                            disableFuture={true}
                                            name="fechaNacimiento"
                                            onChange={field.onChange}
                                            value={field.value}
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
                                render={({ field }) => (
                                    <Check
                                        nombre="otraEnfermedad"
                                        etiqueta="El paciente padece otra enfermedad"
                                        activado={field.value}
                                        manejadorCambios={field.onChange} />)} />
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
                iconoBtn={<CloseIcon />}
                manejadorBtnModal={manejadorBtnModal}
            />
        </>
    );
};