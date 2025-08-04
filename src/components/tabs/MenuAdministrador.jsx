import { Grid, Box, CircularProgress, Typography, Divider } from "@mui/material";
import { useMemo, useState, useEffect } from "react";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { detTamCarga } from "../../utils/Responsividad";
import { useAuth } from "../../contexts/AuthContext";
import { useCredenciales } from "../../contexts/CredencialesContext";
import { verDiagnosticos } from "../../firestore/diagnosticos-collection";
import { obtenerDatosPorMes, obtenerDatosMesActual } from "../../utils/Fechas";
import ModalSimple from "../modals/ModalSimple";
import TarjetaMenuPrincipal from "./TarjetaMenuPrincipal";
import GraficoBarras from "../charts/GraficoBarras";
import GraficoPastel from "../charts/GraficoPastel";
import { DatosIcono, DiagnosticoIcono } from "../icons/IconosSidebar";
import PersonIcon from '@mui/icons-material/Person';
import dayjs from "dayjs";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { peticionApi } from "../../services/Api";

/**
 * Menú principal para los administradores. Muestra la cantidad de diagnósticos y usuarios nuevos.
 * @returns {JSX.Element}
 */
export default function MenuAdministrador() {
    const auth = useAuth();
    const credenciales = useCredenciales();
    const navegacion = useNavegacion();
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
        if ((dispositivoMovil && orientacion == "vertical") || (!dispositivoMovil && (navegacion.ancho < 500))) {
            return 1;
        } else if (dispositivoMovil && orientacion == "horizontal") {
            return 2;
        } else {
            return 4;
        }
    }, [navegacion.dispositivoMovil, navegacion.ancho, navegacion.orientacion]);
    const width = useMemo(() => {
        return detTamCarga(navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho);
    }, [navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho]);
    const DB = useMemo(() => credenciales.obtenerInstanciaDB(), [credenciales.obtenerInstanciaDB()]);
    const diagnosticosMesActual = useMemo(() => obtenerDatosMesActual(datosDiagnosticos, fechaActual), [datosDiagnosticos, fechaActual]);
    const usuariosMesActual = useMemo(() => obtenerDatosMesActual(datosUsuarios, fechaActual), [datosUsuarios, fechaActual]);
    const colsGraficos = useMemo(() => {
        const { orientacion, dispositivoMovil, mostrarMenu } = navegacion;
        if (dispositivoMovil && orientacion == "vertical") {
            return 1;
        } else if (dispositivoMovil && orientacion == "horizontal" && !mostrarMenu) {
            return 1;
        } else if (dispositivoMovil && orientacion == "horizontal" && mostrarMenu) {
            return 2;
        } else {
            return 2;
        }
    }, [navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu]);
    const cantDiagnosticos = useMemo(() => {
        return diagnosticos != null ? diagnosticos.length : 0;
    }, [diagnosticos]);
    const cantDiagnosticosConfir = useMemo(() => {
        return diagnosticos != null ? diagnosticos.filter(x => x.validado != 2).length : 0;
    }, [diagnosticos]);
    const propDiagnosticos = useMemo(() => {
        const res = { Positivo: 0, Negativo: 0, "No validado": 0 };

        if (diagnosticos != null) {
            diagnosticos.forEach((x) => {
                if (x.validado == 1) {
                    res.Positivo++;
                } else if (x.validado == 0) {
                    res.Negativo++;
                } else {
                    res["No validado"]++;
                }
            });
        }

        return {
            labels: ["Positivo", "Negativo", "No validado"], datasets: [{
                label: "Número de diagnósticos", data: [res.Positivo, res.Negativo, res["No validado"]], backgroundColor: [
                    'rgba(255, 207, 86, 0.85)', 'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.7)'
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
            setCargando(false);
        }
    }, [diagnosticos, usuarios, datos]);

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
            setUsuarios([]);
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
            setDiagnosticos([]);
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
                    <Grid size={4}>
                        <Typography variant="h4" fontStyle="bold" align="left">
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
                            titulo="Usuarios nuevos este mes"
                            altura="100%"
                            valor={usuariosMesActual}
                            icono={<PersonIcon sx={{ fontSize: "4.5vh" }} />} />
                    </Grid>
                    <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="2vh 0vh 0vh 0vh">
                        <TarjetaMenuPrincipal
                            titulo="Diagnósticos recolectados"
                            altura="100%"
                            valor={cantDiagnosticos}
                            icono={<DatosIcono sx={{ fontSize: "4.5vh" }} />} />
                    </Grid>
                    <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="2vh 0vh 0vh 0vh">
                        <TarjetaMenuPrincipal
                            titulo="Diagnósticos validados"
                            altura="100%"
                            valor={cantDiagnosticosConfir}
                            icono={<CheckCircleIcon sx={{ fontSize: "4.5vh" }} />} />
                    </Grid>
                    <Grid size={colsGraficos} display="flex" justifyContent="center" alignItems="center" padding="0vh 1.5vh">
                        <GraficoBarras titulo="Cifras de los últimos 5 meses" datos={datos} />
                    </Grid>
                    <Grid size={colsGraficos} display="flex" justifyContent="center" alignItems="center" height="40vh" padding="0vh 1.5vh">
                        <GraficoPastel titulo="Distribución de los diagnósticos" datos={propDiagnosticos} />
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