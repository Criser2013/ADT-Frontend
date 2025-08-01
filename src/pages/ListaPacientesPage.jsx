import { Button, Grid, Box, CircularProgress } from "@mui/material";
import { detTamCarga } from "../utils/Responsividad";
import MenuLayout from "../components/layout/MenuLayout";
import Datatable from "../components/tabs/Datatable";
import TabHeader from "../components/tabs/TabHeader";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router";
import { useNavegacion } from "../contexts/NavegacionContext";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useDrive } from "../contexts/DriveContext";
import dayjs from "dayjs";
import ModalAccion from "../components/modals/ModalAccion";
import customParseFormat from "dayjs/plugin/customParseFormat";

/**
 * Página para ver la lista de pacientes.
 * @returns JSX.Element
 */
export default function ListaPacientesPage() {
    const auth = useAuth();
    const drive = useDrive();
    const navigate = useNavigate();
    const navegacion = useNavegacion();
    const listadoPestanas = [{
        texto: "Lista de pacientes", url: "/pacientes"
    }];
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState({
        mostrar: false, titulo: "", mensaje: ""
    });
    const [eliminar, setEliminar] = useState(false);
    const [datos, setDatos] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]);
    const width = useMemo(() => {
        return detTamCarga(navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho);
    }, [navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho]);
    const campos = [
        { id: "nombre", label: "Nombre" },
        { id: "cedula", label: "Cédula" },
        { id: "telefono", label: "Teléfono" },
        { id: "sexo", label: "Sexo" },
        { id: "edad", label: "Edad" }
    ];

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
     * Coloca el título de la página.
     */
    useEffect(() => {
        document.title = "Lista de pacientes";

        if (drive.datos != null && !drive.descargando) {
            cargarDatos();
        }
    }, []);

    /**
     * Quita la pantalla de carga cuando se haya descargado el archivo de pacientes.
     */
    useEffect(() => {
        setCargando(drive.descargando);
    }, [drive.descargando]);

    /**
     * Actualiza los datos de la tabla cuando cambian los datos de Drive.
     */
    useEffect(() => {
        setDatos(
            drive.datos != null ?
            formatearCeldas(
                drive.datos.map((x) => ({ ...x }))
            ) : []
        );
    }, [drive.datos]);

    /**
     * Carga los datos de los pacientes desde Drive.
     */
    const cargarDatos = async () => {
        const res = await drive.cargarDatos();
        if (!res.success) {
            setModal({
                mostrar: true, mensaje: res.error,
                titulo: "Error al cargar los datos",
            });
        }
    };

    /**
     * Añade el campo edad y formatea el campo sexo.
     * @param {Array} datos - Lista de datos
     * @returns Array
     */
    const formatearCeldas = (datos) => {
        dayjs.extend(customParseFormat);
        return datos.map((dato,) => ({
            nombre: dato.nombre, cedula: dato.cedula,
            telefono: dato.telefono,
            edad: dayjs().diff(dayjs(
                dato.fechaNacimiento, "DD-MM-YYYY"), "year", false
            ),
            sexo: dato.sexo == 0 ? "Masculino" : "Femenino",
        }));
    };

    /**
     * Manejador del botón de anadir pacientes.
     */
    const manejadorBtnAnadir = () => {
        navegacion.setPaginaAnterior("/pacientes");
        navigate("/pacientes/anadir", { replace: true });
    };

    /**
     * Manejador de clic en el botón de eliminar pacientes de la tabla.
     * @param {Array} seleccionados - Lista de pacientes seleccionados.
     */
    const manejadorEliminar = (seleccionados) => {
        setSeleccionados(seleccionados);
        setEliminar(true);
        setModal({
            mostrar: true, titulo: "Alerta",
            mensaje: "¿Estás seguro de querer eliminar a los pacientes seleccionados?"
        });
    };

    /**
     * Manejador del clic en una celda de la tabla.
     * @param {JSON} dato - Instancia
     */
    const manejadorClicCelda = (dato) => {
        navegacion.setPaginaAnterior("/pacientes");
        navigate(`/pacientes/ver-paciente?cedula=${dato.cedula}`, { replace: true });
    };

    /**
     * Manejador del botón derecho del modal.
     */
    const manejadorBtnModal = async () => {
        if (eliminar) {
            setCargando(true);
            eliminarPacientes(seleccionados);
        }

        setModal({ ...modal, mostrar: false });
        setEliminar(false);
    };

    /**
     * Eliminar los pacientes seleccionados de Drive y maneja la respuesta.
     * @param {Array} pacientes - Lista de pacientes a eliminar.
     */
    const eliminarPacientes = async (pacientes) => {
        const res = await drive.eliminarPaciente(pacientes, true);
        if (!res.success) {
            setModal({
                mostrar: true,
                titulo: "Error a los pacientes.",
                mensaje: res.error
            });
        }
        setCargando(false);
    };

    return (
        <MenuLayout>
            {cargando ? (
                <Box display="flex" justifyContent="center" alignItems="center" width={width} height="85vh">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <TabHeader
                        activarBtnAtras={false}
                        titulo="Lista de pacientes"
                        pestanas={listadoPestanas} />
                    <Grid container columns={1} spacing={3} sx={{ marginTop: "3vh", width: width }}>
                        <Grid size={1} display="flex" justifyContent="end">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={manejadorBtnAnadir}
                                sx={{ textTransform: "none" }}
                                startIcon={<AddIcon />}>
                                <b>Añadir paciente</b>
                            </Button>
                        </Grid>
                        <Datatable
                            campos={campos}
                            datos={datos}
                            lblBusq="Buscar paciente por nombre o número de cédula"
                            activarBusqueda={true}
                            campoId="cedula"
                            terminoBusqueda={""}
                            lblSeleccion="pacientes seleccionados"
                            camposBusq={["nombre", "cedula"]}
                            cbClicCelda={manejadorClicCelda}
                            cbAccion={manejadorEliminar}
                            tooltipAccion="Eliminar pacientes seleccionados"
                            icono={<DeleteIcon />}
                        />
                    </Grid>
                </>)}
            <ModalAccion
                abrir={modal.mostrar}
                titulo={modal.titulo}
                mensaje={modal.mensaje}
                manejadorBtnPrimario={manejadorBtnModal}
                manejadorBtnSecundario={() => setModal((x) => ({ ...x, mostrar: false }))}
                mostrarBtnSecundario={eliminar}
                txtBtnSimple="Eliminar"
                txtBtnSecundario="Cancelar"
                txtBtnSimpleAlt="Cerrar" />
        </MenuLayout>
    );
};