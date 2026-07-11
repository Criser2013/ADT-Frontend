import {
    Grid, Typography, TextField, Button, MenuItem, Box, Tooltip, CircularProgress
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SaveIcon from '@mui/icons-material/Save';
import dayjs from "dayjs";
import { COMORBILIDADES } from "../../constants";
import { useCallback, useEffect, useMemo, useState } from "react";
import { validarNombre, validarNumero, validarTelefono } from "../../utils/Validadores";
import { useNavigate } from "react-router";
import SelectChip from "../tabs/SelectChip";
import CloseIcon from "@mui/icons-material/Close";
import ModalSimple from "../modals/ModalSimple";
import { Controller, useForm } from "react-hook-form";
import Check from "../tabs/Check";
import { v6 } from "uuid";
import { useTranslation } from "react-i18next";
import { usePacientes } from "../../hooks";
import { Paciente } from "../../models";

/**
 * Componente que representa el formularios para añadir/editar los datos de
 * un paciente.
 * @param {String} id - ID del paciente.
 * @param {Boolean} esAnadir - Indica si es para añadir un nuevo paciente o editar uno existente.
 * @returns {JSX.Element}
 */
export default function FormPaciente({ paciente = null, esAnadir = true }) {
    const navigate = useNavigate();
    const { anadirPaciente } = usePacientes();
    const { t } = useTranslation();
    
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState({ mostrar: false, texto: "" });

    
    const { setValue, control, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            id: v6(), nombre: "", cedula: "", sexo: 2, telefono: "",
            fechaNacimiento: null, fechaCreacion: null, otraEnfermedad: false,
            comorbilidades: []
        }, mode: "onBlur"
    });
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
    const cargarPaciente = useCallback((paciente) => {
            setValue("id", paciente?.id);
            setValue("nombre", paciente?.nombre);
            setValue("cedula", paciente?.cedula);
            setValue("sexo", paciente?.sexo);
            setValue("telefono", paciente?.telefono);
            setValue("fechaNacimiento", paciente?.fechaNacimientoFormateada);
            setValue("fechaCreacion", paciente?.fechaCreacion);
            setValue("otraEnfermedad", paciente?.otraEnfermedad);
            setValue("comorbilidades", paciente?.comorbilidades);
    }, [setValue]);

    /**
     * @param {Object} datos Objeto con los datos del paciente a guardar.
     */
    async function manejadorGuardado(datos) {
        setCargando(true);

        const { id, nombre, sexo, fechaNacimiento, telefono,
            cedula, otraEnfermedad, comorbilidades } = datos;
        const paciente = new Paciente(
            esAnadir ? id : paciente.id, cedula, nombre, sexo,
            fechaNacimiento.format("DD-MM-YYYY"), telefono,
            esAnadir ? dayjs().format("DD-MM-YYYY") : paciente.fechaCreacion,
            otraEnfermedad ? 1 : 0, comorbilidades
        );

        const res = await anadirPaciente(paciente);
        if (!res.success) {
            setModal({ mostrar: true, mensaje: res.error });
            setCargando(false);
        } else {
            navigate("/pacientes");
        }
    };

    function cerrarModal() {
        setModal({ ...modal, mostrar: false });
    };

    useEffect(() => {
        if (!esAnadir) {
            cargarPaciente(paciente);
        }
    }, [cargarPaciente, paciente, esAnadir]);

    return (
        <>
            {cargando ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="85vh">
                    <CircularProgress />
                </Box>
            ) : (<Grid
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
                                validate: (x) => (x && !x.isAfter(fechaActual)) || t("errFechaNacimiento")
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
                                    etiqueta={t("txtComorbilidades")} />)} />
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
            </Grid>)}
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