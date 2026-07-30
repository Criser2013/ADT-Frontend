import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Check } from "../tabs";
import { Controller, useForm } from "react-hook-form";
import { convertirDiagnosticoExportable } from "../../utils/TratarDatos";
import { descargarArchivoXlsx } from "../../utils/XlsxFiles";
import { MenuItem, Stack, TextField, Typography } from "@mui/material";
import { ModalDoble, ModalSimple } from "../modals";
import { useAuth, useIdioma } from "../../hooks";
import { useState } from "react";
import { useTranslation } from "react-i18next";


const valoresPredet = {
    preprocesar: false, guardarDrive: false,
    tipoArchivo: "xlsx"
};

const formatos = [
    { valor: "xlsx", texto: "txtExcel" },
    { valor: "csv", texto: "txtCsv" }
];

function detTextoPersona(rol, nombre) {
    if (rol == "paciente" && nombre == "null") {
        return ["txtPaciente", "txtEliminado"];
    } else if (rol == "paciente" && nombre == "anonimo") {
        return ["txtPaciente", "txtAnonimo"];
    } else if (rol == "usuario" && nombre == "eliminado") {
        return ["txtUsuario", "txtEliminado"];
    } else {
        return [nombre];
    }
};

/**
 * Formulario para exportar diagnósticos en un archivo de Excel o CSV.
 * @param {Array<Diagnostico>} diagnosticos Diagnósticos a exportar.
 * @param {Boolean} mostrar Indica si el formulario debe mostrarse.
 * @param {Function} manejadorCierre Función que se ejecuta al cerrar el formulario.
 * @returns {JSX.Element}
 */
export default function FormExportacion({ diagnosticos, mostrar = false, manejadorCierre }) {
    const { control, handleSubmit, reset } = useForm({ defaultValues: valoresPredet });
    const { idioma } = useIdioma();
    const { t } = useTranslation();
    const { usuario, datosHelper } = useAuth();
    const [modalError, setModalError] = useState({ mostrar: false, texto: "" });

    /**
     * @param {Object} datos Datos del formulario.
     */
    async function manejadorExportar(datos) {
        manejadorCierre();

        const nombreHoja = usuario?.rolVisible ? t("txtDatosRecolectados") : t("txtHistorialDiagnosticos");
        const { preprocesar, guardarDrive, tipoArchivo } = datos;
        const opciones = {
            weekday: "long", year: "numeric", month: "long",
            day: "numeric", hour: "numeric", minute: "numeric"
        };
        const fecha = new Date().toLocaleDateString(idioma, opciones).replaceAll(".", "");
        const auxArr = [];
        const nombreArchivo = preprocesar ? `HADT ${t("txtDiagnosticos")} — ${fecha}-${t("txtPreprocesados")}`
            : `HADT ${t("txtDiagnosticos")} — ${fecha}`;

        for (let i = 0; i < diagnosticos.length; i++) {
            const persona = usuario?.rolVisible ? "usuario" : "paciente";
            diagnosticos[i][persona] = detTextoPersona(persona, diagnosticos[i][persona]).map((x) => t(x)).join(" ");
            auxArr.push(
                await convertirDiagnosticoExportable(diagnosticos[i], usuario?.rolVisible, preprocesar, idioma)
            );
        }

        const resDrive = guardarDrive ? (
            await datosHelper?.crearCopiaDiagnosticos(nombreArchivo, auxArr, tipoArchivo)) : (
            { success: true, error: null }
        );
        const resDescarga = descargarArchivoXlsx(auxArr, tipoArchivo, nombreArchivo, nombreHoja);

        if (!(resDrive.success && resDescarga.success)) {
            setModalError({
                mostrar: true, texto: resDrive.error || resDescarga.error
            });
        } else {
            reset(valoresPredet);
        }
    };

    return (
        <>
            <ModalDoble
                mostrar={mostrar}
                titulo={t("txtSelecArchivo")}
                txtBtnPrincipal={t("txtBtnExportar")}
                txtBtnSecundario={t("txtBtnCancelar")}
                manejadorBtnPrincipal={handleSubmit(manejadorExportar)}
                manejadorBtnSecundario={manejadorCierre}
                iconoBtnPrincipal={<FileDownloadIcon />}
                iconoBtnSecundario={<CloseIcon />} >
                <Stack orientation="column" spacing={2} width="100%">
                    <Typography variant="body1">
                        {t("txtSelecArchivo")}
                    </Typography>
                    <Controller
                        name="tipoArchivo"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                fullWidth
                                select
                                value={field.value}
                                onChange={field.onChange}
                                label={t("txtSelecArchivo")} >
                                {formatos.map((x) => (
                                    <MenuItem key={x.valor} value={x.valor}>
                                        {t(x.texto)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )} />
                    {usuario?.rolVisible ? (
                        <>
                            <Controller
                                name="preprocesar"
                                control={control}
                                render={({ field }) => (
                                    <Check
                                        marcado={field.value}
                                        manejadorCambios={field.onChange}
                                        etiqueta={t("txtPreprocesar")} />)} />

                            <Controller
                                name="guardarDrive"
                                control={control}
                                render={({ field }) => (
                                    <Check
                                        marcado={field.value}
                                        manejadorCambios={field.onChange}
                                        etiqueta={t("txtCopiaDrive")} />
                                )} />
                        </>
                    ) : null}
                </Stack>
            </ModalDoble>
            <ModalSimple
                mostrar={modalError.mostrar}
                titulo={t("tituloErr")}
                texto={`${t("errExportar")} ${modalError.texto}.`}
                txtBtn={t("txtBtnCerrar")}
                iconoBtn={<CloseIcon />}
                manejadorBtn={() => setModalError((x) => ({ ...x, mostrar: false }))} />
        </>
    );
};