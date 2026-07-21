import {
    Box, CircularProgress, Grid, Typography, Divider, Stack, Fab, Tooltip,
    Button, Popover, IconButton
} from "@mui/material";
import { useEffect, useState, useMemo, useCallback } from "react";

import { useLocation, useNavigate, useParams } from "react-router";
import { validarId } from "../../utils/Validadores";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ModalDoble from "../../components/modals/ModalDoble";
import { oneHotDecoderOtraEnfermedad, detTxtDiagnostico, procLime } from "../../utils/TratarDatos";
import { COMORBILIDADES, DIAGNOSTICOS } from "../../../constants";
import { useCredenciales } from "../../contexts/CredencialesContext";
import Check from "../../components/tabs/Check";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FormSeleccionar from "../../components/forms/FormSeleccionar";
import { SINTOMAS } from "../../../constants";
import ContComorbilidades from "../../components/diagnosticos/ContComorbilidades";

import { ChipDiagnostico, ChipSexo, ChipValidado } from "../../components/tabs/Chips";
import ContLime from "../../components/diagnosticos/ContLime";
import { useTranslation } from "react-i18next";
import { useAuth, useDiagnosticos, usePacientes, useUsuarios } from "../../hooks";
import { MenuLayout, PantallaCarga, TabHeader } from "../../components/layout";
import { Paciente } from "../../models";

/**
 * Página para ver los datos de un diagnóstico.
 * @returns {JSX.Element}
 */
