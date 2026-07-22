

import { detTxtDiagnostico, procLime } from "../../utils/TratarDatos";
import { COMORBILIDADES, CAMPOS_BIN } from "../../../constants";


import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
    Box, CircularProgress, Grid, Typography, Divider, Stack, Tooltip,
    Button, IconButton
} from "@mui/material";
import { BtnFlotante, Check } from "../../components/tabs";
import { ChipDiagnostico, ChipSexo, ChipValidado } from "../../components/tabs/Chips";
import { ContComorbilidades, ContLime } from "../../components/diagnosticos";
import { FormSeleccionar } from "../../components/forms";
import { MenuLayout, PantallaCarga, TabHeader } from "../../components/layout";
import { ModalError, ModalSimple } from "../../components/modals";
import { Paciente } from "../../models";
import { useAuth, useDiagnosticos, usePacientes, useUsuarios } from "../../hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { validarId } from "../../utils/Validadores";


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


    const numCols = { xs: 12, md: 4 };
    const camposPersonales = useMemo(() => {
        const campos = [
            { titulo: "ID", valor: diagnostico.personales.id },
            { titulo: admin ? t("txtMedico") : t("txtPaciente"), valor: persona.nombre },
            { titulo: t("txtCampoSexo"), valor: diagnostico.personales.sexo == 0 ? t("txtMasculino") : t("txtFemenino") },
            { titulo: t("txtCampoEdad"), valor: `${diagnostico.personales.edad} ${t("txtSufijoEdad")}` },
            { titulo: t("txtCampoFechaDiag"), valor: diagnostico.personales.fecha },
            { titulo: t("txtCampoDiagModelo"), valor: detTxtDiagnostico(diagnostico.personales.diagnostico, navegacion.idioma) },
            { titulo: t("txtCampoProbabilidad"), valor: `${(diagnostico.personales.probabilidad * 100).toFixed(2)}%` },
            { titulo: t("txtCampoDiagMedico"), valor: detTxtDiagnostico(diagnostico.personales.validado, navegacion.idioma) },
        ];

        return campos;
    }, [admin, diagnostico, persona.nombre, navegacion.idioma]);
    const camposVitales = useMemo(() => [
        { titulo: t("txtCampoPresionSist"), valor: `${diagnostico.personales.presionSis} mmHg.` },
        { titulo: t("txtCampoPresionDiast"), valor: `${diagnostico.personales.presionDias} mmHg.` },
        { titulo: t("txtCampoFrecCard"), valor: `${diagnostico.personales.frecCard} lpm.` },
        { titulo: t("txtCampoFrecRes"), valor: `${diagnostico.personales.frecRes} rpm.` },
        { titulo: t("txtCampoSO2"), valor: `${diagnostico.personales.so2} %` },
    ], [diagnostico.personales, navegacion.idioma]);
    const camposExamenes = useMemo(() => [
        { titulo: t("txtCampoPLT"), valor: `${diagnostico.personales.plaquetas} /µL.` },
        { titulo: t("txtCampoHB"), valor: `${diagnostico.personales.hemoglobina} g/dL.` },
        { titulo: t("txtCampoWBC"), valor: `${diagnostico.personales.wbc} /µL.` },
    ], [diagnostico.personales, navegacion.idioma]);

    const listadoPestanas = [
        { texto: usuario?.rol ? t("txtDatosRecolectados") : t("txtHistorialDiagnosticos"), url: "/diagnosticos" },
        { texto: `${t("txtDiagnostico")} — ${id}`, url: `/diagnosticos/${id}` }
    ];

    /**
     * Cuando el admin cambia el modo usuario se fuerza a recargar la página.
     */
    /*useEffect(() => {
        if (navegacion.recargarPagina) {
            setCargando(true);
            setPersona(null);
            navegacion.setRecargarPagina(false);
        }
    }, [navegacion.recargarPagina]);*/

    useEffect(() => {
        let titulo = "";
        if (usuario?.rol) {
            titulo = diagnostico ? `${t("txtDiagnostico")} — ${diagnostico?.id}` : t("titDiagnostico");
        } else {
            titulo = persona ? `${t("txtDiagnostico")} — ${persona.nombre}` : t("titVerDiagnostico");
        }
        document.title = titulo;
    }, [usuario, persona, diagnostico, t]);

    useEffect(() => {
        const exp = /-\w{28}$/;
        const res = validarId(id.replace(exp, "")) && exp.test(id);

        if (!res) {
            navigate("/diagnosticos");
        }
    }, [id, navigate]);


    /**
     * Separa los datos del diagnóstico en comorbilidades y otros datos.
     * @param {JSON} datos - Datos del diagnóstico.
     */
    /*const preprocesarDiag = (datos) => {
        const aux = { ...datos, lime: datos.lime.map((x) => x) };
        const lime = procLime(aux, aux.diagnostico);
        const res = oneHotDecoderOtraEnfermedad(aux);

        for (const i of COMORBILIDADES) {
            delete aux[i];
        }
        dayjs.extend(customParseFormat);

        if (!admin) {
            aux.id = aux.id.replace(/-\w{28}$/, "");
        }

        aux.fecha = dayjs(datos.fecha.toDate()).format(t("formatoFechaCompleta"));
        setDiagnostico({
            personales: aux, comorbilidades: res, lime: (datos.lime != undefined ? lime : null)
        });
    };*/

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
            setPersona(
                new Paciente("null", null, t("txtAnonimo"), 2, null, null, null, false, [])
            );
            return;
        }

        const res = await verPaciente(id);
        //const nombre = !admin ? t("txtPaciente") : t("txtUsuario");
        if (res instanceof Paciente) {
            setPersona(res);
        } else {
            setModalError({ mostrar: true, texto: "errCargarDatosPaciente" });
        }
    }, [setPersona, verPaciente, t]);

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

    /**
     * Determina el tamaño del elemento dentro de la malla.
     * Si se visualiza desde un dispositivo movil en orientación horizontal y el menú o en escritorio,
     * se ajusta el contenido a 2 columnas, en caso contrario se deja en 1 columna.
     * @param {Int} indice 
     * @returns {Int}
     */
    const detVisualizacion = (indice) => {
        const { orientacion, mostrarMenu, dispositivoMovil, ancho } = navegacion;
        if (dispositivoMovil && (orientacion == "vertical" || (orientacion == "horizontal" && mostrarMenu))) {
            return 12;
        } else if (!dispositivoMovil && ancho < 600) {
            return 12;
        }
        else {
            return indice % 2 == 0 ? 7 : 5;
        }
    };

    async function manejadorBtnBorrar() {
        const { success, error } = await eliminarDiagnosticos(id);
        if (success) {
            navigate("/diagnosticos");
        } else {
            setModalError({ mostrar: true, texto: error });
        }
    };

    function manejadorBtnEliminar() {
        setModalEliminacion(true);
    };


    /**
     * @param {Object} datos Objeto con la propiedad "diagnosticoMedico" que contiene el diagnóstico 
     * pronósticado por el médico.
     */
    async function manejadorBtnValidar(datos) {
        cerrarModalValidacion();
        setCargando(true);
        const { success, data, error } = await validarDiagnostico(diagnostico, datos.diagnosticoMedico);
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

    /**
     * Componente para mostrar los campos de texto.
     * @param {JSON} campos - Datos del campo.
     * @param {Int} indice - Índice del campo.
     * @returns {JSX.Element}
     */
    const CamposTexto = ({ campo, indice }) => {
        return (
            <Grid size={detVisualizacion(indice)}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body1">
                        <b>{campo.titulo}: </b>
                    </Typography>
                    {(campo.titulo == t("txtCampoSexo")) ? <ChipSexo sexo={campo.valor} /> : null}
                    {(campo.titulo == t("txtCampoDiagModelo")) ? <ChipDiagnostico diagnostico={campo.valor} /> : null}
                    {(campo.titulo == t("txtCampoDiagMedico")) ? <ChipValidado validado={campo.valor} /> : null}
                    {(campo.titulo != t("txtCampoSexo") && campo.titulo != t("txtCampoDiagModelo") && campo.titulo != t("txtCampoDiagMedico")) ? (
                        <Typography variant="body1">
                            {campo.valor}
                        </Typography>) : null}
                </Stack>
            </Grid>
        );
    };

    useEffect(() => {
        if (usuario?.rol && usuariosListo) {
            const uid = id.substring(37);
            cargarUsuario(uid);
        }
    }, [usuario, usuariosListo, cargarUsuario, id]);

    useEffect(() => {
        if (diagnostico && pacientesListo) {
            const uid = diagnostico.paciente;
            cargarPaciente(uid, Boolean(uid));
        }
    }, [diagnostico, pacientesListo, cargarPaciente]);

    useEffect(() => {
        if (diagnosticosListo) {
            const uid = id.substring(0, 36);
            cargarDiagnostico(uid);
        }
    }, [diagnosticosListo, cargarDiagnostico, id]);

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
                            {camposPersonales.map((campo, index) => (
                                <CamposTexto key={index} campo={campo} indice={index} />
                            ))}
                            <Grid size={12} paddingTop="3vh">
                                <Divider />
                            </Grid>
                            <Grid size={12} paddingTop="3vh">
                                <ContLime datos={diagnostico.lime} />
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
                                {SINTOMAS.map((x) => (
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
                            {camposVitales.map((campo, index) => (
                                <CamposTexto key={index} campo={campo} indice={index} />
                            ))}
                            <Grid size={12} paddingTop="3vh">
                                <Divider />
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="h5" paddingBottom="2vh">
                                    {t("titExamenes")}
                                </Typography>
                            </Grid>
                            {camposExamenes.map((campo, index) => (
                                <CamposTexto key={index} campo={campo} indice={index} />
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
                        {(diagnostico?.validado && !usuario?.rol) ? (
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