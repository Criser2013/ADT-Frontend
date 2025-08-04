import { Grid, Box, CircularProgress, Typography, Divider } from "@mui/material";
import { useMemo, useState, useEffect } from "react";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { useDrive } from "../../contexts/DriveContext";
import { detTamCarga } from "../../utils/Responsividad";
import { useAuth } from "../../contexts/AuthContext";
import { useCredenciales } from "../../contexts/CredencialesContext";
import { verDiagnosticosPorMedico } from "../../firestore/diagnosticos-collection";
import { obtenerDatosPorMes, obtenerDatosMesActual } from "../../utils/Fechas";
import ModalSimple from "../modals/ModalSimple";
import TarjetaMenuPrincipal from "./TarjetaMenuPrincipal";
import GraficoBarras from "../charts/GraficoBarras";
import GraficoPastel from "../charts/GraficoPastel";
import { DiagnosticoIcono } from "../icons/IconosSidebar";
import PersonIcon from '@mui/icons-material/Person';
import dayjs from "dayjs";
import { Timestamp } from "firebase/firestore";

/**
 * Menú principal para los usuarios. Muestra la cantidad de pacientes y diagnósticos registrados este mes y
 * un gráfico de barras con las cifras de los últimos 5 meses.
 * @returns {JSX.Element}
 */
