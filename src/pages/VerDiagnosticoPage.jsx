import {
    Box, CircularProgress, Grid, Typography, Divider, Stack, Fab, Tooltip,
    Button, Popover, IconButton
} from "@mui/material";
import { useDrive } from "../contexts/DriveContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavegacion } from "../contexts/NavegacionContext";
import { useEffect, useState, useMemo, useCallback } from "react";
import TabHeader from "../components/tabs/TabHeader";
import MenuLayout from "../components/layout/MenuLayout";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { validarId } from "../utils/Validadores";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ModalAccion from "../components/modals/ModalAccion";
import { cambiarDiagnostico, eliminarDiagnosticos, verDiagnostico } from "../firestore/diagnosticos-collection";
import { oneHotInversoOtraEnfermedad, detTxtDiagnostico } from "../utils/TratarDatos";
import { COMORBILIDADES, DIAGNOSTICOS } from "../../constants";
import { useCredenciales } from "../contexts/CredencialesContext";
import Check from "../components/tabs/Check";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FormSeleccionar from "../components/tabs/FormSeleccionar";
import { CODIGO_ADMIN } from "../../constants";
import { SINTOMAS } from "../../constants";
import ContComorbilidades from "../components/tabs/ContComorbilidades";
import { peticionApi } from "../services/Api";
import { Timestamp } from "firebase/firestore";
import { ChipDiagnostico, ChipSexo, ChipValidado } from "../components/tabs/Chips";

/**
 * Página para ver los datos de un diagnóstico.
 * @returns JSX.Element
 */