export default function VerDiagnosticoPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { autenticado, usuario } = useAuth();
    const { eliminarDiagnosticos, verDiagnostico, validarDiagnostico,
        helperListo: diagnosticosListo } = useDiagnosticos();
    const { id } = useParams();
    const { t } = useTranslation();
    const { verPaciente, token, helperListo: pacientesListo } = usePacientes();
    const { verUsuario, helperListo: usuariosListo } = useUsuarios();


    const [cargando, setCargando] = useState(true);
    const [diagnostico, setDiagnostico] = useState(null);
    const [persona, setPersona] = useState(null);

    const [mostrarBtnSecundario, setMostrarBtnSecundario] = useState(true);

    const [modoEliminar, setModoEliminar] = useState(false);
    const [popOver, setPopOver] = useState(null);
    const open = Boolean(popOver);
    const elem = open ? "simple-popover" : undefined;
    const [modal, setModal] = useState({
        mostrar: false, mensaje: "", titulo: "", txtBtn: t("txtBtnValidar"), icono: null
    });


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
    useEffect(() => {
        if (navegacion.recargarPagina) {
            setCargando(true);
            setPersona(null);
            navegacion.setRecargarPagina(false);
        }
    }, [navegacion.recargarPagina]);

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
     * @param {String} id ID del diagnóstico a cargar.
     */
    const cargarDiagnostico = useCallback(async (id) => {
        const cache = location.state?.diagnostico;
        if (cache) {
            replaceState({ ...location.state, diagnostico: null }, '');
            setDiagnostico(cache);
            return;
        }

        const { success, data } = await verDiagnostico(id);
        if (success) {
            setDiagnostico(data);
        } else {
            navigate("/diagnosticos");
        }
    }, [verDiagnostico, setDiagnostico]);

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
    }, [setPersona, navigate, verPaciente]);

     /**
     * @param {String} uid UID del usuario.
     */
    const cargarUsuario =  useCallback(async (uid) => {
        const { success, data, error } = await verUsuario(uid);
        if (success) {
            setPersona(data);
        } else {
            setModalError({ mostrar: true, texto: "errCargarDatosMedico" });
        }
    }, [setPersona, verUsuario]);

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


    /**
     * Separa los datos del diagnóstico en comorbilidades y otros datos.
     * @param {JSON} datos - Datos del diagnóstico.
     */
    const preprocesarDiag = (datos) => {
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

    /**
     * Manejador del botón de editar paciente.
     */
    const manejadorBtnEditar = () => {
        setDiagnostico(2);
        setMostrarBtnSecundario(true);
        setErrorDiagnostico(false);
        setModal({
            titulo: t("titValidar"), mensaje: "",
            mostrar: true, txtBtn: t("txtBtnValidar"), icono: <CheckCircleOutlineIcon />
        });
    };

    /**
     * Realiza la petición para eliminar el diagnóstico del paciente.
     */
    const borrarDiagnostico = async () => {
        const uid = id.split(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}-/);
        const res = await eliminarDiagnostico(id, uid[1], firestore);

        if (res.success) {
            navegacion.paginaAnterior.current = "/diagnosticos";
            navigate("/diagnosticos", { replace: true });
        } else {
            setCargando(false);
            setMostrarBtnSecundario(false);
            setModal({
                mostrar: true, titulo: t("tituloErr"), icono: <CloseIcon />,
                mensaje: t("errEliminarDiagnostico")
            });
        }
    };

    /**
     * Valida el diagnóstico del paciente.
     */
    const validarDiagnostico = async () => {
        setCargando(true);
        setErrorDiagnostico(false);
        const { id, medico } = diagOriginal;
        const aux = { ...diagOriginal };

        delete aux.id;
        delete aux.medico;

        const res = await cambiarDiagnostico(id, medico, { ...aux, validado: diagnostico }, firestore);

        if (res.success) {
            window.history.replaceState({}, '');
            setDiagnostico((x) => {
                x.personales.validado = diagnostico;
                return { ...x };
            });
        } else {
            setMostrarBtnSecundario(false);
            setModal({
                mostrar: true, titulo: t("tituloErr"), txtBtn: t("txtBtnCerrar"), icono: <CloseIcon />,
                mensaje: t("errValidarDiagnosticoApi")
            });
        }
        setCargando(false);
    };

    /**
     * Manejador del botón de cerrar el modal.
     */
    const manejadorBtnModal = () => {
        if (!modoEliminar && mostrarBtnSecundario && diagnostico != 2) {
            validarDiagnostico();
        } else if (!modoEliminar && mostrarBtnSecundario && diagnostico == 2) {
            setErrorDiagnostico(true);
            return;
        } else if (modoEliminar) {
            setCargando(true);
            borrarDiagnostico();
        }

        setModal({ ...modal, mostrar: false });
    };

    /**
     * Manejador del botón de eliminar diagnóstico.
     */
    const manejadorBtnEliminar = () => {
        setModoEliminar(true);
        cerrarPopover();
        setMostrarBtnSecundario(true);
        setModal({
            mostrar: true, titulo: t("titAlerta"), txtBtn: t("txtBtnEliminar"), icono: <DeleteIcon />,
            mensaje: t("txtEliminarDiagnostico")
        });
    };

    /**
     * Manejador del botón de más opciones.
     * @param {Event} event 
     */
    const manejadorBtnMas = (event) => {
        setPopOver(event.currentTarget);
    };

    /**
     * Cierra el popover de opciones.
     */
    const cerrarPopover = () => {
        setPopOver(null);
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

    /**
     * Botón para validar el diagnóstico del paciente.
     * @returns JSX.Element
     */
    const BtnValidar = () => {
        return ((diagnostico.personales.validado == 2 && !admin) ? (
            <Tooltip title={t("txtAyudaBtnValidar")}>
                <Fab onClick={manejadorBtnEditar}
                    color="primary"
                    variant="extended"
                    sx={{ textTransform: "none", display: "flex", position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
                    <CheckCircleOutlineIcon sx={{ mr: 1 }} />
                    <b>{t("txtBtnValidar")}</b>
                </Fab>
            </Tooltip>) : null);
    };

    /**
     * Componente para el cuerpo del modal.
     * @returns {JSX.Element}
     */
    const CuerpoModal = useCallback(() => {
        return (!admin ? (
            <FormSeleccionar
                onChange={setDiagnostico}
                texto={t("txtValidarDiagnostico")}
                error={errorDiagnostico}
                txtError={t("errValidarDiagnostico")}
                valor={diagnostico}
                valores={DIAGNOSTICOS} />) : null
        );
    }, [errorDiagnostico, diagnostico, admin]);

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
                            {admin ? (
                                <Grid size={12} display="flex" justifyContent="end" margin="-2vh 0vw">
                                    <Tooltip title={t("txtAyudaMasOpciones")}>
                                        <IconButton aria-describedby={elem} onClick={manejadorBtnMas}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Popover
                                        id={elem}
                                        open={open}
                                        anchorEl={popOver}
                                        onClose={cerrarPopover}
                                        anchorOrigin={{
                                            vertical: "bottom",
                                            horizontal: "left",
                                        }}
                                        transformOrigin={{
                                            vertical: "top",
                                            horizontal: "center",
                                        }}>
                                        <Tooltip title={t("txtAyudaEliminarDiagnostico")}>
                                            <Button
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={manejadorBtnEliminar}
                                                sx={{ textTransform: "none", padding: 2 }}>
                                                {t("txtBtnEliminar")}
                                            </Button>
                                        </Tooltip>
                                    </Popover>
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
                                            nombre={instancia}
                                            etiqueta={t(instancia)}
                                            desactivado={true}
                                            activado={diagnostico.personales[instancia]}
                                            manejadorCambios={null} />
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
                            {(diagnostico.comorbilidades.length > 0) ? (
                                <Grid size={12}>
                                    <ContComorbilidades comorbilidades={diagnostico.comorbilidades} />
                                </Grid>
                            ) : (
                                <Grid size={5}>
                                    <Typography variant="body1">
                                        <b>{t("txtNoComor")}</b>
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                        <BtnValidar />
                    </>
                )}
                <ModalDoble
                    abrir={modal.mostrar}
                    titulo={modal.titulo}
                    mensaje={modal.mensaje}
                    iconoBtnPrincipal={modal.icono}
                    manejadorBtnPrimario={manejadorBtnModal}
                    manejadorBtnSecundario={() => setModal((x) => ({ ...x, mostrar: false }))}
                    mostrarBtnSecundario={mostrarBtnSecundario}
                    txtBtnSimple={modal.txtBtn}
                    txtBtnSecundario={t("txtBtnCancelar")}
                    iconoBtnSecundario={<CloseIcon />}
                    txtBtnSimpleAlt={t("txtBtnCerrar")}>
                    <CuerpoModal />
                </ModalDoble>
            </MenuLayout>
        </>
    );
}