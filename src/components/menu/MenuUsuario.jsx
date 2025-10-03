import { Grid, Box, CircularProgress, Typography, Divider } from "@mui/material";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { useDrive } from "../../contexts/DriveContext";
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
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import { Timestamp } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { AES, enc } from "crypto-js";
import { AES_KEY } from "../../../constants";

/**
 * Menú principal para los usuarios. Muestra la cantidad de pacientes y diagnósticos registrados este mes y
 * un gráfico de barras con las cifras de los últimos 5 meses.
 * @returns {JSX.Element}
 */
export default function MenuUsuario() {
    const auth = useAuth();
    const credenciales = useCredenciales();
    const navegacion = useNavegacion();
    const { t } = useTranslation();
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
        const { orientacion, dispositivoMovil, ancho } = navegacion;
        return (dispositivoMovil && orientacion == "vertical") || (!dispositivoMovil && (ancho <= 700)) ? 1 : 2;
    }, [navegacion]);
    const DB = useMemo(() => credenciales.obtenerInstanciaDB(), [credenciales.obtenerInstanciaDB]);
    const diagnosticosMesActual = useMemo(() => obtenerDatosMesActual(datosDiagnosticos, fechaActual, navegacion.idioma)
    , [datosDiagnosticos, fechaActual, navegacion.idioma]);
    const pacientesMesActual = useMemo(() => obtenerDatosMesActual(datosPacientes, fechaActual, navegacion.idioma)
    , [datosPacientes, fechaActual, navegacion.idioma]);
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
            labels: [t("txtMasculino"), t("txtFemenino")], datasets: [{
                label: t("txtNumPacientes"), data: [res.Masculino, res.Femenino], backgroundColor: [
                    '#263b9886', '#f3736c96'
                ]
            }]
        };
    }, [pacientes, navegacion.idioma]);

    /**
     * Carga el token de sesión y comienza a descargar el archivo de pacientes.
     */
    useEffect(() => {
        const token = sessionStorage.getItem("session-tokens");
        if (token != null) {
            const tokens = JSON.parse(AES.decrypt(token, AES_KEY).toString(enc.Utf8));
            drive.setToken(tokens.accessToken);
        } else if (auth.tokenDrive != null) {
            drive.setToken(auth.tokenDrive);
        }
    }, [auth.tokenDrive]);

    /**
     * Carga los diagnósticos y los pacientes dependiendo del rol del usuario.
     */
    useEffect(() => {
        const descargar = sessionStorage.getItem("descargando-drive");
        const { uid } = auth.authInfo;

        if (uid != null && drive.token != null && (descargar == null || descargar == "false") && DB != null) {
            sessionStorage.setItem("descargando-drive", "true");
            cargarPacientes();
            cargarDiagnosticos(uid, DB);
        }
    }, [auth.authInfo, drive.token, DB]);

     /**
     * Actualiza el gráfico de barras con los datos de diagnósticos y usuarios.
     * @param {Array} diagnosticos - Lista de diagnósticos
     * @param {Array} pacientes - Lista de pacientes
     */
    const actualizarGraficoBarras = (diagnosticos, pacientes) => {
        const diagnosticosMensuales = obtenerDatosPorMes(diagnosticos, "fecha", 4, fechaActual, "DD-MM-YYYY", navegacion.idioma);
        const pacientesMensuales = obtenerDatosPorMes(pacientes, "fechaCreacion", 4, fechaActual, "DD-MM-YYYY", navegacion.idioma);
        const json = {
            datasets: [
                formatearDatosGrafico(diagnosticosMensuales, 'rgba(255, 99, 132, 0.5)', t("txtDiagnosticosRealizados")),
                formatearDatosGrafico(pacientesMensuales, 'rgba(54, 162, 235, 0.5)', t("txtNuevosPacientes")),
            ]
        };

        setDatosDiagnosticos(diagnosticosMensuales);
        setDatosPacientes(pacientesMensuales);
        setDatos(json);
    };

    /**
     * Una vez se cargan los diagnósticos y los pacientes, formatea las celdas.
     */
    useEffect(() => {
        if (!!diagnosticos && !!pacientes && datos == null) {
           actualizarGraficoBarras(diagnosticos, pacientes);
           setCargando(false);
        }
    }, [diagnosticos, pacientes, datos, fechaActual]);

    useEffect(() => {
        if (diagnosticos != null && pacientes != null) {
            actualizarGraficoBarras(diagnosticos, pacientes);
        }
    }, [navegacion.idioma]);

    useEffect(() => {
        const descargar = sessionStorage.getItem("descargando-drive");
        if (drive.datos != null && (descargar == "false")) {
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
        return {
            label: etiqueta, data: datos, backgroundColor: color,
        };
    };

    /**
     * Carga los datos de los pacientes desde Drive
     */
    const cargarPacientes = async () => {
        const res = await drive.cargarDatos();
        if (!res.success) {
            setDatosPacientes([]);
            setModal({
                mostrar: true, mensaje: res.error,
                titulo: t("errTitCargarDatosPacientes"),
            });
        }
    };

    /**
     * Carga los datos de los diagnósticos.
     * @param {String} uid - UID del usuario.
     * @param {Object} DB - Instancia de Firestore.
     */
    const cargarDiagnosticos = async (uid, DB) => {
        let fechaActual = dayjs().subtract(4, "month");

        fechaActual = fechaActual.set("date", 1);
        fechaActual = fechaActual.set("hour", 0);
        fechaActual = fechaActual.set("minute", 0);
        fechaActual = fechaActual.set("second", 0);
        fechaActual = fechaActual.set("millisecond", 0);

        const res = await verDiagnosticosPorMedico(uid, DB, Timestamp.fromDate(fechaActual.toDate()));
        if (res.success) {
            setDiagnosticos(res.data);
        } else {
            setModal({
                mostrar: true, titulo: t("titErrCargarDiagnosticos"),
                mensaje: t("msgErrCargarDiagnosticos")
            });
        }
    };

    /**
     * Manejador para el botón del modal.
     */
    const manejadorBtnModal = () => {
        setModal({ ...modal, mostrar: false });
    };

    /**
     * Componente necesario para actualizar el gráfico cuando cambia el idioma. Sino se deja así
     * las etiquetas se actualizan de forma retrasada, no en el momento que se cambia el idioma.
     */
    const GraficoMeses = useCallback(() => {
        return <GraficoBarras titulo={t("titGraficoBarrasMenu")} datos={datos} />;
    }, [datos]);

    return (
        <>
            {cargando ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="85vh">
                    <CircularProgress />
                </Box>
            ) : (
                <Grid columns={numCols} container spacing={2}>
                    <Grid size={2}>
                        <Typography variant="h4" align="left">
                            {t("txtBienvenida", { nombre: auth.authInfo.user.displayName })}
                        </Typography>
                        <Divider sx={{ padding: "1vh 0vw" }} />
                    </Grid>
                    <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="2vh 0vh 0vw 0vw">
                        <TarjetaMenuPrincipal
                            titulo={t("txtDiagnosticosMes")}
                            altura="100%"
                            valor={diagnosticosMesActual}
                            icono={<DiagnosticoIcono sx={{ fontSize: "4.5vh" }} />} />
                    </Grid>
                    <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="2vh 0vh 0vw 0vw">
                        <TarjetaMenuPrincipal
                            titulo={t("txtPacientesMes")}
                            altura="100%"
                            valor={pacientesMesActual}
                            icono={<PersonIcon sx={{ fontSize: "4.5vh" }} />} />
                    </Grid>
                    <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="0vh 1.5vw">
                        <GraficoMeses />
                    </Grid>
                    <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="0vh 1.5vw">
                        <GraficoPastel titulo={t("titGraficoPastelMenuUsuario")} datos={propSexoPacientes} />
                    </Grid>
                </Grid>
            )}
            <ModalSimple
                abrir={modal.mostrar}
                mensaje={modal.mensaje}
                titulo={modal.titulo}
                txtBtn={t("txtBtnCerrar")}
                iconoBtn={<CloseIcon />}
                manejadorBtnModal={manejadorBtnModal} />
        </>
    );
};