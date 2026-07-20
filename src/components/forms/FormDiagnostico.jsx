import CloseIcon from "@mui/icons-material/Close";
import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
    Grid, Button, Typography, TextField, Stack, Tooltip,
    MenuItem, IconButton
} from "@mui/material";
import {
    CAMPOS_BIN, CAMPOS_DECIMALES, CAMPOS_ENTEROS,
    COMORBILIDADES, SEXOS
} from "../../constants";
import { Captcha } from "../captcha";
import { Check } from "../tabs";
import { Controller, useForm } from "react-hook-form";
import { Diagnostico, Paciente } from "../../models";
import { DiagnosticoIcono } from "../icons/IconosSidebar";
import { ModalSimple } from "../modals";
import { PantallaCarga, TabHeader } from "../layout";
import { SelectChip } from "../selects";
import { useAuth, useDiagnosticos } from "../../hooks";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { v6 } from "uuid";
import { validarFloatPos, validarNumero } from "../../utils/Validadores";

const valoresPredet = {
    paciente: new Paciente("null", null, "txtSelectPaciente", 2, null, null, null, false),
    id: v6(),
    sexo: 2, fumador: false, bebedor: false, tos: false, fiebre: false,
    crepitaciones: false, dolor_toracico: false, malignidad: false,
    hemoptisis: false, disnea: false, sibilancias: false,
    derrame: false, TEVP_TVP_previo: false, edema_de_m_inferiores: false,
    sintomas_disautonomicos: false,
    inmovilidad_de_m_inferiores: false, viaje_prolongado: false, proc_quirurgico_traumatismo: false,
    otra_enfermedad: false, soplos: false,
    edad: "", presion_sistolica: "", presion_diastolica: "", frecuencia_respiratoria: "",
    frecuencia_cardiaca: "", saturacion_de_la_sangre: "", plt: "", hb: "", wbc: "",
    comorbilidades: []
};


/**
 * Formulario para realizar un diagnostico de TEP.
 * @param {String} titulo Título del encabezado.
 * @param {Boolean} esDiagPacientes Indica si el formulario es para diagnosticar pacientes.
 * @param {Array<Paciente>} pacientes Lista de pacientes registrados.
 * @param {Object} mapeoPacientes Diccionario cuyas claves son los UID de los pacientes.
 * @param {Array<Object>} pestanas Lista de pestañas con objetos de la forma { texto: String, url: String }.
 * @param {Function} manejadorRecarga Función para ejecutar la carga de las instancias de pacientes.
 * @returns {JSX.Element}
 */
