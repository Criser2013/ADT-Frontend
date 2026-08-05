import AdvertenciaEspacio from "./AdvertenciaEspacio";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import PersonIcon from '@mui/icons-material/Person';
import TarjetaMenuPrincipal from "./TarjetaMenuPrincipal";
import { Box, CircularProgress, Divider, Grid, Typography } from "@mui/material";
import { DatosIcono } from "../icons/IconosSidebar";
import { DiagnosticoIcono } from "../icons/IconosSidebar";
import { establecerTextoMeses, obtenerDatosMesActual, obtenerDatosPorMes } from "../../utils/TratarDatos";
import { GraficoBarras, GraficoPastel } from "../charts";
import { ModalSimple } from "../modals";
import { PantallaCarga } from "../layout";
import { useAuth, useDiagnosticos, useUsuarios } from "../../hooks";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";


const fechaInicio = dayjs().subtract(4, "month").set("date", 1).set("hour", 0).set("minute", 0).
    set("second", 0).set("millisecond", 0);
const fechaFinal = dayjs();
const paddingTarjetas = "2vh 0vh 0vw 0vw";
const paddingGraficos = "0vh 1.5vw";

/**
 * Menú principal para los administradores. Muestra la cantidad de diagnósticos y usuarios nuevos.
 * @returns {JSX.Element}
 */
export default function MenuAdministrador() {
    const { usuario } = useAuth();
    const { diagnosticos, error: errorDiagnosticos } = useDiagnosticos(true, null, null, false);
    const { usuarios, error: errorUsuarios } = useUsuarios(true);
    const { t } = useTranslation();
    const [modal, setModal] = useState({ mostrar: false, texto: "" });
    const diagnosticosPorMes = useMemo(() =>
        obtenerDatosPorMes(
            diagnosticos ? diagnosticos : [], "fecha", fechaInicio, fechaFinal
        ), [diagnosticos]);
    const usuariosPorMes = useMemo(() =>
        obtenerDatosPorMes(
            usuarios ? usuarios : [], "fechaRegistro", fechaInicio, fechaFinal
        ), [usuarios]);
    const diagnosticosMesActual = useMemo(() =>
        obtenerDatosMesActual(diagnosticosPorMes)
        , [diagnosticosPorMes]);
    const usuariosMesActual = useMemo(() =>
        obtenerDatosMesActual(usuariosPorMes)
        , [usuariosPorMes]);
    const datosGraficoBarras = useMemo(() => {
        const diagnosticos = establecerTextoMeses(diagnosticosPorMes, t);
        const usuarios = establecerTextoMeses(usuariosPorMes, t);
        return {
            datasets: [
                {
                    label: t("txtDiagnosticosRealizados"),
                    data: diagnosticos,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)'
                },
                {
                    label: t("txtNuevosUsuarios"),
                    data: usuarios,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)'
                }
            ]
        };
    }, [diagnosticosPorMes, usuariosPorMes, t]);
    const numDiagnosticos = useMemo(() => {
        return diagnosticos ? diagnosticos.length : 0;
    }, [diagnosticos]);
    const numDiagnosticosValidados = useMemo(() => {
        return diagnosticos ? diagnosticos.reduce((acum, x) => x.validado ? acum + 1 : acum, 0) : 0;
    }, [diagnosticos]);
    const datosGraficoPastel = useMemo(() => {
        const res = { positivo: 0, negativo: 0, noDiagnosticado: 0 };

        if (diagnosticos) {
            diagnosticos.forEach((x) => {
                if (!x.validado) {
                    res.noDiagnosticado++;
                } else if (x.diagnosticoMedico == true) {
                    res.positivo++;
                } else {
                    res.negativo++;
                }
            });
        }

        return {
            labels: [t("txtPositivo"), t("txtNegativo"), t("txtNoValidado")],
            datasets: [{
                label: t("txtNumDiags"),
                data: [res.positivo, res.negativo, res.noDiagnosticado],
                backgroundColor: [
                    'rgba(255, 207, 86, 0.85)', 'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.7)'
                ]
            }]
        };
    }, [diagnosticos, t]);
    const mostrarPantallaCarga = !diagnosticos || !usuarios;

    useEffect(() => {
        if (errorDiagnosticos) {
            setModal({ mostrar: true, texto: errorDiagnosticos });
        } else if (errorUsuarios) {
            setModal({ mostrar: true, texto: errorUsuarios });
        }
    }, [errorDiagnosticos, errorUsuarios]);

    return (
        <>
            {mostrarPantallaCarga ? <PantallaCarga /> : (
                <Grid columns={{ xs: 1, sm: 2, md: 4 }} container spacing={2}>
                    <Grid size={4}>
                        <Typography variant="h4" fontStyle="bold" align="left">
                            {t("txtBienvenida", { nombre: usuario?.nombre })}
                        </Typography>
                        <Divider sx={{ padding: "1vh 0vw" }} />
                    </Grid>
                    <Grid size={4}>
                        <AdvertenciaEspacio numDiagnosticos={numDiagnosticos} />
                    </Grid>
                    <Grid
                        size={1}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        padding={paddingTarjetas}>
                        <TarjetaMenuPrincipal
                            titulo={t("txtDiagnosticosMes")}
                            valor={diagnosticosMesActual}
                            icono={<DiagnosticoIcono sx={{ fontSize: "4.5vh" }} />}
                            altura="100%" />
                    </Grid>
                    <Grid
                        size={1}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        padding={paddingTarjetas}>
                        <TarjetaMenuPrincipal
                            titulo={t("txtUsuariosMes")}
                            valor={usuariosMesActual}
                            icono={<PersonIcon sx={{ fontSize: "4.5vh" }} />}
                            altura="100%" />
                    </Grid>
                    <Grid
                        size={1}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        padding={paddingTarjetas}>
                        <TarjetaMenuPrincipal
                            titulo={t("txtDiagnosticosRecolectados")}
                            valor={numDiagnosticos}
                            icono={<DatosIcono sx={{ fontSize: "4.5vh" }} />}
                            altura="100%" />
                    </Grid>
                    <Grid
                        size={1}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        padding={paddingTarjetas}>
                        <TarjetaMenuPrincipal
                            titulo={t("txtDiagnosticosValidos")}
                            valor={numDiagnosticosValidados}
                            icono={<CheckCircleIcon sx={{ fontSize: "4.5vh" }} />}
                            altura="100%" />
                    </Grid>
                    <Grid
                        size={{ xs: 1, md: 2 }}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        padding={paddingGraficos}>
                        <GraficoBarras titulo={t("titGraficoBarrasMenu")} datos={datosGraficoBarras} />
                    </Grid>
                    <Grid
                        size={{ xs: 1, md: 2 }}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="40vh"
                        padding={paddingGraficos}>
                        <GraficoPastel titulo={t("titGraficoPastelMenuAdmin")} datos={datosGraficoPastel} />
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