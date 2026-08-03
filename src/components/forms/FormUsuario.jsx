import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { Controller, useForm } from "react-hook-form";
import { Grid, MenuItem, TextField, Typography } from "@mui/material";
import { ModalDoble, ModalSimple } from "../modals";
import { useAuth } from "../../hooks";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";


const valoresPredet = {
    uid: "", nombre: "", correo: "", rol: false, estado: true
};

/**
 * Formulario para editar los datos de un usuario.
 * @param {Boolean} mostrar Indicador para mostrar u ocultar el formulario.
 * @param {Usuario} instancia Instancia del usuario a mostrar en el formulario.
 * @param {Function} manejadorBtn Función que se ejecuta al presionar el botón de actualización.
 * @param {Function} manejadorCierre Función que se ejecuta al cerrar el formulario. 
 * @returns {JSX.Element}
 */
export default function FormUsuario({ mostrar = false, instancia, manejadorBtn, manejadorCierre }) {
    const { control, handleSubmit, reset, setValues, watch } = useForm({ defaultValues: valoresPredet });
    const { t } = useTranslation();
    const { usuario } = useAuth();
    const desactivarCampos = usuario.uid == instancia?.uid;
    const estado = watch("estado");

    /**
     * @param {Usuario} usuario Instancia del usuario a mostrar en el formulario.
     */
    const colocarDatosUsuario = useCallback((usuario) => {
        setValues({
            uid: usuario.uid,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol,
            estado: usuario.estado
        });
    }, [setValues]);

    useEffect(() => {
        if (instancia) {
            colocarDatosUsuario(instancia);
        } else {
            reset(valoresPredet);
        }
    }, [instancia, colocarDatosUsuario, reset]);

    return (
        <ModalDoble
            mostrar={mostrar}
            titulo={t("titEditarUsuario")}
            txtBtnPrincipal={t("txtBtnGuardar")}
            txtBtnSecundario={t("txtBtnCancelar")}
            manejadorBtnPrincipal={handleSubmit(manejadorBtn)}
            manejadorBtnSecundario={manejadorCierre}
            iconoBtnPrincipal={<SaveIcon />}
            iconoBtnSecundario={<CloseIcon />} >
            <Grid container size={1} spacing={2} width={{ xs: "27vw", sm: "50vw", md: "60vw" }}>
                <Grid columns={1}>
                    <Controller
                        name="nombre"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                label={t("txtNombre")}
                                variant="outlined"
                                disabled
                                fullWidth
                                {...field} />)} />
                </Grid>
                <Grid columns={1}>
                    <Controller
                        name="correo"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                label={t("txtCorreoElectronico")}
                                variant="outlined"
                                disabled
                                fullWidth
                                {...field} />)} />
                </Grid>
                <Grid columns={1}>
                    <Controller
                        name="rol"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                select
                                label={t("txtRol")}
                                variant="outlined"
                                disabled={desactivarCampos}
                                {...field}
                                fullWidth>
                                <MenuItem value={false}>
                                    {t("txtUsuario")}
                                </MenuItem>
                                <MenuItem value={true}>
                                    {t("txtAdministrador")}
                                </MenuItem>
                            </TextField>)} />
                </Grid>
                <Grid columns={1}>
                    <Controller
                        name="estado"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                label={t("txtEstado")}
                                variant="outlined"
                                fullWidth
                                select
                                disabled={desactivarCampos}
                                {...field}>
                                <MenuItem value={false}>
                                    {t("txtInactivo")}
                                </MenuItem>
                                <MenuItem value={true}>
                                    {t("txtActivo")}
                                </MenuItem>
                            </TextField>)} />
                </Grid>
                {!estado ? (
                    <Grid columns={1}>
                        <Typography variant="body2" fontWeight="bold">
                            ⚠️ {t("txtAdvertenciaDesactivarUsuario")}
                        </Typography>
                    </Grid>) : null}
            </Grid>
        </ModalDoble>
    );
};