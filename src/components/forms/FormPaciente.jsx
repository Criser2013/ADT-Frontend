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
import { oneHotEncoderOtraEnfermedad } from "../../utils/TratarDatos";
import { useNavigate } from "react-router";
import TabHeader from "../layout/TabHeader";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import SelectChip from "../tabs/SelectChip";
import CloseIcon from "@mui/icons-material/Close";
import ModalSimple from "../modals/ModalSimple";
import { Controller, useForm } from "react-hook-form";
import Check from "../tabs/Check";
import { v6 } from "uuid";
import { useTranslation } from "react-i18next";
import { useNavegacion } from "../../contexts/NavegacionContext";

/**
 * Componente que representa el formularios para añadir/editar los datos de
 * un paciente.
 * @param {Array[JSON]} listadoPestanas - Lista de pestañas para el encabezado.
 * @param {String} id - ID del paciente.
 * @param {Boolean} esAnadir - Indica si es para añadir un nuevo paciente o editar uno existente.
 * @returns {JSX.Element}
 */
export default function FormPaciente({ listadoPestanas, titPestana, id = "", esAnadir = true }) {
    const drive = useDrive();
    const navegacion = useNavegacion();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [cargando, setCargando] = useState(true);
    const [archivoDescargado, setArchivoDescargado] = useState(false);
    const [modal, setModal] = useState({
        mostrar: false, mensaje: "", titulo: ""
    });
    const fechaActual = useMemo(() => dayjs(), []);
    const sexos = useMemo(() => [
        { texto: t("txtSelecSexo"), val: 2 },
        { texto: t("txtMasculino"), val: 0 },
        { texto: t("txtFemenino"), val: 1 }
    ], [navegacion.idioma]);
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
        const descargar = sessionStorage.getItem("descargando-drive");
        if (drive.token != null && !esAnadir && (descargar == null || descargar == "false")) {
            sessionStorage.setItem("descargando-drive", "true");
            cargarDatos();
        }
    }, [drive.token]);

    useEffect(() => {
        setCargando(drive.descargando);
    }, [drive.descargando]);

    /**
     * Una vez se carguen los datos de los pacientes, se cargan los datos del paciente.
     */
    useEffect(() => {
        if (drive.datos != null && archivoDescargado) {
            cargarPaciente();
        }
    }, [drive.datos, archivoDescargado]);

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
    const cargarDatos = async () => {
        let res = await drive.cargarDatos();

        if (!res.success) {
            setModal({
                mostrar: true, mensaje: res.error,
                titulo: t("errTitCargarDatosPacientes")
            });
            return;
        }

        setArchivoDescargado(true);
    };

    /**
     * Carga los datos del paciente.
     */
    const cargarPaciente = () => {
        const res = drive.cargarDatosPaciente(id);
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
            navigate("/pacientes");
        }
    };

    /**
     * Manejador del botón de cerrar en el modal.
     */
    const manejadorBtnModal = () => {
        if (!archivoDescargado) {
            navigate("/pacientes");
        }
        setModal({ ...modal, mostrar: false });
    };

    /**
     * Verifica que el paciente no esté ya registrado y guarda los datos en Google Drive.
     */
    const guardar = (datos) => {
        const { nombre, sexo, fechaNacimiento, telefono, cedula, otraEnfermedad, otrasEnfermedades, id } = datos;
        const oneHotComor = oneHotEncoderOtraEnfermedad(otraEnfermedad ? otrasEnfermedades : []);
        const instancia = {
            id: null, cedula, nombre, sexo, fechaNacimiento: null, fechaCreacion: null,
            telefono, ...oneHotComor, otraEnfermedad: otraEnfermedad ? 1 : 0
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
            navigate("/pacientes");
        } else {
            setModal({
                mostrar: true, mensaje: res.error,
                titulo: t("errTitAnadirPaciente"),
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
                        tooltip={t("txtAtrasDatosPaciente")} />
                    <Grid container columns={2} spacing={1} rowSpacing={2} paddingTop="2vh" overflow="auto" paddingRight="0.5vw">
                        <Grid size={2}>
                            <Typography variant="h5">
                                <b>{t("titDatosPersonales")}</b>
                            </Typography>
                        </Grid>
                        <Grid size={2}>
                            <Controller
                                name="nombre"
                                control={control}
                                rules={{
                                    required: t("errCampoObligatorio"),
                                    validate: (x) => validarNombre(x) || t("errNombrePaciente")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        fullWidth
                                        label={t("txtNombre")}
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
                                    required: t("errCampoObligatorio"),
                                    validate: (x) => (validarNumero(x) && x.length > 6) || t("errCedula")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        fullWidth
                                        label={t("txtCedula")}
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
                                    required: t("errCampoObligatorio"),
                                    validate: (x) => x != 2 || t("errValidarSexo")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        label={t("txtCampoSexo")}
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
                                    required: t("errCampoObligatorio"),
                                    validate: (x) => validarTelefono(x) || t("errTelefono")
                                }}
                                render={({ field }) => (
                                    <TextField
                                        fullWidth
                                        label={t("txtTelefono")}
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
                                        required: t("errCampoObligatorio"),
                                        validate: (x) => (x != null && !x.isAfter(fechaActual)) || t("errFechaNacimiento")
                                    }}
                                    render={({ field }) => (
                                        <DatePicker
                                            label={t("txtFechaNacimiento")}
                                            disableFuture={true}
                                            name="fechaNacimiento"
                                            format={t("formatoCalendario")}
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
                                <b>{t("titComor")}</b>
                            </Typography>
                        </Grid>
                        <Grid size={2}>
                            <Controller
                                name="otraEnfermedad"
                                control={control}
                                render={({ field }) => (
                                    <Check
                                        nombre="otraEnfermedad"
                                        etiqueta={t("txtOtraEnfermedad")}
                                        activado={field.value}
                                        manejadorCambios={field.onChange} />)} />
                        </Grid>
                        {otraEnfermedad ? (
                            <Grid size={12}>
                                <Controller
                                    name="otrasEnfermedades"
                                    control={control}
                                    rules={{
                                        required: otraEnfermedad ? t("errComor") : false
                                    }}
                                    render={({ field }) => (
                                        <SelectChip
                                            valor={field.value}
                                            listaValores={COMORBILIDADES}
                                            manejadorCambios={field.onChange}
                                            nombre="otrasEnfermedades"
                                            error={!!errors.otrasEnfermedades}
                                            txtError={errors.otrasEnfermedades?.message}
                                            etiqueta={t("txtComorbilidades")}
                                        />)} />
                            </Grid>
                        ) : null}
                        <Grid display="flex" justifyContent="center" size={12}>
                            <Tooltip title={t("txtAyudaBtnGuardarPaciente")}>
                                <Button
                                    startIcon={<SaveIcon />}
                                    variant="contained"
                                    onClick={handleSubmit(onSubmit)}
                                    sx={{
                                        textTransform: "none"
                                    }}>
                                    <b>{t("txtBtnGuardar")}</b>
                                </Button>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </>)}
            <ModalSimple
                abrir={modal.mostrar}
                titulo={modal.titulo}
                mensaje={modal.mensaje}
                txtBtn={t("txtBtnCerrar")}
                iconoBtn={<CloseIcon />}
                manejadorBtnModal={manejadorBtnModal}
            />
        </>
    );
};