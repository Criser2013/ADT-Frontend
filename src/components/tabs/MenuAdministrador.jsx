import { Grid, Box, CircularProgress, Typography, Divider } from "@mui/material";
import { useMemo, useState, useEffect } from "react";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { useDrive } from "../../contexts/DriveContext";
import { detTamCarga } from "../../utils/Responsividad";
import { useAuth } from "../../contexts/AuthContext";
import { useCredenciales } from "../../contexts/CredencialesContext";
import { verDiagnosticos, verDiagnosticosPorMedico } from "../../firestore/diagnosticos-collection";
import { obtenerDatosPorMes, obtenerDatosMesActual } from "../../utils/Fechas";
import ModalSimple from "../modals/ModalSimple";
import TarjetaMenuPrincipal from "./TarjetaMenuPrincipal";
import GraficoBarras from "../charts/GraficoBarras";
import GraficoPastel from "../charts/GraficoPastel";
import { DiagnosticoIcono } from "../icons/IconosSidebar";
import PersonIcon from '@mui/icons-material/Person';
import dayjs from "dayjs";
import { Timestamp } from "firebase/firestore";
import { peticionApi} from "../../services/Api";

/**
 * Menú principal para los administradores. Muestra la cantidad de pacientes y diagnósticos registrados este mes y
 * un gráfico de barras con las cifras de los últimos 5 meses.
 * @returns {JSX.Element}
 */
export default function MenuAdministrador() {
    const auth = useAuth();
    const credenciales = useCredenciales();
    const navegacion = useNavegacion();
    const drive = useDrive();
    const [cargando, setCargando] = useState(true);
    const [usuarios, setUsuarios] = useState(null);
    const [diagnosticos, setDiagnosticos] = useState(null);
    const [datos, setDatos] = useState(null);
    const [datosUsuarios, setDatosUsuarios] = useState(null);
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
    const usuariosMesActual = useMemo(() => obtenerDatosMesActual(datosUsuarios, fechaActual), [datosUsuarios, fechaActual]);
    const propDiagnosticos = useMemo(() => {
        const res = { Positivo: 0, Negativo: 0 };

        if (diagnosticos != null) {
            diagnosticos.forEach((x) => {
                if (x.diagnostico == 1) {
                    res.Positivo++;
                } else {
                    res.Negativo++;
                }
            });
        }

        return {
            labels: ["Positivo", "Negativo"], datasets: [{
                label: "Número de diagnósticos", data: [res.Positivo, res.Negativo], backgroundColor: [
                    'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'
                ]
            }]
        };
    }, [diagnosticos]);

    /**
     * Carga los diagnósticos y los usuarios.
     */
    useEffect(() => {
        const { correo, user } = auth.authInfo;

        if (correo != null && user != null && DB != null) {
            cargarUsuarios(user.accessToken);
            cargarDiagnosticos(DB);
        }
    }, [auth.authInfo.correo, auth.authInfo.user, DB]);

    /**
     * Una vez se cargan los diagnósticos y los usuarios, formatea las celdas.
     */
    useEffect(() => {
        if (diagnosticos != null && usuarios != null && datos == null) {
            const diagnosticosMensuales = obtenerDatosPorMes(diagnosticos, "fecha", 4, fechaActual);
            const usuariosMensuales = obtenerDatosPorMes(usuarios, "fecha_registro", 4, fechaActual, "DD/MM/YYYY hh:mm A");
            const json = {
                datasets: [
                    formatearDatosGrafico(diagnosticosMensuales, 'rgba(255, 99, 132, 0.5)', "Diagnósticos realizados"),
                    formatearDatosGrafico(usuariosMensuales, 'rgba(54, 162, 235, 0.5)', "Nuevos usuarios"),
                ]
            };

            setDatosDiagnosticos(diagnosticosMensuales);
            setDatosUsuarios(usuariosMensuales);
            setDatos(json);
        }
    }, [diagnosticos, usuarios, datos]);

    /**
     * Quita la pantalla de carga cuando se hayan cargado los datos de pacientes y diagnósticos.
     */
    useEffect(() => {
        setCargando(datos == null);
    }, [datos]);

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
     * Carga los datos de los usuarios
     */
    const cargarUsuarios = async (token) => {
        const res = await peticionApi(token, "admin/usuarios", "GET", null, "No se pudo cargar la lista de usuarios. Reintenta más tarde.");
        if (!res.success) {
            setModal({
                mostrar: true, mensaje: res.error,
                titulo: "Error al cargar los datos de los usuarios.",
            });
            setCargando(false);
        } else {
            setUsuarios(res.data.usuarios);
        }
    };

    /**
     * Carga los datos de los diagnósticos.
     * @param {Object} db - Instancia de Firestore.
     */
    const cargarDiagnosticos = async (db) => {
        const res = await verDiagnosticos(db);
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
                            titulo="Usuarios registrados este mes"
                            valor={usuariosMesActual}
                            icono={<PersonIcon />} />
                    </Grid>
                    <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="0vh 1.5vh">
                        <GraficoBarras titulo="Cifras de los últimos 5 meses" datos={datos} />
                    </Grid>
                    <Grid size={1} display="flex" justifyContent="center" alignItems="center" height="40vh" padding="0vh 1.5vh">
                        <GraficoPastel titulo="Proporción de diagnósticos" datos={propDiagnosticos} />
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