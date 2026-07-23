import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from "@mui/icons-material/Close";
import { Controller, useForm } from "react-hook-form";
import { MenuItem , Stack, Typography, TextField} from "@mui/material";
import { ModalDoble } from "../modals";
import { useTranslation } from "react-i18next";

const valoresDiagnostico = [
    { valor: 2, texto: "txtSelecDiagnostico" },
    { valor: false, texto: "txtNegativo" },
    { valor: true, texto: "txtPositivo" }
];
const valorPredet = { diagnosticoMedico: 2 };


/**
 * Formulario para validar un diagnóstico de TEP.
 * @param {Boolean} mostrar Indicador para mostrar u ocultar el formulario.
 * @param {Function} manejadorBtn Función a ejecutar al presionar el botón de validar.
 * @param {Function} manejadorCierre Función a ejecutar al presionar el botón de cancelar.
 * @returns {JSX.Element}
 */
export default function FormValidacion({ mostrar = false, manejadorBtn, manejadorCierre }) {
    const { control, handleSubmit, formState: { errors } } = useForm({ defaultValues: valorPredet });
    const { t } = useTranslation();

    return (
        <ModalDoble
            mostrar={mostrar}
            titulo={t("titValidar")}
            txtBtnPrincipal={t("txtBtnValidar")}
            txtBtnSecundario={t("txtBtnCancelar")}
            manejadorBtnPrincipal={handleSubmit(manejadorBtn)}
            manejadorBtnSecundario={manejadorCierre}
            iconoBtnPrincipal={<CheckCircleOutlineIcon />}
            iconoBtnSecundario={<CloseIcon />} >
            <Stack orientation="column" spacing={2} width="100%">
                <Typography variant="body1">
                    {t("txtValidarDiagnostico")}
                </Typography>
                <Controller
                    name="diagnosticoMedico"
                    control={control}
                    rules={{ 
                        validate: (value) => value != 2 || t("errValidarDiagnostico")
                     }}
                    render={({ field }) => (
                        <TextField
                            select
                            {...field}
                            error={errors.diagnosticoMedico}
                            helperText={errors.diagnosticoMedico?.message}
                            fullWidth>
                            {valoresDiagnostico.map((x) => {
                                return (
                                    <MenuItem key={x.texto} value={x.valor}>
                                        {t(x.texto)}
                                    </MenuItem>
                                );
                            })}
                        </TextField>)} />
            </Stack>
        </ModalDoble>
    );
};