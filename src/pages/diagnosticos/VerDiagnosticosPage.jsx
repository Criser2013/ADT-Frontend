import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import Datatable from "../../components/datatable";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FormSeleccionar from "../../components/forms/FormSeleccionar";
import RefreshIcon from '@mui/icons-material/Refresh';

import { AdvertenciaEspacio } from "../../components/menu";
import { BtnTabla } from "../../components/datatable";
import { Grid, Box, CircularProgress, Tooltip, IconButton, Button, Typography } from "@mui/material";
import { Check } from "../../components/tabs";
import { ChipDiagnostico, ChipSexo, ChipValidado } from "../../components/tabs/Chips";
import { FormExportacion, FormValidacion } from "../../components/forms";
import { MenuLayout, TabHeader, PantallaCarga } from "../../components/layout";
import { ModalDoble, ModalSimple } from "../../components/modals";
import { useAuth, useDiagnosticos, useOperacionesDiagnosticos } from "../../hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Timestamp } from "firebase/firestore";
import { Diagnostico } from '../../models';


/**
 * Página para ver los diagnósticos del usuario.
 * @returns {JSX.Element}
 */
export default function VerDiagnosticosPage() {
    const { usuario } = useAuth();
    const { t } = useTranslation();
    const { eliminarDiagnosticos, validarDiagnostico } = useOperacionesDiagnosticos();
    const { error, diagnosticos, mapeoDiagnosticos, manejadorCargaDiagnosticos } = useDiagnosticos(
        usuario?.rolVisible, usuario?.uid, Timestamp.now(), true
    );

    const navigate = useNavigate();
    const [procesando, setProcesando] = useState(true);
    const [modalValidacion, setModalValidacion] = useState(false);
    const [modalEliminacion, setModalEliminacion] = useState(false);
    const [modalExportacion, setModalExportacion] = useState(false);
    const [modalError, setModalError] = useState({ mostrar: false, texto: "" });

    const [instancia, setInstancia] = useState(null);

    const mostrarPantallaCarga = procesando || !diagnosticos || !mapeoDiagnosticos;

    const campos = useMemo(() => {
        const campoNombre = usuario?.rolVisible ? "usuario" : "paciente";

        const aux = [
            { id: "id", label: "ID", componente: null, ordenable: true },
            { id: campoNombre, label: t(`txt${campoNombre[0].toUpperCase() + campoNombre.slice(1)}`), componente: null, ordenable: true }
        ];
        const aux2 = [
            { id: "fecha", label: t("txtFecha"), componente: (x) => dayjs(x.fecha).format(t("formatoFechaHoraResumida")), ordenable: true },
            { id: "edad", label: t("txtCampoEdad"), componente: null, ordenable: true },
            { id: "sexo", label: t("txtCampoSexo"), componente: (x) => <ChipSexo valor={x.sexo} />, ordenable: true },
            { id: "diagnostico", label: t("txtCampoDiagModelo"), componente: (x) => <ChipDiagnostico valor={x.diagnostico} />, ordenable: true },
            { id: "validado", label: t("txtCampoDiagMedico"), componente: (x) => <ChipValidado valor={x.validado} />, ordenable: true },
            {
                id: "accion", label: t("txtAccion"),
                componente: usuario?.rolVisible ? 
                (x) => <BtnTabla instancia={x} manejadorBtn={manejadorBtnEliminarTabla} txtAyuda="txtAyudaEliminarDiag" color="error" icono={<DeleteIcon />} /> :
                (x) => <BtnTabla instancia={x} manejadorBtn={manejadorBtnValidarTabla} txtAyuda="txtAyudaValidar" icono={<CheckCircleOutlineIcon />} />, 
                ordenable: false
            }
        ];
        if (!usuario?.rolVisible) {
            aux.push({ id: "paciente", label: t("txtCedula"), componente: null, ordenable: true });
        }
        return aux.concat(aux2);
    }, [usuario?.rolVisible, t, manejadorBtnValidarTabla, manejadorBtnEliminarTabla]);
    const listadoPestanas = [
        { texto: usuario?.rolVisible ? t("txtDatosRecolectados") : t("txtHistorialDiagnosticos"), url: "/diagnosticos" }
    ];

    useEffect(() => {
        document.title = usuario?.rolVisible ? t("txtDatosRecolectados") : t("txtHistorialDiagnosticos");
    }, [usuario?.rolVisible, t]);

    useEffect(() => {
        if (error) {
            setModalError({ mostrar: true, texto: error });
        }
    }, [error]);

    async function manejadorBtnRecargar() {
        setProcesando(true);
        await manejadorCargaDiagnosticos(
            usuario?.rolVisible, usuario?.uid, Timestamp.now()
        );
        setProcesando(false);
    };

    /**
     * @param {Array<String>|null} diagnosticos Lista IDs de los diagnósticos a eliminar.
     */
    async function manejadorBtnModalEliminacion(diagnosticos) {
        setModalEliminacion(false);
        setProcesando(true);
        if (Array.isArray(diagnosticos)) {
            await eliminarDiagnosticos(diagnosticos);
        } else {
            await eliminarDiagnosticos([instancia.id]);
        }
        await manejadorCargaDiagnosticos(
            usuario?.rolVisible, usuario?.uid, Timestamp.now()
        );
        setProcesando(false); 
    };

    /**
     * @param {Diagnostico} diagnostico Instancia del diagnóstico a eliminar.
     */
    const manejadorBtnEliminarTabla = useCallback((diagnostico) => {
        setInstancia(mapeoDiagnosticos[diagnostico.id]);
        setModalEliminacion(true);
    }, [mapeoDiagnosticos]);

    /**
     * @param {Diagnostico} diagnostico Instancia del diagnóstico a validar.
     */
    const manejadorBtnValidarTabla = useCallback((diagnostico) => {
        setInstancia(mapeoDiagnosticos[diagnostico.id]);
        setModalValidacion(true);
    }, [mapeoDiagnosticos]);

    /**
     * @param {Boolean} diagnosticoMedico Valor de validación del diagnóstico.
     */
    async function manejadorBtnValidar({ diagnosticoMedico }) {
        setModalValidacion(false);
        setProcesando(true);
        const { success } = await validarDiagnostico(instancia, diagnosticoMedico);
        if (success) {
            await manejadorCargaDiagnosticos(usuario?.rolVisible, usuario?.uid, Timestamp.now());
        }
        setProcesando(false);
    };

    return (
        <MenuLayout>
            {mostrarPantallaCarga ? <PantallaCarga /> : (
                <>
                    <TabHeader
                        titulo={usuario?.rolVisible ? t("txtHistorialDiagnosticos") : t("txtDatosRecolectados")}
                        pestanas={listadoPestanas}
                        activarBtnAtras={false} />
                    <Grid container columns={1} spacing={3} sx={{ marginTop: "3vh" }}>
                        <AdvertenciaEspacio numDiagnosticos={diagnosticos?.length} />
                        <Grid size={1} display="flex" justifyContent="space-between" alignItems="center">
                            <Tooltip title={t("txtAyudaBtnRecargar")}>
                                <IconButton onClick={manejadorBtnRecargar}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={usuario?.rolVisible ? t("txtAyudaBtnExportarAdmin") : t("txtAyudaBtnExportar")}>
                                <span>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => setModalExportacion(true)}
                                        disabled={diagnosticos?.length == 0}
                                        sx={{ textTransform: "none" }}
                                        startIcon={usuario?.rolVisible ? <AddToDriveIcon /> : <FileDownloadIcon />}>
                                        <b>{t("txtBtnExportar")}</b>
                                    </Button>
                                </span>
                            </Tooltip>
                        </Grid>
                        <Datatable
                            datos={diagnosticos}
                            campos={campos}
                            campoId="id"
                            lblBusqueda={usuario?.rolVisible ? t("txtBusqDiagAdmin") : t("txtBusqDiag")}
                            lblSeleccion={t("txtSufijoDiagsSelecs")}
                            tooltipAccion={t("txtAyudaEliminarDiags")}
                            activarBusqueda
                            activarSeleccion={usuario?.rolVisible}
                            camposBusqueda={usuario?.rolVisible ? ["id", "nombre"] : ["id", "nombre", "paciente"]}
                            campoOrdenInicial="fecha"
                            direccionOrdenInicial="desc"
                            callbackClicCelda={(x) => navigate(`/diagnosticos/${x.id}-${x.usuario}`)}
                            callbackBtnbAccion={() => setModalEliminacion(true)}
                            icono={<DeleteIcon />} />
                    </Grid>
                </>)}
            <FormValidacion
                mostrar={modalValidacion}
                manejadorBtn={manejadorBtnValidar}
                manejadorCierre={() => setModalValidacion(false)} />
            <ModalDoble
                mostrar={modalEliminacion}
                titulo={t("titAlerta")}
                txtBtnPrincipal={t("txtBtnEliminar")}
                txtBtnSecundario={t("txtBtnCancelar")}
                manejadorBtnPrincipal={manejadorBtnModalEliminacion}
                manejadorBtnSecundario={() => setModalEliminacion(false)}
                iconoBtnPrincipal={<DeleteIcon />}
                iconoBtnSecundario={<CloseIcon />} />
            <FormExportacion
                mostrar={modalExportacion}
                diagnosticos={diagnosticos}
                manejadorCierre={() => setModalExportacion(false)} />
            <ModalSimple
                mostrar={modalError.mostrar}
                titulo={t("titErr")}
                texto={t(modalError.texto)}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtn={() => setModalError((X) => ({ ...X, mostrar: false }))}
                iconoBtn={<CloseIcon />} />
        </MenuLayout>
    );
};