export default function FormDiagnostico({
    titulo, esDiagPacientes = false, pacientes = [], mapeoPacientes = {},
    pestanas, manejadorRecarga = null
}) {
    const navigate = useNavigate();
    const { generarDiagnostico } = useDiagnosticos();
    const { t } = useTranslation();
    const { usuario } = useAuth();
    const [cargando, setCargando] = useState(esDiagPacientes);
    const [cargandoBtn, setCargandoBtn] = useState(false);
    const [desactivarBtn, setDesactivarBtn] = useState(true);
    const [modal, setModal] = useState({ mostrar: false, texto: "" });
    const { getValues, setValue, control, handleSubmit, reset, watch, formState: { errors } } = useForm({
        defaultValues: valoresPredet, mode: "onBlur"
    });
    const otraEnfermedad = watch("otraEnfermedad");
    const camposExamenes = [
        { nombre: "plt", label: t("txtCampoPLT") },
        { nombre: "hb", label: t("txtCampoHB") },
        { nombre: "wbc", label: t("txtCampoWBC") }
    ];
    const camposSignosVitales = [
        { nombre: "presion_sistolica", label: `${t("txtCampoPresionSist")} (mmHg)` },
        { nombre: "presion_diastolica", label: `${t("txtCampoPresionDiast")} (mmHg)` },
        { nombre: "frecuencia_respiratoria", label: `${t("txtCampoFrecuenciaRespiratoria")}` },
        { nombre: "frecuencia_cardiaca", label: `${t("txtCampoFrecuenciaCardiaca")}` },
        { nombre: "saturacion_de_la_sangre", label: `${t("txtCampoSaturacionSangre")}` }
    ];

    useEffect(() => {
        if (esDiagPacientes && pacientes) {
            setCargando(false);
        }
    }, [esDiagPacientes, pacientes, setCargando]);

    function cerrarModal() {
        setModal((x) => ({ ...x, mostrar: false }));
    };

    function manejadorBtnVaciar() {
        reset(valoresPredet);
        setDesactivarBtn(true);
    };

    /**
     * @param {Event} e Evento de cambio del select de pacientes.
     */
    const manejadorCambioPaciente = (e) => {
        const idSeleccionado = e.target.value.id;
        const paciente = mapeoPacientes[idSeleccionado];

        if (idSeleccionado != "null") {
            setValue("sexo", paciente.sexo);
            setValue("edad", paciente.edad);
            setValue("otra_enfermedad", paciente.otraEnfermedad);
            setValue("comorbilidades", paciente.comorbilidades);
        } else {
            setValue("sexo", 2);
            setValue("edad", "");
            setValue("otra_enfermedad", false);
            setValue("comorbilidades", []);
        }

        setValue("paciente", paciente);
    };

    async function manejadorBtnRecargar() {
        setCargando(true);
        const idPaciente = getValues("paciente").id;

        if (idPaciente) {
            setValue("paciente", valoresPredet.paciente);
            setValue("sexo", 2);
            setValue("edad", "");
            setValue("otra_enfermedad", false);
            setValue("comorbilidades", []);
        }
        await manejadorRecarga();
    };

    /**
     * @param {Object} datos Contenido del formulario de diagnóstico.
     */
    async function manejadorGuardado(datos) {
        setCargando(true);
        const binarios = {};
        const numericos = {};

        for (const i of CAMPOS_BIN) {
            binarios[i] = datos[i];
        }
        for (const i of CAMPOS_DECIMALES) {
            numericos[i] = parseFloat(datos[i].replace(",", "."));
        }
        for (const i of CAMPOS_ENTEROS) {
            numericos[i] = parseInt(datos[i], 10);
        }

        const inst = new Diagnostico(
            datos.id, usuario.uid, esDiagPacientes ? datos.paciente.id : null,
            datos.comorbilidades, new Date(), datos.otraEnfermedad, binarios, numericos
        );
        const { success, data, error } = await generarDiagnostico(inst);

        if (success) {
            navigate(`/diagnosticos/${inst.id}`, { state: Diagnostico.fromJson(data) });
        } else {
            setModal({ mostrar: true, texto: t("errGuardarDiag", { error: error }) });
            setCargando(false);
        }
    };

    return (
        <>
            {cargando ? (
                <PantallaCarga />
            ) : (
                <>
                    <TabHeader
                        titulo={titulo}
                        pestanas={pestanas}
                        activarBtnAtras={false} />
                    <Grid container columns={{ xs: 1, sm: 2, md: 3 }} spacing={2} sx={{ marginTop: "3vh" }}>
                        <Grid size={{ xs: 1, sm: 2, md: 3 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {t("titDatosPersonales")}
                            </Typography>
                        </Grid>
                        {esDiagPacientes ? (
                            <Grid size={1}>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <Controller
                                        name="paciente"
                                        control={control}
                                        rules={{
                                            required: t("errValidarPaciente"),
                                            validate: (x) => x.id != "null" || t("errValidarPaciente")
                                        }}
                                        render={({ field }) => (
                                            <TextField
                                                select
                                                fullWidth
                                                label={t("txtPaciente")}
                                                {...field}
                                                value={field.value.id}
                                                onChange={manejadorCambioPaciente}
                                                error={errors.paciente}
                                                helperText={errors.paciente?.message} >
                                                {pacientes.map((x) => (
                                                    <MenuItem key={x.id} value={x}>
                                                        {x.nombre}
                                                    </MenuItem>
                                                ))}
                                            </TextField>)} />
                                    <Tooltip title={t("txtBtnRecargarPacientes")}>
                                        <IconButton onClick={manejadorBtnRecargar}>
                                            <RefreshIcon fontSize="medium" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Grid>
                        ) : null}
                        <Grid size={1}>
                            <Controller
                                name="sexo"
                                control={control}
                                rules={{
                                    required: !esDiagPacientes && t("errValidarSexo"),
                                    validate: (x) => (esDiagPacientes || (x != 2 || t("errValidarSexo")))
                                }}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        label={t("txtCampoSexo")}
                                        {...field}
                                        error={errors.sexo}
                                        helperText={errors.sexo?.message}
                                        disabled={esDiagPacientes}
                                        fullWidth>
                                        {SEXOS.map((x) => (
                                            <MenuItem key={x.val} value={x.val}>
                                                {t(x.texto)}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )} />
                        </Grid>
                        <Grid size={1}>
                            <Controller
                                name="edad"
                                control={control}
                                rules={{
                                    required: !esDiagPacientes && t("errValidarEdad"),
                                    validate: (value) => (esDiagPacientes || (validarNumero(value) || t("errValidarEdad")))
                                }}
                                render={({ field }) => (
                                    <TextField
                                        label={t("txtCampoEdad")}
                                        {...field}
                                        error={errors.edad}
                                        disabled={esDiagPacientes}
                                        helperText={errors.edad?.message}
                                        fullWidth />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 1, sm: 2, md: 3 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {t("titSintomasClinicos")}
                            </Typography>
                        </Grid>
                        <Grid
                            container
                            size={{ xs: 1, sm: 2, md: 3 }}
                            columns={{ xs: 1, sm: 2, md: 3 }}
                            columnSpacing={0}
                            rowSpacing={0}
                            rowGap={0}
                            columnGap={0} >
                            {CAMPOS_BIN.map((x) => (
                                <Grid size={1} key={x}>
                                    <Controller
                                        name={x}
                                        control={control}
                                        render={({ field }) => (
                                            <Check
                                                marcado={field.value}
                                                manejadorCambios={field.onChange}
                                                nombre={x}
                                                etiqueta={t(x)} />
                                        )} />
                                </Grid>
                            ))}
                        </Grid>
                        <Grid size={{ xs: 1, sm: 2, md: 3 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {t("titSignosVitales")}
                            </Typography>
                        </Grid>
                        {camposSignosVitales.map((campo) => (
                            <Grid size={1}>
                                <Controller
                                    name={campo.nombre}
                                    control={control}
                                    rules={{
                                        required: t("errCampoObligatorio"),
                                        validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            label={campo.label}
                                            {...field}
                                            error={errors[campo.nombre]}
                                            helperText={errors[campo.nombre]?.message}
                                            fullWidth />
                                    )} />
                            </Grid>
                        ))}
                        <Grid size={{ xs: 1, sm: 2, md: 3 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {t("titExamenes")}
                            </Typography>
                        </Grid>
                        <Grid size={1}>
                            {camposExamenes.map((campo) => (
                                <Grid size={1}>
                                    <Controller
                                        name={campo.nombre}
                                        control={control}
                                        rules={{
                                            required: t("errCampoObligatorio"),
                                            validate: (value) => validarFloatPos(value) || t("errValidarNumPos")
                                        }}
                                        render={({ field }) => (
                                            <TextField
                                                label={campo.label}
                                                {...field}
                                                error={errors[campo.nombre]}
                                                helperText={errors[campo.nombre]?.message}
                                                fullWidth />
                                        )} />
                                </Grid>
                            ))}
                            <Grid size={{ xs: 1, sm: 2, md: 3 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    {t("titComor")}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 1, sm: 2, md: 3 }}>
                                <Controller
                                    name="otra_enfermedad"
                                    control={control}
                                    render={({ field }) => (
                                        <Check
                                            marcado={field.value}
                                            desactivar={esDiagPacientes}
                                            manejadorCambios={field.onChange}
                                            etiqueta={t("txtOtraEnfermedad")} />
                                    )} />
                            </Grid>
                            {otraEnfermedad ? (
                                <Grid size={{ xs: 1, sm: 2, md: 3 }}>
                                    <Controller
                                        name="comorbilidades"
                                        control={control}
                                        rules={{
                                            required: otraEnfermedad ? t("errComor") : false,
                                        }}
                                        render={({ field }) => (
                                            <SelectChip
                                                valores={field.value}
                                                listaValores={COMORBILIDADES}
                                                etiqueta={t("txtComorbilidades")}
                                                manejadorCambios={field.onChange}
                                                error={errors.comorbilidades}
                                                txtError={errors.comorbilidades?.message}
                                                desactivar={esDiagPacientes} />
                                        )}
                                    />
                                </Grid>
                            ) : null}
                            <Grid size={{ xs: 1, sm: 2, md: 3 }} display="flex" justifyContent="center">
                                <Captcha
                                    setCarga={setCargandoBtn}
                                    setCaptchaAceptado={setDesactivarBtn} />
                            </Grid>
                            <Grid display="flex" justifyContent="center" size={{ xs: 1, sm: 2, md: 3 }}>
                                <Stack direction="row" spacing={2}>
                                    <Tooltip title={t("txtAyudaBtnVaciar")}>
                                        <Button
                                            startIcon={<ClearIcon />}
                                            variant="contained"
                                            onClick={manejadorBtnVaciar}
                                            sx={{
                                                textTransform: "none",
                                                textDecoration: "bold"
                                            }}>
                                            <b>{t("txtBtnVaciar")}</b>
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title={t("txtAyudaBtnDiagnosticar")}>
                                        <span>
                                            <Button
                                                startIcon={<DiagnosticoIcono />}
                                                variant="contained"
                                                onClick={handleSubmit(manejadorGuardado)}
                                                loading={cargandoBtn}
                                                disabled={desactivarBtn}
                                                loadingPosition="end"
                                                sx={{
                                                    textTransform: "none"
                                                }}>
                                                <b>{t("txtBtnDiagnosticar")}</b>
                                            </Button>
                                        </span>
                                    </Tooltip>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Grid>
                </>)}
            <ModalSimple
                mostrar={modal.mostrar}
                titulo={t("titError")}
                texto={modal.texto}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtnModal={cerrarModal}
                iconoBtn={<CloseIcon />} />
        </>
    );
};