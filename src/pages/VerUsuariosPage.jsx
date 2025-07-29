import { Button, Grid, Box, CircularProgress } from "@mui/material";
import { detTamCarga } from "../utils/Responsividad";
import MenuLayout from "../components/layout/MenuLayout";
import Datatable from "../components/tabs/Datatable";
import TabHeader from "../components/tabs/TabHeader";
import DeleteIcon from "@mui/icons-material/Delete";
//import { useNavigate } from "react-router";
import { useNavegacion } from "../contexts/NavegacionContext";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ModalAccion from "../components/modals/ModalAccion";
import { CODIGO_ADMIN } from "../../constants";
import { peticionApi } from "../services/Api";
import { verDiagnosticos } from "../firestore/diagnosticos-collection";
import { useCredenciales } from "../contexts/CredencialesContext";

/**
 * Página que muestra la lista de usuarios.
 * @returns JSX.Element
 */
export default function VerUsuariosPage() {
    const auth = useAuth();
    //const navigate = useNavigate();
    const credenciales = useCredenciales();
    const navegacion = useNavegacion();
    const listadoPestanas = [{
        texto: "Lista de usuarios", url: "/usuarios"
    }];
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState({
        mostrar: false, titulo: "", mensaje: ""
    });
    const [eliminar, setEliminar] = useState(false);
    const [datos, setDatos] = useState(null);
    const [usuarios, setUsuarios] = useState(null);
    const [diagnosticos, setDiagnosticos] = useState(null);
    const [seleccionados, setSeleccionados] = useState([]);
    const width = useMemo(() => {
        return detTamCarga(navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho);
    }, [navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho]);
    const campos = [
        { id: "nombre", label: "Nombre" },
        { id: "correo", label: "Correo" },
        { id: "rol", label: "Rol" },
        { id: "ultimaConexion", label: "Última conexión" },
        { id: "cantidad", label: "Diagnósticos" },
        { id: "estado", label: "Estado" }
    ];
    const rol = useMemo(() => auth.authInfo.rol, [auth.authInfo.rol]);
    const DB = useMemo(() => credenciales.obtenerInstanciaDB(), [credenciales.obtenerInstanciaDB()]);

    /**
     * Coloca el título de la página.
     */
    useEffect(() => {
        document.title = "Lista de usuarios";

        if (auth.authInfo.user != null) {
            cargarDatosUsuarios(auth.authInfo.user.accessToken);
            cargarDiagnosticos();
        }/* else {
            navigate("/menu", { replace: true });
        }*/
    }, [rol, auth.authInfo.user]);

    /**
     * Cuando se cargan los médicos y diagnósticos, se cuentan los diagnósticos por médico
     * y se formatean los datos.
     */
    useEffect(() => {
        if (usuarios != null && diagnosticos != null && datos == null) {
            contarDiagnosticos(diagnosticos, usuarios);
            setCargando(false);
        }
    }, [usuarios, diagnosticos, datos]);


    /**
     * Carga los datos de los pacientes desde Drive.
     * @param {String} token - Token de acceso de Firebase del usuario.
     */
    const cargarDatosUsuarios = async (token) => {
        const res = await peticionApi(token, "admin/usuarios", "GET", null, 
            "Ha ocurrido un error al cargar los usuarios. Por favor reintenta nuevamente."
        );
        if (!res.success) {
            setUsuarios([]);
            setModal({
                mostrar: true, mensaje: res.error,
                titulo: "Error al cargar los datos",
            });
        } else {
            setUsuarios(res.data.usuarios);
        }
    };

    /**
     * Carga los diagnósticos desde la base de datos.
     */
    const cargarDiagnosticos = async () => {
        const res = await verDiagnosticos(DB);
        if (!res.success) {
            setUsuarios([]);
            setModal({
                mostrar: true, mensaje: res.error,
                titulo: "Error al cargar los diagnósticos",
            });
        } else {
            setDiagnosticos(res.data);
        }
    };

    /**
     * Cuenta la cantidad de diagnósticos por médico.
     * @param {Array[JSON]} diagnosticos - Lista de diagnósticos.
     * @param {Array[JSON]} medicos - Lista de médicos.
     * @returns 
     */
    const contarDiagnosticos = (diagnosticos, medicos) => {
        const aux = {};

        for (const i of diagnosticos) {
            if (aux[i.medico] == undefined) {
                aux[i.medico] = 1;
            } else {
                aux[i.medico] += 1;
            }
        }

        for (let i=0; i<medicos.length; i++) {
            medicos[i].cantidad = aux[medicos[i].correo] || 0;
        }

        setDatos(formatearCeldas(medicos));
    };

    /**
     * Añade el campo edad y formatea el campo sexo.
     * @param {Array} datos - Lista de datos
     * @returns Array
     */
    const formatearCeldas = (datos) => {
        return datos.map((dato) => ({
            nombre: dato.nombre, correo: dato.correo,
            rol: dato.rol == CODIGO_ADMIN ? "Administrador" : "Usuario",
            estado: dato.estado ? "Activo" : "Inactivo",
            cantidad: dato.cantidad, ultimaConexion: dato.ultima_conexion
        }));
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
        console.log(dato);
        /*navegacion.setPaginaAnterior("/pacientes");
        navigate(`/pacientes/ver-paciente?cedula=${dato.cedula}`, { replace: true });*/
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
        console.log(pacientes);
        /*const res = await drive.eliminarPaciente(pacientes, true);
        if (!res.success) {
            setModal({
                mostrar: true,
                titulo: "Error a los pacientes.",
                mensaje: res.error
            });
        }
        setCargando(false);*/
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
                        titulo="Lista de usuarios"
                        pestanas={listadoPestanas} />
                    <Grid container columns={1} spacing={3} sx={{ marginTop: "3vh", width: width }}>
                        <Grid size={1}>
                            <Datatable
                                campos={campos}
                                datos={datos}
                                lblBusq="Buscar usuario por nombre o correo electrónico"
                                activarBusqueda={true}
                                campoId="correo"
                                terminoBusqueda={""}
                                lblSeleccion="usuarios seleccionados"
                                camposBusq={["nombre", "correo"]}
                                cbClicCelda={manejadorClicCelda}
                                cbAccion={manejadorEliminar}
                                tooltipAccion="Eliminar usuarios seleccionados"
                                icono={<DeleteIcon />}
                            />
                        </Grid>
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