import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from '@mui/icons-material/Save';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
    Grid, Typography, TextField, Button, MenuItem, Tooltip
} from "@mui/material";
import { Check } from "../tabs";
import { COMORBILIDADES } from "../../constants";
import { Controller, useForm } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { ModalSimple } from "../modals";
import { Paciente } from "../../models";
import { PantallaCarga, TabHeader } from "../layout";
import { SelectChip } from "../selects";
import { useCallback, useEffect, useState } from "react";
import { usePacientes } from "../../hooks";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { v6 } from "uuid";
import { validarNombre, validarNumero, validarTelefono } from "../../utils/Validadores";


/**
 * Componente que representa el formularios para añadir/editar los datos de
 * un paciente.
 * @param {Paciente|null} paciente Objeto Paciente a cargar en el formulario. Solo 
 * se provee si es para editar un paciente existente. Si es null, se asume que es para añadir 
 * un nuevo paciente.
 * @param {String} url URL de la ruta a la que se redirige al hacer click en el botón de retroceder.
 * @param {String} titulo Título de la pestaña actual
 * @param {Array<Object>} pestanas Lista de pestañas con objetos de la forma { texto: String, url: String }.
 * @param {String} tooltip Texto ayuda para el botón de retroceso.
 * @returns {JSX.Element}
 */
