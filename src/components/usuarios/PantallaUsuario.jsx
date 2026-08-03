import CloseIcon from "@mui/icons-material/Close";
import { ChipRol, ChipEstado } from "../tabs/Chips";
import { Grid } from "@mui/material";
import { ModalSimple } from "../modals";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";


/**
 * Modal para mostrar los datos de un usuario.
 * @param {Boolean} mostrar Indicador para mostrar u ocultar la pantalla de usuario.
 * @param {Usuario} instancia Instancia del usuario a mostrar en la pantalla.
 * @param {Number} cantDiagnosticosAportados Cantidad de diagnósticos aportados por el usuario.
 * @param {Function} manejadorCierre Función que se ejecuta al cerrar la pantalla.
 * @returns {JSX.Element}
 */
export default function PantallaUsuario({ mostrar, instancia, cantDiagnosticosAportados, manejadorCierre }) {
    const { t } = useTranslation();
    const campos = useMemo(() => [
        { id: "nombre", nombre: t("txtNombre"), valor: instancia?.nombre },
        { id: "correo", nombre: t("txtCorreo"), valor: instancia?.correo },
        { id: "rol", nombre: t("txtRol"), valor: <ChipRol valor={instancia?.esAdmin} /> },
        { id: "estado", nombre: t("txtEstado"), valor: <ChipEstado valor={instancia?.estado} /> },
        { id: "ultimaConexion", nombre: t("txtUltimaConexion"), valor: instancia?.fechaUltimoAcceso },
        { id: "registro", nombre: t("txtFechaRegistro"), valor: instancia?.fechaRegistro },
        { id: "cantidad", nombre: t("txtDiagAportados"), valor: cantDiagnosticosAportados },
    ], [cantDiagnosticosAportados, instancia, t]);

    return (
        <ModalSimple
            mostrar={mostrar}
            titulo={t("titDetallesUsuario")}
            manejadorCierre={manejadorCierre}
            txtBtn={t("txtBtnCerrar")}
            iconoBtn={<CloseIcon />} >
            <Grid container columns={12}>
                {campos.map((x) => (
                    <>
                        <Grid key={`${x.id}-titulo`} columns={4}>
                            {x.nombre}
                        </Grid>
                        <Grid key={`${x.id}-valor`} columns={8}>
                            {x.valor}
                        </Grid>
                    </>
                ))}
            </Grid>
        </ModalSimple>
    );
}