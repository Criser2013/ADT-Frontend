import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Check } from "../tabs";
import { ModalDoble, ModalSimple } from "../modals";
import { Controller, useForm } from "react-hook-form";
import { useAuth, useIdioma } from "../../hooks";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MenuItem, Select, Typography } from "@mui/material";
import { descargarArchivoXlsx } from "../../utils/XlsxFiles";


const valoresPredet = {
    preprocesar: false, guardarDrive: false,
    tipoArchivo: "xlsx"
};

const formatos = [
    { valor: "xlsx", texto: "txtExcel" },
    { valor: "csv", texto: "txtCsv" }
];

export default function FormExportacion({ diagnosticos, mostrar = false, manejadorCierre }) {
    const { usuario, datosHelper } = useAuth();
    const { idioma } = useIdioma();
    const { t } = useTranslation();
    const { control, handleSubmit } = useForm({ defaultValues: valoresPredet });
    const [modalError, setModalError] = useState({ mostrar: false, texto: "" });

    async function manejadorExportar(datos) {
        manejadorCierre();

        const { preprocesar, guardarDrive, tipoArchivo } = datos;

        const json = diagnosticos.map((x) => x.toJson());
        const opciones = {
            weekday: "long", year: "numeric", month: "long",
            day: "numeric", hour: "numeric", minute: "numeric"
        };
        const fecha = new Date().toLocaleDateString(idioma, opciones).replaceAll(".", "");
        const auxArr = [];
        const nombreArchivo = preprocesar ? `HADT ${t("txtDiagnosticos")} — ${fecha}-${t("txtPreprocesados")}` : `HADT ${t("txtDiagnosticos")} — ${fecha}`;

        for (let i = 0; i < json.length; i++) {
            // Solo se incluyen los diagnósticos validados si se requiere preprocesar y lo pide un admin
            if (!preprocesar || (preprocesar && json[i].validado)) {
                json[i].id = usuario?.rolVisible ? `${json[i].id}-${json[i].usuario}` : json[i].id;
                json[i].paciente = datos[i].nombre;
                json[i] = nombresCampos(json[i], usuario?.rolVisible, preprocesar, idioma);
                auxArr.push(json[i]);
            }
        }

        const resDrive = guardarDrive ? (
            await datosHelper?.crearCopiaDiagnosticos(auxArr, nombreArchivo, tipoArchivo)) : (
            { success: true, error: null }
        );
        const resDescarga = descargarArchivoXlsx(auxArr, nombreArchivo, tipoArchivo);

        if (!(resDrive.success && resDescarga.success)) {
            setModalError({
                mostrar: true, texto: resDrive.error || resDescarga.error
            });
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
                    <Controller
                        name="preprocesar"
                        control={control}
                        render={({ field }) => (
                            <Check
                                marcado={field.value}
                                manejadorCambios={field.onChange}
                                etiqueta={t("txtPreprocesar")} />)} />
                    {usuario?.rolVisible ? (
                        <Controller
                            name="guardarDrive"
                            control={control}
                            render={({ field }) => (
                                <Check
                                    marcado={field.value}
                                    manejadorCambios={field.onChange}
                                    etiqueta={t("txtCopiaDrive")} />
                            )} />
                    ) : null}
                </Stack>
            </ModalDoble>
            <ModalSimple
                mostrar={modalError.mostrar}
                titulo={t("tituloErr")}
                mensaje={`${t("errExportar")} ${modalError.texto}.`}
                manejadorCierre={() => setModalError((x) => ({ ...x, mostrar: false }))}
            />
        </>
    );
};