export default function VerDiagnosticoPage() {
    const auth = useAuth();
    const drive = useDrive();
    const credenciales = useCredenciales();
    const navegacion = useNavegacion();
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();
    const [cargando, setCargando] = useState(true);
    const [mostrarBtnSecundario, setMostrarBtnSecundario] = useState(true);
    const [modoEliminar, setModoEliminar] = useState(false);
    const [popOver, setPopOver] = useState(null);
    const open = Boolean(popOver);
    const elem = open ? "simple-popover" : undefined;
    const [modal, setModal] = useState({
        mostrar: false, mensaje: "", titulo: "", txtBtn: "Validar", icono: null
    });
    const [datos, setDatos] = useState({
        personales: {
            id: "", fumador: 0, wbc: "", viajeProlongado: 0,
            validado: 2, fecha: dayjs().format("DD/MM/YYYY"),
            sexo: 0, tos: 0, tepPrevio: 0, soplos: 0,
            so2: 0, sibilancias: 0, probabilidad: 0, presionSis: "",
            presionDias: "", plaquetas: "", otraEnfermedad: 0,
            medico: "", malignidad: 0, inmovilidad: 0, hemoptisis: 0,
            hemoglobina: "", frecRes: "", frecCard: "", fiebre: 0,
            edema: 0, edad: "", dolorToracico: 0, disnea: 0,
            disautonomicos: 0, diagnostico: 0, derrame: 0, crepitaciones: 0,
            cirugiaReciente: 0, bebdor: 0
        },
        comorbilidades: []
    });
    const [persona, setPersona] = useState({
        id: "", nombre: ""
    });
    const rol = useMemo(() => auth.authInfo.rolVisible, [auth.authInfo.rolVisible]);
    const [errorDiagnostico, setErrorDiagnostico] = useState(false);
    const [diagnostico, setDiagnostico] = useState(datos.personales.validado);
    const [diagOriginal, setDiagOriginal] = useState({});
    const numCols = useMemo(() => {
        const exp = (navegacion.dispositivoMovil && navegacion.orientacion == "vertical") || (!navegacion.dispositivoMovil && (navegacion.ancho < 500));
        return exp ? 12 : 4;
    }, [navegacion.dispositivoMovil, navegacion.ancho, navegacion.orientacion]);
    const camposPersonales = useMemo(() => {
        const campos = [
            { titulo: (rol == CODIGO_ADMIN) ? "Médico" : "Paciente", valor: persona.nombre },
            { titulo: "Sexo", valor: datos.personales.sexo == 0 ? "Masculino" : "Femenino" },
            { titulo: "Edad", valor: `${datos.personales.edad} años` },
            { titulo: "Fecha de diagnóstico", valor: datos.personales.fecha },
            { titulo: "Diagnóstico modelo", valor: detTxtDiagnostico(datos.personales.diagnostico) },
            { titulo: "Probabilidad", valor: `${(datos.personales.probabilidad * 100).toFixed(2)}%` },
            { titulo: "Diagnóstico médico", valor: detTxtDiagnostico(datos.personales.validado) },
        ];

        if (rol == CODIGO_ADMIN) {
            campos.unshift({ titulo: "ID", valor: datos.personales.id });
        }

        return campos;
    }, [rol, datos.personales.validado, persona.nombre]);
    const camposVitales = useMemo(() => [
        { titulo: "Presión sistólica", valor: `${datos.personales.presionSis} mmHg.` },
        { titulo: "Presión diastólica", valor: `${datos.personales.presionDias} mmHg.` },
        { titulo: "Frecuencia cardíaca", valor: `${datos.personales.frecCard} lpm.` },
        { titulo: "Frecuencia respiratoria", valor: `${datos.personales.frecRes} rpm.` },
        { titulo: "Saturación de la sangre (SO2)", valor: `${datos.personales.so2} %` },
    ], [datos.personales]);
    const camposExamenes = useMemo(() => [
        { titulo: "Conteo de plaquetas", valor: `${datos.personales.plaquetas} /µL.` },
        { titulo: "Hemoglobina", valor: `${datos.personales.hemoglobina} g/dL.` },
        { titulo: "Conteo glóbulos blancos", valor: `${datos.personales.wbc} /µL.` },
    ], [datos.personales]);
    const listadoPestanas = useMemo(() => {
        let tit1 = "Histotrial de diagnósticos";
        let tit2 = `Diagnóstico-${persona.nombre}-${datos.personales.fecha}`;

        if (rol == CODIGO_ADMIN) {
            tit1 = "Datos recolectados";
            tit2 = `Diagnóstico-${datos.personales.id}`;
        }

        return [
            { texto: tit1, url: "/diagnosticos" },
            { texto: tit2, url: `/diagnosticos/ver-diagnostico${location.search}` }
        ];
    }, [persona.nombre, datos.personales.fecha, location.search, rol]);
    const titulo = useMemo(() => {
        if (rol == CODIGO_ADMIN) {
            return persona.nombre != "" ? `Diagnóstico — ${datos.personales.id}` : "Datos del diagnóstico";
        } else {
            return persona.nombre != "" ? `Diagnóstico — ${persona.nombre}` : "Ver diagnóstico";
        }
    }, [rol, persona.nombre, datos.personales.id]);
    const id = useMemo(() => params.get("id"), [params]);
    const DB = useMemo(() => credenciales.obtenerInstanciaDB(), [credenciales.obtenerInstanciaDB()]);

    /**
     * Carga el token de sesión y comienza a descargar el archivo de pacientes.
     */
    useEffect(() => {
        const token = sessionStorage.getItem("session-tokens");
        if (token != null) {
            drive.setToken(JSON.parse(token).accessToken);
        } else if (auth.tokenDrive != null) {
            drive.setToken(auth.tokenDrive);
        }
    }, [auth.tokenDrive]);

    /**
     * Quita la pantalla de carga cuando se haya descargado el archivo de pacientes.
     */
    useEffect(() => {
        const datos = location.state;
        if (datos == null && rol != null && DB != null) {
            cargarDatosDiagnostico(auth.authInfo.user.accessToken);
        } else if (datos != null && rol != null && DB != null) {
            cargarDatosPaciente(datos.paciente);
            datos.fecha = new Timestamp(datos.fecha.seconds, datos.fecha.nanoseconds);
            setDiagOriginal({ ...datos });
            preprocesarDiag(datos);
        }
    }, [drive.descargando, auth.authInfo.user, rol, DB]);

    /**
     * Coloca el título de la página.
     */
    useEffect(() => {
        document.title = titulo;
        const res = (id != null && id != undefined) ? validarId(id) : false;

        if (!res) {
            navigate("/diagnosticos", { replace: true });
        }
    }, [titulo]);

    /**
     * Carga los datos del diagnóstico.
     */
    const cargarDatosDiagnostico = async (token) => {
        const datos = await verDiagnostico(id, DB);

        if (datos.success && datos.data != []) {
            setDiagOriginal({ ...datos.data });

            if (rol == CODIGO_ADMIN) {
                await cargarDatosMedico(token, datos.data.medico);
            } else {
                cargarDatosPaciente(datos.data.paciente);
            }

            preprocesarDiag(datos.data);
        } else if (DB != null && !datos.success) {
            navigate("/diagnosticos", { replace: true });
        }
    };

    /**
     * Carga los datos del paciente asociado al diagnóstico.
     * @param {String} id - ID del paciente.
     */
    const cargarDatosPaciente = (id) => {
        const res = drive.cargarDatosPaciente(id);
        if (res.success) {
            setPersona({ ...res.data.personales });
        } else {
            setPersona({ id: id, nombre: "N/A" });
        }
    };

    /**
     * Carga el nombre del médico que realizó el diagnóstico.
     * @param {String} uid - UID del médico.
     * @returns {String|null}
     */
    const cargarDatosMedico = async (token, uid) => {
        uid = encodeURIComponent(uid);
        const res = await peticionApi(token, `admin/usuarios/${uid}`, "GET", null,
            "Ha ocurrido un error al cargar los usuarios. Por favor reintenta nuevamente."
        );

        setPersona((x) => ({ ...x, nombre: res.success ? res.data.nombre : res.data.correo }));
    };

    /**
     * Separa los datos del diagnóstico en comorbilidades y otros datos.
     * @param {JSON} datos - Datos del diagnóstico.
     */
    const preprocesarDiag = (datos) => {
        const aux = { ...datos };
        const res = oneHotInversoOtraEnfermedad(aux);

        for (const i of COMORBILIDADES) {
            delete aux[i];
        }
        dayjs.extend(customParseFormat);

        aux.fecha = dayjs(datos.fecha.toDate()).format("DD [de] MMMM [de] YYYY");
        setDatos({ personales: aux, comorbilidades: res });
        setCargando(false);
    };

    /**
     * Determina el tamaño del elemento dentro de la malla.
     * Si se visualiza desde un dispositivo movil en orientación horizontal y el menú o en escritorio,
     * se ajusta el contenido a 2 columnas, en caso contrario se deja en 1 columna.
     * @param {Int} indice 
     * @returns Int
     */
    const detVisualizacion = (indice) => {
        const { orientacion, mostrarMenu, dispositivoMovil } = navegacion;
        if (dispositivoMovil && (orientacion == "vertical" || (orientacion == "horizontal" && mostrarMenu))) {
            return 12;
        } else {
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
            titulo: "Validar diagnóstico", mensaje: "",
            mostrar: true, txtBtn: "Validar", icono: <CheckCircleOutlineIcon />
        });
    };

    /**
     * Realiza la petición para eliminar el diagnóstico del paciente.
     */
    const eliminarDiagnostico = async () => {
        const res = await eliminarDiagnosticos(id, DB);

        if (res.success) {
            navegacion.setPaginaAnterior("/diagnosticos");
            navigate("/diagnosticos", { replace: true });
        } else {
            setCargando(false);
            setMostrarBtnSecundario(false);
            setModal({
                mostrar: true, titulo: "❌ Error", icono: <CloseIcon />,
                mensaje: "No se pudo eliminar el diagnóstico. Inténtalo de nuevo más tarde."
            });
        }
    };

    /**
     * Valida el diagnóstico del paciente.
     */
    const validarDiagnostico = async () => {
        setCargando(true);
        setErrorDiagnostico(false);
        const DB = credenciales.obtenerInstanciaDB();
        const res = await cambiarDiagnostico({ ...diagOriginal, validado: diagnostico }, DB);

        if (res.success) {
            setDatos((x) => {
                x.personales.validado = diagnostico;
                return { ...x };
            });
        } else {
            setMostrarBtnSecundario(false);
            setModal({
                mostrar: true, titulo: "❌ Error", txtBtn: "Cerrar", icono: <CloseIcon />,
                mensaje: "No se pudo validar el diagnóstico. Inténtalo de nuevo más tarde."
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
            eliminarDiagnostico();
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
            mostrar: true, titulo: "⚠️ Alerta", txtBtn: "Eliminar", icono: <DeleteIcon />,
            mensaje: "¿Estás seguro de que deseas eliminar este diagnóstico?"
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
     * @returns JSX.Element
     */
    const CamposTexto = ({ campo, indice }) => {
        return (
            <Grid size={detVisualizacion(indice)}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body1">
                        <b>{campo.titulo}: </b>
                    </Typography>
                    {(campo.titulo == "Sexo") ? <ChipSexo sexo={campo.valor} /> : null}
                    {(campo.titulo == "Diagnóstico modelo") ? <ChipDiagnostico diagnostico={campo.valor} /> : null}
                    {(campo.titulo == "Diagnóstico médico") ? <ChipValidado validado={campo.valor} /> : null}
                    {(campo.titulo != "Sexo"&& campo.titulo != "Diagnóstico modelo" && campo.titulo != "Diagnóstico médico") ? (
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
        return ((datos.personales.validado == 2 && rol != CODIGO_ADMIN) ? (
            <Tooltip title="Valida el diagnóstico del paciente.">
                <Fab onClick={manejadorBtnEditar}
                    color="primary"
                    variant="extended"
                    sx={{ textTransform: "none", display: "flex", position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
                    <CheckCircleOutlineIcon sx={{ mr: 1 }} />
                    <b>Validar</b>
                </Fab>
            </Tooltip>) : null);
    };

    /**
     * Check para mostrar los síntomas clínicos del diagnóstico.
     * @param {JSON} instancia - Datos del síntoma. 
     * @returns JSX.Element
     */
    const CheckSintoma = ({ instancia }) => {
        return (
            <Grid size={numCols}>
                <Check
                    nombre={instancia.nombre}
                    etiqueta={instancia.texto}
                    desactivado={true}
                    activado={datos.personales[instancia.nombre]}
                    manejadorCambios={null} />
            </Grid>);
    };

    /**
     * Componente para el cuerpo del modal.
     * @returns {JSX.Element}
     */
    const CuerpoModal = useCallback(() => {
        return ((rol != CODIGO_ADMIN) ? (
            <FormSeleccionar
                onChange={setDiagnostico}
                texto="Selecciona el diagnóstico médico del paciente:"
                error={errorDiagnostico}
                txtError="Selecciona el diagnóstico definitivo del paciente"
                valor={diagnostico}
                valores={DIAGNOSTICOS} />) : null
        );
    }, [errorDiagnostico, diagnostico, rol]);

    return (
        <>
            <MenuLayout>
                {cargando ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="85vh">
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TabHeader
                            urlPredet="/diagnosticos"
                            titulo="Datos del diagnóstico"
                            pestanas={listadoPestanas}
                            tooltip="Volver a la pestaña de diagnósticos." />
                        <Grid container
                            columns={12}
                            spacing={1}
                            marginTop="3vh">
                            {(rol == CODIGO_ADMIN) ? (
                                <Grid size={12} display="flex" justifyContent="end" margin="-2vh 0vw">
                                    <Tooltip title="Ver más opciones.">
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
                                        <Tooltip title="Eliminar paciente">
                                            <Button
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={manejadorBtnEliminar}
                                                sx={{ textTransform: "none", padding: 2 }}>
                                                Eliminar
                                            </Button>
                                        </Tooltip>
                                    </Popover>
                                </Grid>) : null}
                            <Grid size={12}>
                                <Typography variant="h5" paddingBottom="2vh">
                                    Datos personales
                                </Typography>
                            </Grid>
                            {camposPersonales.map((campo, index) => (
                                <CamposTexto key={index} campo={campo} indice={index} />
                            ))}
                            <Grid size={12} paddingTop="3vh">
                                <Divider />
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="h5" paddingBottom="0.2vh">
                                    Síntomas clínicos
                                </Typography>
                            </Grid>
                            <Grid container size={12} columns={12} columnSpacing={0} rowSpacing={0} rowGap={0} columnGap={0}>
                                {SINTOMAS.map((x) => (
                                    <CheckSintoma instancia={x} key={x.nombre} />
                                ))}
                            </Grid>
                            <Grid size={12} paddingTop="3vh">
                                <Divider />
                            </Grid>
                            <Grid size={12} paddingBottom="2vh">
                                <Typography variant="h5">
                                    Signos vitales
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
                                    Exámenes de laboratorio
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
                                    Condiciones médicas preexistentes
                                </Typography>
                            </Grid>
                            {(datos.comorbilidades.length > 0) ? (
                                <Grid size={12}>
                                    <ContComorbilidades comorbilidades={datos.comorbilidades} />
                                </Grid>
                            ) : (
                                <Grid size={5}>
                                    <Typography variant="body1">
                                        <b>No se registraron comorbilidades.</b>
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                        <BtnValidar />
                    </>
                )}
                <ModalAccion
                    abrir={modal.mostrar}
                    titulo={modal.titulo}
                    mensaje={modal.mensaje}
                    iconoBtnPrincipal={modal.icono}
                    manejadorBtnPrimario={manejadorBtnModal}
                    manejadorBtnSecundario={() => setModal((x) => ({ ...x, mostrar: false }))}
                    mostrarBtnSecundario={mostrarBtnSecundario}
                    txtBtnSimple={modal.txtBtn}
                    txtBtnSecundario="Cancelar"
                    iconoBtnSecundario={<CloseIcon />}
                    txtBtnSimpleAlt="Cerrar">
                    <CuerpoModal />
                </ModalAccion>
            </MenuLayout>
        </>
    );
}