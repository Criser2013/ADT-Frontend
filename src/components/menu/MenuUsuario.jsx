import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from '@mui/icons-material/Person';
import TarjetaMenuPrincipal from "./TarjetaMenuPrincipal";
import { Box, CircularProgress, Divider, Grid, Typography } from "@mui/material";
import { DiagnosticoIcono } from "../icons/IconosSidebar";
import { GraficoBarras, GraficoPastel } from "../charts";
import { ModalSimple } from "../modals";
import { establecerTextoMeses, obtenerDatosMesActual, obtenerDatosPorMes } from "../../utils/TratarDatos";
import { Timestamp } from "firebase/firestore";
import { useAuth, useDiagnosticos, usePacientes } from "../../hooks";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";


let fechaInicio = dayjs().subtract(4, "month").set("date", 1).set("hour", 0).set("minute", 0).
    set("second", 0).set("millisecond", 0);
const fechaFinal = dayjs();
const fechaTimestamp = Timestamp.fromDate(fechaInicio.toDate());


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
    const [modal, setModal] = useState({ mostrar: false, texto: "" });
    const diagnosticosPorMes = useMemo(() => {
        const datos = obtenerDatosPorMes(
            diagnosticos, "fechaDayJs", fechaInicio, fechaFinal
        );
        return establecerTextoMeses(datos, t);
    }, [diagnosticos, t]);
    const pacientesPorMes = useMemo(() => {
        const datos = obtenerDatosPorMes(
            pacientes, "fechaCreacionFormateada", fechaInicio, fechaFinal
        );
        return establecerTextoMeses(datos, t);
    }, [pacientes, t]);
    const diagnosticosMesActual = useMemo(() =>
        obtenerDatosMesActual(diagnosticosPorMes)
    , [diagnosticosPorMes]);
    const pacientesMesActual = useMemo(() => 
        obtenerDatosMesActual(pacientesPorMes)
    , [pacientesPorMes]);
    const datosGraficoBarras = useMemo(() => {
        return {
            datasets: [
                {
                    label: t("txtDiagnosticosRealizados"),
                    data: diagnosticosPorMes,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)'
                },
                {
                    label: t("txtNuevosPacientes"),
                    data: pacientesPorMes,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)'
                }
            ]
        };
    }, [diagnosticosPorMes, pacientesPorMes, t]);
    const datosGraficoPastel = useMemo(() => {
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
    const mostrarPantallaCarga = !pacientes || !diagnosticos;

    useEffect(() => {
        if (errorDiagnosticos) {
            setModal({ mostrar: true, texto: errorDiagnosticos });
        } else if (errorPacientes) {
            setModal({ mostrar: true, texto: errorPacientes });
        }
    }, [errorDiagnosticos, errorPacientes]);

    return (
        <>
            {mostrarPantallaCarga ? <PantallaCarga />
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
                                valor={diagnosticosMesActual}
                                icono={<DiagnosticoIcono sx={{ fontSize: "4.5vh" }} />}
                                altura="100%"/>
                        </Grid>
                        <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="2vh 0vh 0vw 0vw">
                            <TarjetaMenuPrincipal
                                titulo={t("txtPacientesMes")}
                                valor={pacientesMesActual}
                                icono={<PersonIcon sx={{ fontSize: "4.5vh" }} />}
                                altura="100%"/>
                        </Grid>
                        <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="0vh 1.5vw">
                            <GraficoBarras titulo={t("titGraficoBarrasMenu")} datos={datosGraficoBarras} />
                        </Grid>
                        <Grid size={1} display="flex" justifyContent="center" alignItems="center" padding="0vh 1.5vw">
                            <GraficoPastel titulo={t("titGraficoPastelMenuUsuario")} datos={datosGraficoPastel} />
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