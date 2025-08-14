import {
    Box, CircularProgress, Grid, Typography, Divider, Stack, Fab, Tooltip,
    Button, Popover, IconButton
} from "@mui/material";
import { useDrive } from "../../contexts/DriveContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { useEffect, useMemo, useState } from "react";
import TabHeader from "../../components/layout/TabHeader";
import MenuLayout from "../../components/layout/MenuLayout";
import { useNavigate, useSearchParams } from "react-router";
import { validarId } from "../../utils/Validadores";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ModalAccion from "../../components/modals/ModalAccion";
import ContComorbilidades from "../../components/diagnosticos/ContComorbilidades";
import { ChipSexo } from "../../components/tabs/Chips";

/**
 * Página para ver los datos de un paciente.
 * @returns {JSX.Element}
 */
export default function VerPacientePage() {
    const auth = useAuth();
    const drive = useDrive();
    const navegacion = useNavegacion();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [cargando, setCargando] = useState(true);
    const [modoEliminar, setModoEliminar] = useState(false);
    const [archivoDescargado, setArchivoDescargado] = useState(false);
    const [popOver, setPopOver] = useState(null);
    const open = Boolean(popOver);
    const elem = open ? "simple-popover" : undefined;
    const [modal, setModal] = useState({
        mostrar: false, mensaje: "", titulo: "", icono: null
    });
    const [datos, setDatos] = useState({
        personales: {
            id: "", nombre: "", cedula: "", sexo: "",
            telefono: "", fechaNacimiento: "",
            edad: ""
        },
        comorbilidades: []
    });
    const padding = useMemo(() => !navegacion.dispositivoMovil ? "2vh" : "0vh", [navegacion.dispositivoMovil]);
    const campos = useMemo(() => [
        { titulo: "Nombre", valor: datos.personales.nombre },
        { titulo: "Cédula", valor: datos.personales.cedula },
        { titulo: "Fecha de nacimiento", valor: datos.personales.fechaNacimiento },
        { titulo: "Edad", valor: `${datos.personales.edad} años` },
        { titulo: "Teléfono", valor: datos.personales.telefono },
        { titulo: "Sexo", valor: datos.personales.sexo == 0 ? "Masculino" : "Femenino" }
    ], [datos.personales]);
    const listadoPestanas = useMemo(() => [
        { texto: "Lista de pacientes", url: "/pacientes" },
        { texto: `Paciente-${datos.personales.nombre}`, url: `/pacientes/ver-paciente${location.search}` }
    ], [datos.personales.nombre, location.search]);
    const mostrarComor = useMemo(() => {
        return datos.comorbilidades.length > 0;
    }, [datos.comorbilidades]);
    const id = useMemo(() => params.get("id"), [params]);

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
        const descargar = sessionStorage.getItem("descargando-drive");
        if (drive.token != null && (descargar == null || descargar == "false")) {
            sessionStorage.setItem("descargando-drive", "true");
            cargarDatos();
        }
    }, [drive.token]);

    useEffect(() => {
        setCargando(drive.descargando);
    }, [drive.descargando]);

    /**
     * Coloca el título de la página.
     */
    useEffect(() => {
        document.title = `${datos.personales.nombre != "" ? `Paciente — ${datos.personales.nombre}` : "Ver paciente"}`;
        const res = (id != null && id != undefined) ? validarId(id) : false;

        if (!res) {
            navigate("/pacientes", { replace: true });
        }

        navegacion.setPaginaAnterior("/pacientes");
    }, [datos.personales.nombre]);


    /**
     * Una vez se carguen los datos de los pacientes, se cargan los datos del paciente.
     */
    useEffect(() => {
        if (drive.datos != null && archivoDescargado) {
            cargarPaciente();
        }
    }, [drive.datos, archivoDescargado]);

    /**
     * Carga los datos de los pacientes.
     */
    const cargarDatos = async () => {
        let res = await drive.cargarDatos();

        if (!res.success) {
            setModal({
                mostrar: true, mensaje: res.error,
                titulo: "❌ Error al cargar los datos de los pacientes",
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
            res.data.personales.edad = dayjs().diff(dayjs(
                res.data.personales.fechaNacimiento, "DD-MM-YYYY"), "year", false
            );
            res.data.personales.fechaNacimiento = dayjs(
                res.data.personales.fechaNacimiento, "DD-MM-YYYY"
            ).format("DD [de] MMMM [de] YYYY");
            setDatos(res.data);
            setCargando(false);
        } else {
            navigate("/pacientes", { replace: true });
        }
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

        if (indice == 2 && dispositivoMovil && ((orientacion == "horizontal" && mostrarMenu) || orientacion == "vertical")) {
            return 12;
        }
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
        navegacion.setPaginaAnterior(`/pacientes/ver-paciente?id=${datos.personales.id}`);
        navigate(`/pacientes/editar?id=${datos.personales.id}`, { replace: true });
    };

    /**
     * Elimina el paciente actual de la hoja de Excel.
     */
    const eliminarPaciente = async () => {
        setCargando(true);
        const res = await drive.eliminarPaciente(datos.personales.id);
        if (res.success) {
            navigate("/pacientes", { replace: true });
        } else {
            setCargando(false);
            setModal({ mostrar: true, titulo: "❌ Error", mensaje: res.error, icono: <CloseIcon /> });
        }
    };

    /**
     * Manejador del botón de cerrar el modal.
     */
    const manejadorBtnModal = () => {
        if (modoEliminar) {
            eliminarPaciente();
        }

        if (!archivoDescargado) {
            navigate("/pacientes", { replace: true });
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
            mostrar: true, titulo: "⚠️ Alerta", icono: <DeleteIcon />,
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
                            urlPredet="/pacientes"
                            titulo="Datos del paciente"
                            pestanas={listadoPestanas}
                            tooltip="Volver a la pestaña de pacientes" />
                        <Grid container
                            columns={12}
                            spacing={1}
                            paddingRight={padding}
                            marginTop="3vh">
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
                            </Grid>
                            {campos.map((campo, index) => (
                                <Grid key={index} size={detVisualizacion(index)}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="body1">
                                            <b>{campo.titulo}: </b>
                                        </Typography>
                                        {(campo.titulo == "Sexo") ? <ChipSexo sexo={campo.valor} /> : (
                                            <Typography variant="body1">
                                                {campo.valor}
                                            </Typography>)}
                                    </Stack>
                                </Grid>
                            ))}
                            <Grid size={12}>
                                <Divider />
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="h6">
                                    <b>Condiciones médicas preexistentes</b>
                                </Typography>
                            </Grid>
                            {mostrarComor ? (
                                <Grid size={12}>
                                    <ContComorbilidades comorbilidades={datos.comorbilidades} />
                                </Grid>
                            ) : (
                                <Grid size={12}>
                                    <Typography variant="body1">
                                        <b>No se han registrado comorbilidades.</b>
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
                )}
                <ModalAccion
                    abrir={modal.mostrar}
                    titulo={modal.titulo}
                    mensaje={modal.mensaje}
                    iconoBtnPrincipal={modal.icono}
                    iconoBtnSecundario={<CloseIcon />}
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