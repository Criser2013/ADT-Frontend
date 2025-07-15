import {
    Box, Chip, CircularProgress, Grid, Typography, Divider, Stack, Fab, Tooltip,
    Button, Popover, IconButton
} from "@mui/material";
import { useDrive } from "../contexts/DriveContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavegacion } from "../contexts/NavegacionContext";
import { useEffect, useState, useMemo } from "react";
import TabHeader from "../components/tabs/TabHeader";
import MenuLayout from "../components/layout/MenuLayout";
import { detTamCarga } from "../utils/Responsividad";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { validarId } from "../utils/Validadores";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ModalAccion from "../components/modals/ModalAccion";
import { verDiagnostico } from "../firestore/diagnosticos-collection";
import { oneHotInversoOtraEnfermedad, detTxtDiagnostico } from "../utils/TratarDatos";
import { COMORBILIDADES } from "../../constants";
import { useCredenciales } from "../contexts/CredencialesContext";
import Check from "../components/tabs/Check";
import { Timestamp } from "firebase/firestore";

/**
 * Página para ver los datos de un paciente.
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
    const [modoEliminar, setModoEliminar] = useState(false);
    const [popOver, setPopOver] = useState(null);
    const open = Boolean(popOver);
    const elem = open ? "simple-popover" : undefined;
    const [modal, setModal] = useState({
        mostrar: false, mensaje: "", titulo: ""
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
    const [paciente, setPaciente] = useState({
        personales: { cedula: "", nombre: "" }, existe: false
    });
    const numCols = useMemo(() => {
            return navegacion.dispositivoMovil || (!navegacion.dispositivoMovil && (navegacion.ancho < 500)) ? 12 : 4;
        }, [navegacion.dispositivoMovil, navegacion.ancho]);
    const camposPersonales = useMemo(() => [
        { titulo: "Nombre", valor: paciente.personales.nombre },
        { titulo: "Sexo", valor: datos.personales.sexo == 0 ? "Masculino" : "Femenino" },
        { titulo: "Edad", valor: `${datos.personales.edad} años` },
        { titulo: "Fecha de diagnóstico", valor: datos.personales.fecha },
        { titulo: "Diagnóstico modelo", valor: detTxtDiagnostico(datos.personales.diagnostico) },
        { titulo: "Diagnóstico médico", valor: detTxtDiagnostico(datos.personales.validado) },
    ], [datos.personales]);
    const camposVitales = useMemo(() => [
        { titulo: "Presión sistólica", valor: datos.personales.presionSis },
        { titulo: "Presión diastólica", valor: datos.personales.presionDias },
        { titulo: "Frecuencia cardíaca", valor: datos.personales.frecCard },
        { titulo: "Frecuencia respiratoria", valor: datos.personales.frecRes },
        { titulo: "Saturación de la sangre (SO2)", valor: datos.personales.so2 },
    ], [datos.personales]);
    const camposExamenes = useMemo(() => [
        { titulo: "Conteo de plaquetas", valor: datos.personales.plaquetas },
        { titulo: "Hemoglobina", valor: datos.personales.hemoglobina },
        { titulo: "Conteo glóbulos blancos", valor: datos.personales.wbc },
    ], [datos.personales]);
    const listadoPestanas = [
        { texto: "Historial de diagnósticos", url: "/diagnosticos" },
        { texto: `Diagnóstico-${paciente.personales.nombre}-${datos.personales.fecha}`, url: `/diagnosticos/ver-diagnostico${location.search}` }
    ];
    const id = params.get("id");
    const sintomas = [
        { texto: "Fumador", nombre: "fumador" },
        { texto: "Bebedor", nombre: "bebedor" },
        { texto: "Tos", nombre: "tos" },
        { texto: "Fiebre", nombre: "fiebre" },
        { texto: "Edema de miembros inferiores", nombre: "edema" },
        { texto: "Inmovilidad de miembros inferiores", nombre: "inmovilidad" },
        { texto: "Procedimiento quirúrgico reciente", nombre: "cirugiaReciente" },
        { texto: "Síntomas disautonómicos", nombre: "disautonomicos" },
        { texto: "Viaje prolongado", nombre: "viajeProlongado" },
        { texto: "Disnea", nombre: "disnea" },
        { texto: "Sibilancias", nombre: "sibilancias" },
        { texto: "Crepitaciones", nombre: "crepitaciones" },
        { texto: "Derrame", nombre: "derrame" },
        { texto: "Malignidad", nombre: "malignidad" },
        { texto: "Hemoptisis", nombre: "hemoptisis" },
        { texto: "Dolor torácico", nombre: "dolorToracico" },
        { texto: "TEP - TVP previo", nombre: "tepPrevio" },
        { texto: "Soplos", nombre: "soplos" }
    ];
    //const rol = auth.authInfo.rol;

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
        if (datos == null) {
            cargarDatosDiagnostico();
        } else if (datos != null) {
            cargarDatosPaciente(datos.paciente);
            setDatos(preprocesarDiag(datos));
        }

        setCargando(drive.descargando);
    }, [drive.descargando]);

    /**
     * Coloca el título de la página.
     */
    useEffect(() => {
        document.title = `${id != "" ? `Diagnóstico — ${id}` : "Ver diagnóstico"}`;
        const res = (id != null && id != undefined) ? validarId(id) : false;

        if (!res) {
            //navigate("/diagnosticos", { replace: true });
        }

        navegacion.setPaginaAnterior("/diagnosticos");
    }, [paciente.nombre]);

    /**
     * Carga los datos del diagnóstico.
     */
    const cargarDatosDiagnostico = async () => {
        const DB = credenciales.obtenerInstanciaDB();
        const datos = await verDiagnostico(id, DB);

        if (datos.success && datos.data != []) {
            dayjs.extend(customParseFormat);
            datos.data.fecha = dayjs(datos.data.fecha.toDate()).format("DD [de] MMMM [de] YYYY");
            cargarDatosPaciente(datos.data.paciente);
            preprocesarDiag(datos.data);
        } else {
            //navigate("/diagnosticos", { replace: true });
        }
    };

    /**
     * Carga los datos del paciente asociado al diagnóstico.
     * @param {String} cedula - Cédula del paciente.
     */
    const cargarDatosPaciente = (cedula) => {
        const res = drive.cargarDatosPaciente(cedula);
        if (res.success) {
            setPaciente({ ...res.data, existe: true });
        } else {
            setPaciente({ cedula: cedula, nombre: "", existe: false });
        }
    };

    /**
     * Separa los datos del diagnóstico en comorbilidades y otros datos.
     * @param {JSON} datos - Datos del diagnóstico.
     */
    const preprocesarDiag = (datos) => {
        const res = oneHotInversoOtraEnfermedad(datos);

        for (const i of COMORBILIDADES) {
            delete datos[i];
        }

        setDatos({ personales: datos, comorbilidades: res });
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
        navegacion.setPaginaAnterior(`/pacientes/ver-paciente?cedula=${datos.personales.cedula}`);
        navigate(`/pacientes/editar?cedula=${datos.personales.cedula}`, { replace: true });
    };

    /*const eliminarDiagnostico = async () => {

    };*/

    /**
     * Manejador del botón de cerrar el modal.
     */
    const manejadorBtnModal = () => {
        if (modoEliminar) {
            //eliminarPaciente();
        }

        setModoEliminar(false);
        setModal({ ...modal, mostrar: false });
    };

    /**
     * Manejador del botón de eliminar paciente.
     */
    const manejadorBtnEliminar = () => {
        cerrarPopover();
        setModoEliminar(true);
        setModal({
            mostrar: true, titulo: "Alerta",
            mensaje: "¿Estás seguro de que deseas eliminar este paciente?"
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

    const CamposTexto = ({ campo, indice }) => {
        return (
            <Grid size={detVisualizacion(indice)}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body1">
                        <b>{campo.titulo}: </b>
                    </Typography>
                    <Typography variant="body1">
                        {campo.valor}
                    </Typography>
                </Stack>
            </Grid>
        );
    };

    return (
        <>
            <MenuLayout>
                {cargando ? (
                    <Box display="flex" justifyContent="center" alignItems="center" width={detTamCarga(navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho)} height="85vh">
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
                            paddingLeft={!navegacion.dispositivoMovil ? "3vh" : "0vh"}
                            paddingRight={!navegacion.dispositivoMovil ? "3vh" : "0vh"}
                            marginTop="3vh">
                            <Grid size={12} display="flex" justifyContent="end">
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
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="h5">
                                    Datos personales
                                </Typography>
                            </Grid>
                            {camposPersonales.map((campo, index) => (
                                <CamposTexto key={index} campo={campo} indice={index} />
                            ))}
                            <Grid size={12}>
                                <Divider />
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="h5">
                                    Síntomas clínicos
                                </Typography>
                            </Grid>
                            <Grid container size={12} columns={12} columnSpacing={0} rowSpacing={0} rowGap={0} columnGap={0}>
                                {sintomas.map((x) => (
                                    <Grid size={numCols} key={x.nombre}>
                                        <Check
                                            nombre={x.nombre}
                                            etiqueta={x.texto}
                                            desactivado={true}
                                            checked={datos.personales[x.nombre]}
                                            manejadorCambios={null} />
                                    </Grid>
                                ))}
                            </Grid>
                            <Grid size={12}>
                                <Divider />
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="h5">
                                    Signos vitales
                                </Typography>
                            </Grid>
                            {camposVitales.map((campo, index) => (
                                <CamposTexto key={index} campo={campo} indice={index} />
                            ))}
                            <Grid size={12}>
                                <Divider />
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="h5">
                                    Exámenes de laboratorio
                                </Typography>
                            </Grid>
                            {camposExamenes.map((campo, index) => (
                                <CamposTexto key={index} campo={campo} indice={index} />
                            ))}
                            <Grid size={12}>
                                <Divider />
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="h5">
                                    Condiciones médicas preexistentes
                                </Typography>
                            </Grid>
                            {(datos.comorbilidades.length > 0) ? (
                                <Grid size={12}>
                                    <Box
                                        borderColor="blue"
                                        borderRadius={3}
                                        border={1}
                                        padding="2vh"
                                        style={{ borderColor: "#adadad" }}
                                        sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                        {datos.comorbilidades.map((comorbilidad) => (
                                            <Chip
                                                key={comorbilidad}
                                                label={comorbilidad}
                                                color="info"
                                                variant="outlined"
                                                size="medium" />
                                        ))}
                                    </Box>
                                </Grid>
                            ) : (
                                <Grid size={5}>
                                    <Typography variant="body1">
                                        <b>No se registraron comorbilidades.</b>
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                        <Tooltip title="Ve al formulario para editar los datos del paciente">
                            <Fab onClick={manejadorBtnEditar}
                                color="primary"
                                variant="extended"
                                sx={{ textTransform: "none", display: "flex", position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
                                <EditIcon sx={{ mr: 1 }} />
                                <b>Editar</b>
                            </Fab>
                        </Tooltip>
                    </>
                )
                }
                <ModalAccion
                    abrir={modal.mostrar}
                    titulo={modal.titulo}
                    mensaje={modal.mensaje}
                    manejadorBtnPrimario={manejadorBtnModal}
                    manejadorBtnSecundario={() => setModal((x) => ({ ...x, mostrar: false }))}
                    mostrarBtnSecundario={modoEliminar}
                    txtBtnSimple="Eliminar"
                    txtBtnSecundario="Cancelar"
                    txtBtnSimpleAlt="Cerrar" />
            </MenuLayout>
        </>
    );
}