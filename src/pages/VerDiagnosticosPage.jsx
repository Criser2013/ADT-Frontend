import { Grid, Box, CircularProgress } from "@mui/material";
import { detTamCarga } from "../utils/Responsividad";
import MenuLayout from "../components/layout/MenuLayout";
import Datatable from "../components/tabs/Datatable";
import TabHeader from "../components/tabs/TabHeader";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router";
import { useNavegacion } from "../contexts/NavegacionContext";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useDrive } from "../contexts/DriveContext";
import dayjs from "dayjs";
import ModalAccion from "../components/modals/ModalAccion";
import { useCredenciales } from "../contexts/CredencialesContext";
import { verDiagnosticos, verDiagnosticosPorMedico } from "../firestore/diagnosticos-collection";
import { verUsuario, verUsuarios } from "../firestore/usuarios-collection";
import { detTxtDiagnostico } from "../utils/TratarDatos";

export default function VerDiagnosticosPage() {
    const auth = useAuth();
    const drive = useDrive();
    const navigate = useNavigate();
    const navegacion = useNavegacion();
    const credenciales = useCredenciales();
    const listadoPestanas = [{
        texto: "Historial diagnósticos", url: "/diagnosticos"
    }];
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState({
        mostrar: false, titulo: "", mensaje: ""
    });
    const [eliminar, setEliminar] = useState(false);
    const [datos, setDatos] = useState([]);
    const [diagnosticos, setDiagnosticos] = useState(null);
    const [personas, setPersonas] = useState(null);
    const [seleccionados, setSeleccionados] = useState([]);
    const width = useMemo(() => {
        return detTamCarga(navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho);
    }, [navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho]);
    const { rol } = auth.authInfo;
    const DB = credenciales.obtenerInstanciaDB();
    const camposVariables = (rol == 0) ? [
        { id: "nombre", label: "Paciente" },
        { id: "paciente", label: "Cédula" }
    ] : [{ id: "nombre", label: "Médico" }];
    const camposFijos = camposVariables.concat([
        { id: "fecha", label: "Fecha" },
        { id: "edad", label: "Edad" },
        { id: "sexo", label: "Sexo" },
        { id: "diagnostico", label: "Diagnóstico modelo" },
        { id: "validado", label: "Diagnóstico médico" }
    ]);

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
     * Carga los diagnósticos y los pacientes dependiendo del rol del usuario.
     */
    useEffect(() => {
        document.title = rol == 0 ? "Historial de diagnósticos" : "Lista de diagnósticos";
        const { correo } = auth.authInfo;
        
        if (rol != null && correo != null && DB != null) {
            cargarDiagnosticos(correo, rol, DB);
        }

        if (rol == 0) {
            cargarPacientes();
        }
    }, [auth.authInfo.correo, rol, DB]);

    /**
     * Una vez se cargan los diagnósticos y los pacientes, formatea las celdas.
     */
    useEffect(() => {
        if (diagnosticos != null && personas != null) {
            setDatos(formatearCeldas(personas, diagnosticos));
            setCargando(false);
            console.log("xddd")
        } else {
            setDatos([]);
        }
    }, [diagnosticos, personas]);

    /**
     * Carga los datos de los pacientes desde Drive y luego los diagnósticos.
     */
    const cargarPacientes = async () => {
        const res = await drive.cargarDatos();
        if (res.success) {
            setPersonas(drive.datos);
        } else {
            setModal({
                titulo: "Error al cargar los datos de los pacientes",
                mensaje: res.error
            });
        }
    };

    /**
     * Carga los datos de los diagnósticos y dependiendo del rol, de los médicos.
     * @param {String} correo - Correo del médico.
     * @param {Number} rol - Rol del usuario (0: médico, 1001: administrador).
     * @param {Object} DB - Instancia de Firestore.
     */
    const cargarDiagnosticos = async (correo, rol, DB) => {
        const res = (rol == 0) ? await verDiagnosticosPorMedico(correo, DB) : await verDiagnosticos(DB);
        if (res.success) {
            setDiagnosticos(res.data);
        } else {
            setModal({
                mostrar: true, titulo: "Error al cargar los diagnósticos",
                mensaje: "Ha ocurrido un error al cargar los diagnósticos. Por favor, inténtalo de nuevo más tarde."
            });
            setCargando(false);
        }
    };

    /**
     * Calcula la edad de los pacientes y añade los nombres de los pacientes o
     * el nombre del médico según el rol del usuario.
     * @param {Array} personas - Lista de pacientes (para usuarios) o médicos (para administradores).
     * @param {Array} diagnosticos - Lista de diagnósticos.
     * @returns Array
     */
    const formatearCeldas = (personas, diagnosticos) => {
        const aux = {};

        for (const i of personas) {
            aux[i.cedula] = i.nombre;
        }
        for (const i of diagnosticos) {
            i.edad = dayjs().diff(dayjs(
                i.fechaNacimiento, "DD-MM-YYYY"), "year", false
            );
            i.sexo = i.sexo == 0 ? "Masculino" : "Femenino";

            const paciente = aux[i.paciente];
            i.nombre = (paciente != undefined) ? paciente : "N/A";
            i.diagnostico = detTxtDiagnostico(i.diagnostico);
            i.fecha = dayjs(i.fecha.toDate()).format("DD/MM/YYYY");
            i.validado = detTxtDiagnostico(i.validado);

            delete i.medico;
        }

        return diagnosticos;
    };

    /**
     * Manejador de clic en el botón de eliminar diagnósticos de la tabla.
     * @param {Array} seleccionados - Lista de diagnósticos seleccionados.
     */
    const manejadorEliminar = (seleccionados) => {
        setSeleccionados(seleccionados);
        setEliminar(true);
        setModal({
            mostrar: true, titulo: "Alerta",
            mensaje: "¿Estás seguro de querer eliminar los diagnósticos seleccionados?"
        });
    };

    /**
     * Manejador del clic en una celda de la tabla.
     * @param {JSON} dato - Instancia
     */
    const manejadorClicCelda = (dato) => {
        navegacion.setPaginaAnterior("/diagnosticos");
        navigate(`/diagnosticos/ver-diagnostico?id=${dato.id}`, { replace: true });
    };

    /**
     * Manejador del botón derecho del modal.
     */
    const manejadorBtnModal = async () => {
        if (eliminar) {
            setCargando(true);
            eliminarDiagnosticos(seleccionados);
        }

        setModal({ ...modal, mostrar: false });
        setEliminar(false);
    };

    /**
     * Eliminar los pacientes seleccionados de Drive y maneja la respuesta.
     * @param {Array} pacientes - Lista de pacientes a eliminar.
     */
    const eliminarDiagnosticos = async (diagnosticos) => {
        const res = await drive.eliminarDiagnostico(diagnosticos, true);
        if (!res.success) {
            setModal({
                mostrar: true,
                titulo: "Error al eliminar los diagnósticos.",
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
                        titulo={rol == 0 ? "Historial de diagnósticos" : "Lista de diagnósticos"}
                        pestanas={listadoPestanas} />
                    <Grid container columns={1} spacing={3} sx={{ marginTop: "3vh", width: width }}>
                        <Datatable
                            campos={camposFijos}
                            datos={datos}
                            lblBusq={rol == 0 ? "Buscar diagnóstico por nombre o número de cédula del paciente" : "Buscar diagnóstico por médico"}
                            activarBusqueda={true}
                            activarSeleccion={rol == 1001}
                            campoId="id"
                            terminoBusqueda={""}
                            lblSeleccion="diagnosticos seleccionados"
                            camposBusq={rol == 0 ? ["nombre", "cedula"] : ["medico"]}
                            cbClicCelda={manejadorClicCelda}
                            cbAccion={manejadorEliminar}
                            tooltipAccion="Eliminar diagnósticos seleccionados"
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