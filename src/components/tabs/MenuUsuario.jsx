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
    const numCols = useMemo(() => {
        const { orientacion, dispositivoMovil } = navegacion;
        return (dispositivoMovil && orientacion == "vertical") || (!dispositivoMovil && (navegacion.ancho < 500)) ? 1 : 2;
    }, [navegacion.dispositivoMovil, navegacion.ancho, navegacion.orientacion]);
    const width = useMemo(() => {
        return detTamCarga(navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho);
    }, [navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho]);
    const DB = useMemo(() => credenciales.obtenerInstanciaDB(), [credenciales.obtenerInstanciaDB()]);
    const diagnosticosMesActual = useMemo(() => obtenerDatosMesActual(datosDiagnosticos), [datosDiagnosticos]);
    const pacientesMesActual = useMemo(() => obtenerDatosMesActual(datosPacientes), [datosPacientes]);
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

            res.Masculino = (res.Masculino / pacientes.length) * 100;
            res.Femenino = (res.Femenino / pacientes.length) * 100;
        }

        return {
            labels: ["Masculino", "Femenino"], datasets: [{
                label: "Porcentaje de pacientes", data: [res.Masculino, res.Femenino], backgroundColor: [
                    'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'
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
            const diagnosticosMensuales = obtenerDatosPorMes(diagnosticos, "fecha", 4);
            const pacientesMensuales = obtenerDatosPorMes(pacientes, "fechaCreacion", 4);
            const json = {
                datasets: [
                    formatearDatosGrafico(diagnosticosMensuales, 'rgba(255, 99, 132, 0.5)', "Diagnósticos realizados"),
                    formatearDatosGrafico(pacientesMensuales, 'rgba(54, 162, 235, 0.5)', "Nuevos pacientes"),
                ]
            };

            setDatosDiagnosticos(diagnosticosMensuales);
            setDatosPacientes(pacientesMensuales);
            setDatos(json);
        }
    }, [diagnosticos, pacientes, datos]);

    /**
     * Quita la pantalla de carga cuando se hayan cargado los datos de pacientes y diagnósticos.
     */
    useEffect(() => {
        setCargando(datos == null);
    }, [datos]);

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
            setCargando(false);
        }
    };

    /**
     * Carga los datos de los diagnósticos.
     * @param {String} correo - Correo del médico.
     * @param {Object} DB - Instancia de Firestore.
     */
    const cargarDiagnosticos = async (correo, DB) => {
        const res = await verDiagnosticosPorMedico(correo, DB);
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
                    <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="4vh 1.5vh">
                        <TarjetaMenuPrincipal
                            titulo="Diagnósticos realizados este mes"
                            valor={diagnosticosMesActual}
                            icono={<DiagnosticoIcono />} />
                    </Grid>
                    <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="4vh 1.5vh">
                        <TarjetaMenuPrincipal
                            titulo="Pacientes registrados este mes"
                            valor={pacientesMesActual}
                            icono={<PersonIcon />} />
                    </Grid>
                    <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="0vh 1.5vh">
                        <GraficoBarras titulo="Cifras de los últimos 5 meses" datos={datos} />
                    </Grid>
                    <Grid size={1} display="flex" justifyContent="center" alignItems="center" height="40vh" padding="0vh 1.5vh">
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