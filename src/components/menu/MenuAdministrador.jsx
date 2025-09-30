import { Grid, Box, CircularProgress, Typography, Divider } from "@mui/material";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavegacion } from "../../contexts/NavegacionContext";
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
import AdvertenciaEspacio from "./AdvertenciaEspacio";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

/**
 * Menú principal para los administradores. Muestra la cantidad de diagnósticos y usuarios nuevos.
 * @returns {JSX.Element}
 */
export default function MenuAdministrador() {
    const auth = useAuth();
    const credenciales = useCredenciales();
    const navegacion = useNavegacion();
    const { t } = useTranslation();
    const [cargando, setCargando] = useState(true);
    const [usuarios, setUsuarios] = useState(null);
    const [diagnosticos, setDiagnosticos] = useState(null);
    const [datos, setDatos] = useState(null);
    const [datosUsuarios, setDatosUsuarios] = useState(null);
    const [datosDiagnosticos, setDatosDiagnosticos] = useState(null);
    const [modal, setModal] = useState({ mostrar: false, mensaje: "", titulo: "" });
    const fechaActual = useMemo(() => dayjs(), []);
    const numCols = useMemo(() => {
        const { orientacion, dispositivoMovil, ancho } = navegacion;

        if ((dispositivoMovil && orientacion == "vertical") || (!dispositivoMovil && (ancho <= 700))) {
            return 1;
        } else if (dispositivoMovil && orientacion == "horizontal") {
            return 2;
        } else {
            return 4;
        }
    }, [navegacion]);
    const DB = useMemo(() => credenciales.obtenerInstanciaDB(), [credenciales]);
    const diagnosticosMesActual = useMemo(() => obtenerDatosMesActual(datosDiagnosticos, fechaActual, navegacion.idioma)
    , [datosDiagnosticos, fechaActual, navegacion.idioma]);
    const usuariosMesActual = useMemo(() => obtenerDatosMesActual(datosUsuarios, fechaActual, navegacion.idioma)
    , [datosUsuarios, fechaActual, navegacion.idioma]);
    const colsGraficos = useMemo(() => {
        const { orientacion, dispositivoMovil, mostrarMenu } = navegacion;
        if ((dispositivoMovil && orientacion == "vertical") || (dispositivoMovil && orientacion == "horizontal" && !mostrarMenu)) {
            return 1;
        } else {
            return 2;
        }
    }, [navegacion]);
    const cantDiagnosticos = useMemo(() => {
        return diagnosticos != null ? diagnosticos.length : 0;
    }, [diagnosticos]);
    const cantDiagnosticosConfir = useMemo(() => {
        return diagnosticos != null ? diagnosticos.filter(x => x.validado != 2).length : 0;
    }, [diagnosticos]);
    const propDiagnosticos = useMemo(() => {
        const res = { Positivo: 0, Negativo: 0, "No diagnosticado": 0 };

        if (diagnosticos != null) {
            diagnosticos.forEach((x) => {
                if (x.validado == 1) {
                    res.Positivo++;
                } else if (x.validado == 0) {
                    res.Negativo++;
                } else {
                    res["No diagnosticado"]++;
                }
            });
        }

        return {
            labels: [t("txtPositivo"), t("txtNegativo"), t("txtNoValidado")], datasets: [{
                label: t("txtNumDiags"), data: [res.Positivo, res.Negativo, res["No diagnosticado"]], backgroundColor: [
                    'rgba(255, 207, 86, 0.85)', 'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.7)'
                ]
            }]
        };
    }, [diagnosticos, navegacion.idioma]);

    /**
     * Carga los diagnósticos y los usuarios.
     */
    useEffect(() => {
        const { user } = auth.authInfo;

        if (user != null && DB != null) {
            cargarUsuarios(user.accessToken);
            cargarDiagnosticos(DB);
        }
    }, [auth.authInfo, DB]);

    /**
     * Actualiza el gráfico de barras con los datos de diagnósticos y usuarios.
     * @param {Array} diagnosticos - Lista de diagnósticos
     * @param {Array} usuarios - Lista de usuarios
     */
    const actualizarGraficoBarras = (diagnosticos, usuarios) => {
        const idioma =  localStorage.getItem("i18nextLng");
        const diagnosticosMensuales = obtenerDatosPorMes(diagnosticos, "fecha", 4, fechaActual, "DD-MM-YYYY", idioma);
        const usuariosMensuales = obtenerDatosPorMes(usuarios, "fecha_registro", 4, fechaActual, "DD/MM/YYYY hh:mm A", idioma);
        const json = {
            datasets: [
                formatearDatosGrafico(diagnosticosMensuales, 'rgba(255, 99, 132, 0.5)', t("txtDiagnosticosRealizados")),
                formatearDatosGrafico(usuariosMensuales, 'rgba(54, 162, 235, 0.5)', t("txtNuevosUsuarios")),
            ]
        };

        setDatosDiagnosticos(diagnosticosMensuales);
        setDatosUsuarios(usuariosMensuales);
        setDatos(json);
    };

    /**
     * Una vez se cargan los diagnósticos y los usuarios, formatea las celdas.
     */
    useEffect(() => {
        if (!!diagnosticos && !!usuarios && datos == null) {
            actualizarGraficoBarras(diagnosticos, usuarios);
            setCargando(false);
        }
    }, [diagnosticos, usuarios, datos, fechaActual]);

    /**
     * Requerido para actualizar los textos del gráfico al cambiar el idioma.
     */
    useEffect(() => {
        if (diagnosticos != null && usuarios != null) {
            actualizarGraficoBarras(diagnosticos, usuarios);
        }
    }, [navegacion.idioma]);

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
        const res = await peticionApi(token, "admin/usuarios", "GET", null, t("errCargarDatosUsuarios"));
        if (!res.success) {
            setModal({
                mostrar: true, mensaje: res.error,
                titulo: t("errTitCargarDatosUsuarios"),
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
                mostrar: true, titulo: t("titErrCargarDiagnosticos"),
                mensaje: t("errCargarDatosDiagnosticos")
            });
            setDiagnosticos([]);
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
                    <AdvertenciaEspacio rol={1001} cantidadDiagnosticos={cantDiagnosticos} />
                    <Grid size={4}>
                        <Typography variant="h4" fontStyle="bold" align="left">
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
                            titulo={t("txtUsuariosMes")}
                            altura="100%"
                            valor={usuariosMesActual}
                            icono={<PersonIcon sx={{ fontSize: "4.5vh" }} />} />
                    </Grid>
                    <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="2vh 0vh 0vw 0vw">
                        <TarjetaMenuPrincipal
                            titulo={t("txtDiagnosticosRecolectados")}
                            altura="100%"
                            valor={cantDiagnosticos}
                            icono={<DatosIcono sx={{ fontSize: "4.5vh" }} />} />
                    </Grid>
                    <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="2vh 0vh 0vw 0vw">
                        <TarjetaMenuPrincipal
                            titulo={t("txtDiagnosticosValidos")}
                            altura="100%"
                            valor={cantDiagnosticosConfir}
                            icono={<CheckCircleIcon sx={{ fontSize: "4.5vh" }} />} />
                    </Grid>
                    <Grid size={colsGraficos} display="flex" justifyContent="center" alignItems="center" padding="0vh 1.5vw">
                        <GraficoMeses />
                    </Grid>
                    <Grid size={colsGraficos} display="flex" justifyContent="center" alignItems="center" height="40vh" padding="0vh 1.5vw">
                        <GraficoPastel titulo={t("titGraficoPastelMenuAdmin")} datos={propDiagnosticos} />
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