export default function FormPaciente({ url, titulo, pestanas, tooltip, paciente = null, esModificar = false }) {
    const navigate = useNavigate();
    const { anadirPaciente, editarPaciente } = usePacientes();
    const { t } = useTranslation();
    const { setValues, control, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            id: v6(), nombre: "", cedula: "", sexo: 2, telefono: "",
            fechaNacimiento: null, fechaCreacion: null, otraEnfermedad: false,
            comorbilidades: []
        }, mode: "onBlur"
    });
    const [cargando, setCargando] = useState(esModificar);
    const [modal, setModal] = useState({ mostrar: false, texto: "" });
    const fechaActual = dayjs();
    const otraEnfermedad = watch("otraEnfermedad");
    const sexos = [
        { texto: t("txtSelecSexo"), val: 2 },
        { texto: t("txtMasculino"), val: 0 },
        { texto: t("txtFemenino"), val: 1 }
    ];

    /**
     * @param {Paciente} paciente Objeto Paciente a cargar en el formulario.
     */
    const colocarDatosPaciente = useCallback((paciente) => {
        setValues({
            id: paciente.id,
            nombre: paciente.nombre,
            cedula: paciente.cedula,
            sexo: paciente.sexo,
            telefono: paciente.telefono,
            fechaNacimiento: paciente.fechaNacimientoFormateada,
            fechaCreacion: paciente.fechaCreacion,
            otraEnfermedad: paciente.otraEnfermedad,
            comorbilidades: paciente.comorbilidades
        });
    }, [setValues]);

    function cerrarModal() {
        setModal({ ...modal, mostrar: false });
    };

    /**
     * @param {Object} datos Objeto con los datos del paciente a guardar.
     */
    async function manejadorGuardado(datos) {
        setCargando(true);

        const { id, nombre, sexo, fechaNacimiento, telefono,
            cedula, otraEnfermedad, comorbilidades } = datos;
        const esModificar = paciente !== null;
        const instancia = new Paciente(
            esModificar ? paciente.id : id, cedula, nombre, sexo,
            fechaNacimiento.format("DD-MM-YYYY"), telefono,
            esModificar ? paciente.fechaCreacion : dayjs().format("DD-MM-YYYY"),
            otraEnfermedad ? 1 : 0, comorbilidades
        );

        const res = await (esModificar ? editarPaciente(paciente.id, instancia)
            : anadirPaciente(instancia));
        if (!res.success) {
            setModal({ mostrar: true, texto: t(res.error) });
            setCargando(false);
        } else {
            navigate("/pacientes");
        }
    };

    useEffect(() => {
        if (paciente) {
            colocarDatosPaciente(paciente);
            setCargando(false);
        }
    }, [colocarDatosPaciente, paciente, setCargando]);

    return cargando ? <PantallaCarga /> : (
        <>
            <TabHeader
                url={url}
                titulo={titulo}
                pestanas={pestanas}
                tooltip={tooltip}
                activarBtnAtras={true} />
            <Grid
                container
                columns={2}
                spacing={1}
                rowSpacing={2}
                paddingTop="2vh"
                overflow="auto"
                paddingRight="0.5vw">
                <Grid size={2}>
                    <Typography variant="h5" fontWeight="bold">
                        {t("titDatosPersonales")}
                    </Typography>
                </Grid>
                <Grid size={2}>
                    <Controller
                        name="nombre"
                        control={control}
                        rules={{
                            required: "errCampoObligatorio",
                            validate: (x) => validarNombre(x) || "errNombrePaciente"
                        }}
                        render={({ field }) => (
                            <TextField
                                fullWidth
                                label={t("txtNombre")}
                                {...field}
                                error={errors.nombre}
                                helperText={t(errors.nombre?.message)} />)} />
                </Grid>
                <Grid size={1}>
                    <Controller
                        name="cedula"
                        control={control}
                        rules={{
                            required: "errCampoObligatorio",
                            validate: (x) => (validarNumero(x) && x.length > 6) || "errCedula"
                        }}
                        render={({ field }) => (
                            <TextField
                                fullWidth
                                label={t("txtCedula")}
                                {...field}
                                error={errors.cedula}
                                helperText={t(errors.cedula?.message)} />)} />
                </Grid>
                <Grid size={1}>
                    <Controller
                        name="sexo"
                        control={control}
                        rules={{
                            required: "errCampoObligatorio",
                            validate: (x) => (x != 2) || "errValidarSexo"
                        }}
                        render={({ field }) => (
                            <TextField
                                select
                                label={t("txtCampoSexo")}
                                {...field}
                                error={errors.sexo}
                                helperText={t(errors.sexo?.message)}
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
                            required: "errCampoObligatorio",
                            validate: (x) => validarTelefono(x) || "errTelefono"
                        }}
                        render={({ field }) => (
                            <TextField
                                fullWidth
                                label={t("txtTelefono")}
                                {...field}
                                error={errors.telefono}
                                helperText={t(errors.telefono?.message)} />)} />
                </Grid>
                <Grid size={1}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Controller
                            name="fechaNacimiento"
                            control={control}
                            rules={{
                                required: "errCampoObligatorio",
                                validate: (x) => (x && !x.isAfter(fechaActual)) || "errFechaNacimiento"
                            }}
                            render={({ field }) => (
                                <DatePicker
                                    label={t("txtFechaNacimiento")}
                                    disableFuture={true}
                                    format={t("formatoCalendario")}
                                    onChange={field.onChange}
                                    value={field.value}
                                    slotProps={{
                                        textField: {
                                            error: !!errors.fechaNacimiento,
                                            helperText: t(errors.fechaNacimiento?.message),
                                        }
                                    }}
                                    sx={{ width: "100%" }} />)} />
                    </LocalizationProvider>
                </Grid>
                <Grid size={2}>
                    <Typography variant="h5" fontWeight="bold">
                        {t("titComor")}
                    </Typography>
                </Grid>
                <Grid size={2}>
                    <Controller
                        name="otraEnfermedad"
                        control={control}
                        render={({ field }) => (
                            <Check
                                etiqueta={t("txtOtraEnfermedad")}
                                marcado={field.value}
                                manejadorCambios={field.onChange} />)
                        } />
                </Grid>
                {otraEnfermedad ? (
                    <Grid size={12}>
                        <Controller
                            name="comorbilidades"
                            control={control}
                            rules={{
                                required: otraEnfermedad ? "errComor" : false
                            }}
                            render={({ field }) => (
                                <SelectChip
                                    valores={field.value}
                                    listaValores={COMORBILIDADES}
                                    etiqueta={t("txtComorbilidades")}
                                    manejadorCambios={field.onChange}
                                    error={errors.comorbilidades}
                                    txtError={t(errors.comorbilidades?.message)} />)} />
                    </Grid>
                ) : null}
                <Grid display="flex" justifyContent="center" size={12}>
                    <Tooltip title={t("txtAyudaBtnGuardarPaciente")}>
                        <Button
                            startIcon={<SaveIcon />}
                            variant="contained"
                            onClick={handleSubmit(manejadorGuardado)}
                            sx={{
                                textTransform: "none"
                            }}>
                            <b>{t("txtBtnGuardar")}</b>
                        </Button>
                    </Tooltip>
                </Grid>
            </Grid>
            <ModalSimple
                mostrar={modal.mostrar}
                titulo={t("tituloErr")}
                texto={modal.texto}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtn={cerrarModal}
                iconoBtn={<CloseIcon />} />
        </>
    );
};