export default function MenuUsuario() {
    const auth = useAuth();
    const credenciales = useCredenciales();
    const navegacion = useNavegacion();
    const drive = useDrive();
    const [cargando, setCargando] = useState(true);
    const [pacientes, setPacientes] = useState(null);
    const [diagnosticos, setDiagnosticos] = useState(null);
    const [datos, setDatos] = useState(null);
    const [datosPacientes, setDatosPacientes] = useState(null);
    const [datosDiagnosticos, setDatosDiagnosticos] = useState(null);
    const [modal, setModal] = useState({ mostrar: false, mensaje: "", titulo: "" });
    const fechaActual = useMemo(() => dayjs(), []);
    const numCols = useMemo(() => {
        const { orientacion, dispositivoMovil } = navegacion;
        return (dispositivoMovil && orientacion == "vertical") || (!dispositivoMovil && (navegacion.ancho < 500)) ? 1 : 2;
    }, [navegacion.dispositivoMovil, navegacion.ancho, navegacion.orientacion]);
    const width = useMemo(() => {
        return detTamCarga(navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho);
    }, [navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho]);
    const DB = useMemo(() => credenciales.obtenerInstanciaDB(), [credenciales.obtenerInstanciaDB()]);
    const diagnosticosMesActual = useMemo(() => obtenerDatosMesActual(datosDiagnosticos, fechaActual), [datosDiagnosticos, fechaActual]);
    const pacientesMesActual = useMemo(() => obtenerDatosMesActual(datosPacientes, fechaActual), [datosPacientes, fechaActual]);
    const propSexoPacientes = useMemo(() => {
        const res = { Masculino: 0, Femenino: 0 };

        if (pacientes != null) {
            pacientes.forEach((x) => {
                if (x.sexo == 0) {
                    res.Masculino++;
                } else {
                    res.Femenino++;
                }
            });
        }

        return {
            labels: ["Masculino", "Femenino"], datasets: [{
                label: "Número de pacientes", data: [res.Masculino, res.Femenino], backgroundColor: [
                    '#263b9886', '#f3736c96'
                ]
            }]
        };
    }, [pacientes]);

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
        const { correo } = auth.authInfo;

        if (correo != null && drive.token != null && DB != null) {
            cargarPacientes();
            cargarDiagnosticos(correo, DB);
        }
    }, [auth.authInfo.correo, drive.token, DB]);

    /**
     * Una vez se cargan los diagnósticos y los pacientes, formatea las celdas.
     */
    useEffect(() => {
        if (diagnosticos != null && pacientes != null && datos == null) {
            const diagnosticosMensuales = obtenerDatosPorMes(diagnosticos, "fecha", 4, fechaActual);
            const pacientesMensuales = obtenerDatosPorMes(pacientes, "fechaCreacion", 4, fechaActual);
            const json = {
                datasets: [
                    formatearDatosGrafico(diagnosticosMensuales, 'rgba(255, 99, 132, 0.5)', "Diagnósticos realizados"),
                    formatearDatosGrafico(pacientesMensuales, 'rgba(54, 162, 235, 0.5)', "Nuevos pacientes"),
                ]
            };

            setDatosDiagnosticos(diagnosticosMensuales);
            setDatosPacientes(pacientesMensuales);
            setDatos(json);
            setCargando(false);
        }
    }, [diagnosticos, pacientes, datos]);

    useEffect(() => {
        if (drive.datos != null) {
            setPacientes(drive.datos);
        }
    }, [drive.datos]);

    /**
     * Formatea los datos del gráfico para que sean compatibles con Chart.js.
     * @param {JSON|Array} datos - Datos del gráfico, debe ser de un tipo compatible con Chart.js.
     * @param {String} color - Color de las barras del gráfico.
     * @param {String} etiqueta - Etiqueta de la serie de datos.
     * @returns {JSON}
     */
    const formatearDatosGrafico = (datos, color, etiqueta) => {
        const json = {
            label: etiqueta, data: datos, backgroundColor: color,
        };

        return json;
    };

    /**
     * Carga los datos de los pacientes desde Drive
     */
    const cargarPacientes = async () => {
        const res = await drive.cargarDatos();
        if (!res.success) {
            setModal({
                mostrar: true, mensaje: res.error,
                titulo: "Error al cargar los datos de los pacientes",
            });
        }
    };

    /**
     * Carga los datos de los diagnósticos.
     * @param {String} correo - Correo del médico.
     * @param {Object} DB - Instancia de Firestore.
     */
    const cargarDiagnosticos = async (correo, DB) => {
        let fechaActual = dayjs().subtract(4, "month");

        fechaActual = fechaActual.set("date", 1);
        fechaActual = fechaActual.set("hour", 0);
        fechaActual = fechaActual.set("minute", 0);
        fechaActual = fechaActual.set("second", 0);
        fechaActual = fechaActual.set("millisecond", 0);

        const res = await verDiagnosticosPorMedico(correo, DB, Timestamp.fromDate(fechaActual.toDate()));
        if (res.success) {
            setDiagnosticos(res.data);
        } else {
            setModal({
                mostrar: true, titulo: "Error al cargar los diagnósticos",
                mensaje: "Ha ocurrido un error al cargar los diagnósticos. Por favor, inténtalo de nuevo más tarde."
            });
        }
    };

    return (
        <>
            {cargando ? (
                <Box display="flex" justifyContent="center" alignItems="center" width={width} height="85vh">
                    <CircularProgress />
                </Box>
            ) : (
                <Grid columns={numCols} container spacing={2}>
                    <Grid size={2}>
                        <Typography variant="h4" align="left">
                            Bienvenido, {auth.authInfo.user.displayName}
                        </Typography>
                        <Divider sx={{ padding: "1vh 0vh" }} />
                    </Grid>
                    <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="2vh 0vh 0vh 0vh">
                        <TarjetaMenuPrincipal
                            titulo="Diagnósticos realizados este mes"
                            altura="100%"
                            valor={diagnosticosMesActual}
                            icono={<DiagnosticoIcono sx={{ fontSize: "4.5vh" }} />} />
                    </Grid>
                    <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="2vh 0vh 0vh 0vh">
                        <TarjetaMenuPrincipal
                            titulo="Pacientes registrados este mes"
                            altura="100%"
                            valor={pacientesMesActual}
                            icono={<PersonIcon sx={{ fontSize: "4.5vh" }} />} />
                    </Grid>
                    <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="0vh 1.5vh">
                        <GraficoBarras titulo="Cifras de los últimos 5 meses" datos={datos} />
                    </Grid>
                    <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="0vh 1.5vh">
                        <GraficoPastel titulo="Distribución de pacientes por sexo" datos={propSexoPacientes} />
                    </Grid>
                </Grid>
            )}
            <ModalSimple
                mostrar={modal.mostrar}
                mensaje={modal.mensaje}
                titulo={modal.titulo} />
        </>
    );
};