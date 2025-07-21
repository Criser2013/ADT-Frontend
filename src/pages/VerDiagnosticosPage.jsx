import { Grid, Box, CircularProgress, Tooltip, IconButton, Button } from "@mui/material";
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
import { cambiarDiagnostico, verDiagnosticos, verDiagnosticosPorMedico, eliminarDiagnosticos } from "../firestore/diagnosticos-collection";
import { verUsuarios } from "../firestore/usuarios-collection";
import { detTxtDiagnostico, nombresCampos } from "../utils/TratarDatos";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { descargarArchivoXlsx } from "../utils/XlsxFiles";
import { EXPORT_FILENAME } from "../../constants";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FormSeleccionar from "../components/tabs/FormSeleccionar";
import { CODIGO_ADMIN } from "../../constants";

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
    const [activar2Btn, setActivar2Btn] = useState(false);
    const [datos, setDatos] = useState([]);
    const [diagnosticos, setDiagnosticos] = useState(null);
    const [personas, setPersonas] = useState(null);
    const [seleccionados, setSeleccionados] = useState([]);
    const [validar, setValidar] = useState(2);
    const [instancia, setInstancia] = useState(null);
    const [modoModal, setModoModal] = useState(0);
    const [tipoArchivo, setTipoArchivo] = useState("xlsx");
    const [errorDiagnostico, setErrorDiagnostico] = useState(false);
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
            cargarPacientes();
        }
    }, [auth.authInfo.correo, rol, DB]);

    /**
     * Una vez se cargan los diagnósticos y los pacientes, formatea las celdas.
     */
    useEffect(() => {
        if (diagnosticos != null && personas != null && (typeof diagnosticos[0].fecha != "string")) {
            setDatos(formatearCeldas(personas, diagnosticos.map((x) => ({ ...x }))));
            setCargando(false);
        } else if (diagnosticos == null && personas == null) {
            setDatos([]);
        }
    }, [diagnosticos, personas]);

    /**
     * Si el usuario es médico, se carga la lista de pacientes desde Drive.
     */
    useEffect(() => {
        if (rol == 0) {
            setPersonas(drive.datos);
        }
    }, [drive.datos]);

    /**
     * Carga los datos de los pacientes desde Drive y luego los diagnósticos.
     */
    const cargarPacientes = async () => {
        const res = (rol == 0) ? await drive.cargarDatos() : await verUsuarios(DB);
        if (res.success && rol == CODIGO_ADMIN) {
            setPersonas(res.data);
        } else if (res.success && rol == 0) {
            return;
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
     * @param {Array} diags - Lista de diagnósticos.
     * @returns Array
     */
    const formatearCeldas = (personas, diags) => {
        const aux = {};
        const auxDiag = diags.map((d) => d);

        for (const i of personas) {
            aux[i.cedula] = i.nombre;
        }

        for (let i = 0; i < diags.length; i++) {
            auxDiag[i].sexo = auxDiag[i].sexo == 0 ? "Masculino" : "Femenino";

            const paciente = aux[auxDiag[i].paciente];
            auxDiag[i].nombre = (paciente != undefined) ? paciente : "N/A";
            auxDiag[i].diagnostico = detTxtDiagnostico(auxDiag[i].diagnostico);
            auxDiag[i].fecha = dayjs(auxDiag[i].fecha.toDate()).format("DD/MM/YYYY");
            auxDiag[i].accion = auxDiag[i].validado == 2 ? <BtnValidar diagnostico={i} /> : "N/A";
            auxDiag[i].validado = detTxtDiagnostico(auxDiag[i].validado);

            delete auxDiag[i].medico;
        }

        return auxDiag;
    };

    /**
     * Manejador de clic en el botón de eliminar diagnósticos de la tabla.
     * @param {Array} seleccionados - Lista de diagnósticos seleccionados.
     */
    const manejadorEliminar = (seleccionados) => {
        setSeleccionados(seleccionados);
        setActivar2Btn(true);
        setModoModal(1);
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
        const ejecutar = sessionStorage.getItem("ejecutar-callback");
        if (ejecutar == "true" || ejecutar == null) {
            navegacion.setPaginaAnterior("/diagnosticos");
            sessionStorage.removeItem("ejecutar-callback");
            navigate(`/diagnosticos/ver-diagnostico?id=${dato.id}`, { replace: true });
        }
    };

    /**
     * Manejador del botón derecho del modal.
     */
    const manejadorBtnModal = async () => {
        if (activar2Btn && modoModal == 1) {
            setCargando(true);
            borrarDiagnosticos(seleccionados);
            setModal({ ...modal, mostrar: false });
            setActivar2Btn(false);
            setModoModal(0);
            setErrorDiagnostico(false);
            setValidar(2);
            sessionStorage.setItem("ejecutar-callback", "true");
            setInstancia(null);
        } else if (activar2Btn && modoModal == 2) {
            validarCambio();
        } else if (modoModal == 3) {
            exportarDiagnosticos();
        } else {
            setModal({ ...modal, mostrar: false });
            setActivar2Btn(false);
            setModoModal(0);
            setErrorDiagnostico(false);
            setValidar(2);
            sessionStorage.setItem("ejecutar-callback", "true");
            setInstancia(null);
        }
    };

    /**
     * Eliminar los pacientes seleccionados de Drive y maneja la respuesta.
     * @param {Array} pacientes - Lista de pacientes a eliminar.
     */
    const borrarDiagnosticos = async (diagnosticos) => {
        const res = await eliminarDiagnosticos(diagnosticos, DB);
        if (!res.success) {
            setModoModal(0);
            setActivar2Btn(false);
            setModal({
                mostrar: true,
                titulo: "Error al eliminar los diagnósticos.",
                mensaje: res.error
            });
            setCargando(false);
        } else {
            cargarDiagnosticos(auth.authInfo.correo, rol, DB);
            cargarPacientes();

        }
    };

    /**
     * Revisa que el valor de validación sea vàlido (0 o 1).
     * Si es válido actualiza el diagnóstico.
     */
    const validarCambio = () => {
        setErrorDiagnostico(validar == 2);

        if (validar != 2) {
            validarDiagnostico(instancia);
            sessionStorage.setItem("ejecutar-callback", "true");
            setModal((x) => ({ ...x, mostrar: false }));
        }
    };

    /**
     * Cambia el estado de validación de un diagnóstico.
     * @param {JSON} indice - Diagnóstico a validar.
     */
    const validarDiagnostico = async (indice) => {
        setCargando(true);
        const res = await cambiarDiagnostico({ ...diagnosticos[indice.diagnostico], validado: validar }, DB);

        if (res.success) {
            setDatos((x) => {
                x[indice.diagnostico].validado = detTxtDiagnostico(validar);
                x[indice.diagnostico].accion = "N/A";
                return x;
            });
        } else {
            setActivar2Btn(false);
            setModal({
                mostrar: true, titulo: "Error",
                mensaje: "No se pudo validar el diagnóstico. Inténtalo de nuevo más tarde."
            });
        }
        setCargando(false);
    };

    /**
     * Botón para validar diagnóstico
     * @param {JSON} diagnostico - Diagnóstico a validar.
     * @returns JSX.Element
     */
    const BtnValidar = (diagnostico) => {
        const func = (x) => {
            sessionStorage.setItem("ejecutar-callback", "false");
            setInstancia(x);
            setActivar2Btn(true);
            setModoModal(2);
            setModal({
                mostrar: true, titulo: "Validar diagnóstico", mensaje: ""
            });
        };

        return (
            <Tooltip title="Validar diagnóstico">
                <IconButton onClick={() => func(diagnostico)} color="primary">
                    <CheckCircleOutlineIcon />
                </IconButton>
            </Tooltip>
        );
    };

    /**
     * Determina el texto del botón primario del modal según el modo.
     * @returns {String}
     */
    const detTxtBtnPrimarioModal = () => {
        switch (modoModal) {
            case 1:
                return "Eliminar";
            case 2:
                return "Validar";
            case 3:
                return "Exportar";
            default:
                return "Aceptar";
        }
    };

    /**
     * Manejador del botón cancelar del modal.
     */
    const manejadorBtnCancelar = () => {
        setModal({ ...modal, mostrar: false });
        setErrorDiagnostico(false);
        setValidar(2);
        sessionStorage.setItem("ejecutar-callback", "true");
        setInstancia(null);
    };

    /**
     * Manejador del botón para exportar los diagnósticos.
     */
    const exportarDiagnosticos = () => {
        let aux = diagnosticos.map((x) => ({ ...x }));

        aux = aux.map((x, i) => {
            x.paciente = datos[i].nombre;
            x = nombresCampos(x, rol == CODIGO_ADMIN);
            return x;
        });

        setModal((x) => ({ ...x, mostrar: false }));

        const res = descargarArchivoXlsx(aux, EXPORT_FILENAME, tipoArchivo);

        if (!res.success) {
            setModal({
                mostrar: true, titulo: "Error",
                mensaje: `No se pudo exportar el archivo. Inténtalo de nuevo más tarde: ${res.error}.`
            });
        } else {
            setTipoArchivo("xlsx");
            setModoModal(0);
            setActivar2Btn(false);
        }
    };

    /**
     * Manejador del botón de exportar diagnósticos.
     */
    const manejadorBtnExportar = () => {
        setActivar2Btn(true);
        setModoModal(3);
        setModal({
            mostrar: true, titulo: "Exportar diagnósticos",
            mensaje: ""
        });
    };

    const CuerpoModal = () => {
        let txt = "";
        let func = null;
        let error = false;
        let txtError = "";
        let valor = null;
        let valores = [];

        if (modoModal == 3) {
            txt = "Selecciona el tipo de archivo a exportar:";
            func = setTipoArchivo;
            valor = tipoArchivo;
            valores = [
                { valor: "xlsx", texto: "Hoja de cálculo de Excel (xlsx)" },
                { valor: "csv", texto: "Archivo separado por comas (csv)" }
            ];
        } else if (modoModal == 2) {
            txt = "Selecciona el diagnóstico de TEP del paciente:";
            func = setValidar;
            error = errorDiagnostico;
            txtError = "Selecciona el diagnóstico definitivo del paciente";
            valor = validar;
            valores = [
                { valor: 2, texto: "Seleccione el diagnóstico" },
                { valor: 0, texto: "Negativo" },
                { valor: 1, texto: "Positivo" }
            ];
        }

        if (modoModal > 1 && modoModal < 4) {
            return (
                <FormSeleccionar
                    texto={txt}
                    onChange={func}
                    error={error}
                    txtError={txtError}
                    valor={valor}
                    valores={valores}
                />
            );
        } else {
            return null;
        }
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
                        <Grid size={1} display="flex" justifyContent="end">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={manejadorBtnExportar}
                                sx={{ textTransform: "none" }}
                                startIcon={<FileDownloadIcon />}>
                                <b>Exportar diagnósticos</b>
                            </Button>
                        </Grid>
                        <Datatable
                            campos={rol == CODIGO_ADMIN ? camposFijos : camposFijos.concat([{ id: "accion", label: "Acción" }])}
                            datos={datos}
                            lblBusq={rol == 0 ? "Buscar diagnóstico por nombre o número de cédula del paciente" : "Buscar diagnóstico por médico"}
                            activarBusqueda={true}
                            activarSeleccion={rol == CODIGO_ADMIN}
                            campoId="id"
                            terminoBusqueda={""}
                            lblSeleccion="diagnosticos seleccionados"
                            camposBusq={rol == 0 ? ["nombre", "paciente"] : ["nombre"]}
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
                manejadorBtnSecundario={manejadorBtnCancelar}
                mostrarBtnSecundario={activar2Btn}
                txtBtnSimple={detTxtBtnPrimarioModal()}
                txtBtnSecundario="Cancelar"
                txtBtnSimpleAlt="Cerrar">
                <CuerpoModal />
            </ModalAccion>
        </MenuLayout>
    );
};