import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    Box, CircularProgress, Grid, Typography, Divider, Stack, Tooltip,
    Button, IconButton
} from "@mui/material";
import { BtnFlotante, Check } from "../../components/tabs";
import { CAMPOS_BIN, COMORBILIDADES } from "../../../constants";
import { CampoTexto, ContComorbilidades, ContLime } from "../../components/diagnosticos";
import { ChipDiagnostico, ChipSexo, ChipValidado } from "../../components/tabs/Chips";
import { FormSeleccionar } from "../../components/forms";
import { MenuLayout, PantallaCarga, TabHeader } from "../../components/layout";
import { ModalError, ModalSimple } from "../../components/modals";
import { Paciente } from "../../models";
import { useAuth, useDiagnosticos, usePacientes, useUsuarios } from "../../hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { validarId } from "../../utils/Validadores";

const numCols = { xs: 12, md: 4 };


/**
 * Página para ver los datos de un diagnóstico.
 * @returns {JSX.Element}
 */
export default function VerDiagnosticoPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const { eliminarDiagnosticos, verDiagnostico, validarDiagnostico,
        helperListo: diagnosticosListo } = useDiagnosticos();
    const { id } = useParams();
    const { t } = useTranslation();
    const { verPaciente, helperListo: pacientesListo } = usePacientes();
    const { verUsuario, helperListo: usuariosListo } = useUsuarios();
    const [cargando, setCargando] = useState(true);
    const [diagnostico, setDiagnostico] = useState(null);
    const [persona, setPersona] = useState(null);
    const [modalError, setModalError] = useState({ mostrar: false, texto: "" });
    const [modalEliminacion, setModalEliminacion] = useState(false);
    const [modalValidacion, setModalValidacion] = useState(false);


    const camposPersonales = useMemo(() => [
        { id: "id", titulo: "ID", valor: diagnostico.personales.id },
        { id: "nombre", titulo: usuario?.rol ? t("txtMedico") : t("txtPaciente"), valor: persona?.nombre },
        { id: "sexo", titulo: t("txtCampoSexo"), componente: <ChipSexo sexo={diagnostico?.sintomasBinarios.sexo} />},
        { id: "edad", titulo: t("txtCampoEdad"), valor: `${diagnostico?.edad} ${t("txtSufijoEdad")}` },
        { id: "fecha", titulo: t("txtCampoFechaDiag"), valor: diagnostico?.fechaFormateada },
        { id: "diagnosticoModelo", titulo: t("txtCampoDiagModelo"), componente: <ChipDiagnostico valor={diagnostico?.diagnosticoModelo} /> },
        { id: "probabilidad", titulo: t("txtCampoProbabilidad"), valor: `${(diagnostico?.probabilidad * 100).toFixed(2)}%` },
        { id: "diagnosticoMedico", titulo: t("txtCampoDiagMedico"), componente: <ChipValidado valor={diagnostico?.diagnosticoMedico} /> },
    ], [usuario, diagnostico, persona, t]);
    const camposSintomas = useMemo(() => CAMPOS_BIN.filter((x) => !["sexo", "otra_enfermedad"].includes(x)), []);
    const camposVitales = useMemo(() => [
        { id: "presionSistolica", titulo: t("txtCampoPresionSist"), valor: `${diagnostico?.sintomasNumericos.presion_sistolica} mmHg.` },
        { id: "presionDiastolica", titulo: t("txtCampoPresionDiast"), valor: `${diagnostico?.sintomasNumericos.presion_diastolica} mmHg.` },
        { id: "frecuenciaCardiaca", titulo: t("txtCampoFrecCard"), valor: `${diagnostico?.sintomasNumericos.frecuencia_cardiaca} lpm.` },
        { id: "frecuenciaRespiratoria", titulo: t("txtCampoFrecRes"), valor: `${diagnostico?.sintomasNumericos.frecuencia_respiratoria} rpm.` },
        { id: "saturacionDeLaSangre", titulo: t("txtCampoSO2"), valor: `${diagnostico?.sintomasNumericos.saturacion_de_la_sangre} %` },
    ], [diagnostico, t]);
    const camposExamenes = useMemo(() => [
        { id: "plt", titulo: t("txtCampoPLT"), valor: `${diagnostico?.sintomasNumericos.plt} /µL.` },
        { id: "hb", titulo: t("txtCampoHB"), valor: `${diagnostico?.personales.hb} g/dL.` },
        { id: "wbc", titulo: t("txtCampoWBC"), valor: `${diagnostico?.personales.wbc} /µL.` },
    ], [diagnostico, t]);
    const listadoPestanas = [
        { texto: usuario?.rol ? t("txtDatosRecolectados") : t("txtHistorialDiagnosticos"), url: "/diagnosticos" },
        { texto: `${t("txtDiagnostico")} — ${id}`, url: `/diagnosticos/${id}` }
    ];

    useEffect(() => {
        const exp = /-\w{28}$/;
        const res = validarId(id.replace(exp, "")) && exp.test(id);

        if (!res) {
            navigate("/diagnosticos");
        }
    }, [id, navigate]);

    useEffect(() => {
        let titulo = "";
        if (usuario?.rol) {
            titulo = diagnostico ? `${t("txtDiagnostico")} — ${diagnostico?.id}` : t("titDiagnostico");
        } else {
            titulo = persona ? `${t("txtDiagnostico")} — ${persona.nombre}` : t("titVerDiagnostico");
        }
        document.title = titulo;
    }, [usuario, persona, diagnostico, t]);

    /**
     * @param {String} id ID del diagnóstico a cargar.
     */
    const cargarDiagnostico = useCallback(async (id) => {
        const cache = location.state?.diagnostico;
        if (cache) {
            history.replaceState({ ...location.state, diagnostico: null }, "");
            setDiagnostico(cache);
            return;
        }

        const { success, data } = await verDiagnostico(id);
        if (success) {
            setDiagnostico(data);
        } else {
            navigate("/diagnosticos");
        }
    }, [verDiagnostico, setDiagnostico, location, navigate]);

    /**
     * @param {String} id  UID del paciente.
     * @param {Boolean} esAnonimo Indica si el paciente es anónimo o no.
     */
    const cargarPaciente = useCallback(async (id, esAnonimo = false) => {
        if (esAnonimo) {
            const nombre = `${usuario?.rol ? t("txtMedico") : t("txtPaciente")} ${t("txtAnonimo")}`;
            setPersona(new Paciente("null", null, nombre, 2, null, null, null, false, []));
            return;
        }

        const res = await verPaciente(id);
        if (res instanceof Paciente) {
            setPersona(res);
        } else {
            setModalError({ mostrar: true, texto: "errCargarDatosPaciente" });
        }
    }, [setPersona, usuario, verPaciente, t]);

    /**
    * @param {String} uid UID del usuario.
    */
    const cargarUsuario = useCallback(async (uid) => {
        const { success, data } = await verUsuario(uid);
        if (success) {
            setPersona(data);
        } else {
            setModalError({ mostrar: true, texto: "errCargarDatosMedico" });
        }
    }, [setPersona, verUsuario]);

    function cerrarModalEliminacion() {
        setModalEliminacion(false);
    };

    function cerrarModalError() {
        setModalError({ ...modalError, mostrar: false });
    };

    function cerrarModalValidacion() {
        setModalValidacion(false);
    };

    async function manejadorBtnBorrar() {
        const { success, error } = await eliminarDiagnosticos(id);
        if (success) {
            navigate("/diagnosticos");
        } else {
            setModalError({ mostrar: true, texto: error });
            setCargando(false);
        }
    };

    function manejadorBtnEliminar() {
        setModalEliminacion(true);
    };

    /**
     * @param {Object} diagnosticoMedico Diagnóstico TEP confirmado por el médico.
     */
    async function manejadorBtnValidar({ diagnosticoMedico }) {
        cerrarModalValidacion();
        setCargando(true);
        const { success, data, error } = await validarDiagnostico(diagnostico, diagnosticoMedico);
        if (success) {
            setDiagnostico(data);
        } else {
            setModalError({ mostrar: true, texto: t(error) });
        }
        setCargando(false);
    };

    function manejadorBtnValidarDiagnostico() {
        setModalValidacion(true);
    };

    useEffect(() => {
        if (usuario?.rol && usuariosListo) {
            const uid = id.substring(37);
            cargarUsuario(uid);
        }
    }, [usuario, usuariosListo, cargarUsuario, id]);

    useEffect(() => {
        if (!usuario?.rol && diagnostico && pacientesListo) {
            const uid = diagnostico.paciente;
            cargarPaciente(uid, Boolean(uid));
        }
    }, [diagnostico, usuario, pacientesListo, cargarPaciente]);

    useEffect(() => {
        if (diagnosticosListo) {
            const uid = id.substring(0, 36);
            cargarDiagnostico(uid);
        }
    }, [diagnosticosListo, cargarDiagnostico, id]);

    useEffect(() => {
        setCargando(true);
    }, [usuario.modoUsuario]);

    useEffect(() => {
        setCargando(!(diagnostico && persona));
    }, [persona, diagnostico]);

    return (
        <>
            <MenuLayout>
                {cargando ? (
                    <PantallaCarga />
                ) : (
                    <>
                        <TabHeader
                            activarBtnAtras
                            titulo={t("titDiagnostico")}
                            pestanas={listadoPestanas}
                            tooltip={t("txtVolverAtrasDiagnosticos")} />
                        <Grid container
                            columns={12}
                            spacing={1}
                            marginTop="3vh">
                            {usuario?.rol ? (
                                <Grid size={12} display="flex" justifyContent="end" margin="-2vh 0vw">
                                    <Tooltip title={t("txtAyudaEliminarDiagnostico")}>
                                        <IconButton
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={manejadorBtnEliminar}
                                            sx={{ textTransform: "none", padding: 2 }} >
                                            {t("txtBtnEliminar")}
                                        </IconButton>
                                    </Tooltip>
                                </Grid>) : null}
                            <Grid size={12}>
                                <Typography variant="h5" paddingBottom="2vh">
                                    {t("titDatosPersonales")}
                                </Typography>
                            </Grid>
                            {camposPersonales.map(({ id, titulo, valor, componente }) => (
                                <CampoTexto
                                    key={id}
                                    tamano={numCols}
                                    titulo={titulo}
                                    valor={valor}
                                    componente={componente} />
                            ))}
                            <Grid size={12} paddingTop="3vh">
                                <Divider />
                            </Grid>
                            <Grid size={12} paddingTop="3vh">
                                <ContLime diagnostico={diagnostico} />
                            </Grid>
                            <Grid size={12} paddingTop="3vh">
                                <Divider />
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="h5" paddingBottom="0.2vh">
                                    {t("titSintomasClinicos")}
                                </Typography>
                            </Grid>
                            <Grid container size={12} columns={12} columnSpacing={0} rowSpacing={0} rowGap={0} columnGap={0}>
                                {camposSintomas.map((x) => (
                                    <Grid size={numCols} key={x}>
                                        <Check
                                            desactivar
                                            marcado={diagnostico.sintomasBinarios[x]}
                                            manejadorCambios={null}
                                            etiqueta={t(x)} />
                                    </Grid>
                                ))}
                            </Grid>
                            <Grid size={12} paddingTop="3vh">
                                <Divider />
                            </Grid>
                            <Grid size={12} paddingBottom="2vh">
                                <Typography variant="h5">
                                    {t("titSignosVitales")}
                                </Typography>
                            </Grid>
                            {camposVitales.map(({ id, titulo, valor, componente }) => (
                                <CampoTexto
                                    key={id}
                                    tamano={numCols}
                                    titulo={titulo}
                                    valor={valor}
                                    componente={componente} />
                            ))}
                            <Grid size={12} paddingTop="3vh">
                                <Divider />
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="h5" paddingBottom="2vh">
                                    {t("titExamenes")}
                                </Typography>
                            </Grid>
                            {camposExamenes.map(({ id, titulo, valor, componente }) => (
                                <CampoTexto
                                    key={id}
                                    tamano={numCols}
                                    titulo={titulo}
                                    valor={valor}
                                    componente={componente} />
                            ))}
                            <Grid size={12} paddingTop="3vh">
                                <Divider />
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="h5" paddingBottom="1vh">
                                    {t("titComor")}
                                </Typography>
                            </Grid>
                            {diagnostico.otraEnfemedad ? (
                                <Grid size={12}>
                                    <ContComorbilidades comorbilidades={diagnostico.comorbilidades} />
                                </Grid>
                            ) : (
                                <Grid size={5}>
                                    <Typography variant="body1" fontWeight="bold">
                                        {t("txtNoComor")}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                        {(!usuario?.rol && diagnostico?.validado) ? (
                            <BtnFlotante
                                txtBtn={t("txtBtnValidar")}
                                txtAyudaBtn={t("txtAyudaBtnValidar")}
                                manejadorBtn={manejadorBtnValidarDiagnostico}
                                icono={<CheckCircleOutlineIcon />} />
                        ) : null}
                    </>
                )}
                <FormValidacion
                    mostrar={modalValidacion.mostrar}
                    manejadorBtn={manejadorBtnValidar}
                    manejadorCierre={cerrarModalValidacion} />
                <ModalDoble
                    mostrar={modalEliminacion.mostrar}
                    titulo={t("titAlerta")}
                    texto={t("txtEliminarDiagnostico")}
                    txtBtnPrincipal={t("txtBtnEliminar")}
                    txtBtnSecundario={t("txtBtnCancelar")}
                    manejadorBtnPrincipal={manejadorBtnBorrar}
                    manejadorBtnSecundario={cerrarModalEliminacion}
                    iconoBtnPrincipal={<DeleteIcon />}
                    iconoBtnSecundario={<CloseIcon />} />
                <ModalSimple
                    mostrar={modalError.mostrar}
                    titulo={t("tituloErr")}
                    texto={t(modalError.texto)}
                    txtBtn={t("txtBtnCerrar")}
                    manejadorBtn={cerrarModalError}
                    iconoBtn={<CloseIcon />} />
            </MenuLayout>
        </>
    );
};