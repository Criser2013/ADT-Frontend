import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from '@mui/icons-material/Person';
import TarjetaMenuPrincipal from "./TarjetaMenuPrincipal";
import { Box, CircularProgress, Divider, Grid, Typography } from "@mui/material";
import { DiagnosticoIcono } from "../icons/IconosSidebar";
import { GraficoBarras, GraficoPastel } from "../charts";
import { ModalSimple } from "../modals";
import { obtenerDatosPorMes, obtenerDatosMesActual } from "../../utils/Fechas";
import { Timestamp } from "firebase/firestore";
import { useAuth, useDiagnosticos, usePacientes } from "../../hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";


let fecha = dayjs().subtract(4, "month").set("date", 1).set("hour", 0).set("minute", 0).
    set("second", 0).set("millisecond", 0).toDate();
const fechaTimestamp = Timestamp.fromDate(fecha);

/**
 * Menú principal para los usuarios. Muestra la cantidad de pacientes y diagnósticos registrados este mes y
 * un gráfico de barras con las cifras de los últimos 5 meses.
 * @returns {JSX.Element}
 */
export default function MenuUsuario() {
    const { usuario } = useAuth();
    const { diagnosticos, error: errorDiagnosticos } = useDiagnosticos(false, usuario?.uid, fechaTimestamp, false);
    const { pacientes, error: errorPacientes } = usePacientes(true);

    const { t } = useTranslation();

    const [cargando, setCargando] = useState(true);


    const [modal, setModal] = useState({ mostrar: false, texto: "" });

    const diagnosticosMesActual = useMemo(() => obtenerDatosMesActual(datosDiagnosticos, fechaActual, navegacion.idioma)
        , [datosDiagnosticos, fechaActual, navegacion.idioma]);

    const pacientesMesActual = useMemo(() => obtenerDatosMesActual(datosPacientes, fechaActual, navegacion.idioma)
        , [datosPacientes, fechaActual, navegacion.idioma]);


    const datosGraficoSexoPacientes = useMemo(() => {
        const datos = { masculino: 0, femenino: 0 };
        if (pacientes) {
            pacientes.forEach((x) => {
                if (x.sexo == 0) {
                    datos.masculino++;
                } else {
                    datos.femenino++;
                }
            });
        }
        return {
            labels: [t("txtMasculino"), t("txtFemenino")],
            datasets: [{
                label: t("txtNumPacientes"),
                data: [datos.masculino, datos.femenino],
                backgroundColor: ['#263b9886', '#f3736c96']
            }]
        };
    }, [pacientes, t]);

    useEffect(() => {
        if (errorDiagnosticos) {
            setModal({ mostrar: true, texto: errorDiagnosticos });
        } else if (errorPacientes) {
            setModal({ mostrar: true, texto: errorPacientes });
        }
    }, [errorDiagnosticos, errorPacientes]);

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
     * Componente necesario para actualizar el gráfico cuando cambia el idioma. Sino se deja así
     * las etiquetas se actualizan de forma retrasada, no en el momento que se cambia el idioma.
     */
    const GraficoMeses = useCallback(() => {
        return <GraficoBarras titulo={t("titGraficoBarrasMenu")} datos={datos} />;
    }, [datos]);

    return (
        <>
            {cargando ? <PantallaCarga />
                : (
                    <Grid columns={{ xs: 1, sm: 2 }} container spacing={2}>
                        <Grid size={2}>
                            <Typography variant="h4" align="left">
                                {t("txtBienvenida", { nombre: usuario?.nombre })}
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
                            <GraficoPastel titulo={t("titGraficoPastelMenuUsuario")} datos={datosGraficoSexoPacientes} />
                        </Grid>
                    </Grid>
                )}
            <ModalSimple
                mostrar={modal.mostrar}
                titulo={t("tituloErr")}
                texto={t(modal.texto)}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtn={() => setModal((x) => ({ ...x, mostrar: false }))}
                iconoBtn={<CloseIcon />} />
        </>
    );
};