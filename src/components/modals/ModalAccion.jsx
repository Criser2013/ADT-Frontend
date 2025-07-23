import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from "@mui/material";

/**
 * Modal que muestra puede mostrar 1 o 2 botones.
 * @param {Boolean} abrir - Indica si el modal debe mostrarse.
 * @param {String} mensaje - Mensaje a mostrar en el modal.
 * @param {String} titulo - Título del modal.
 * @param {Function} manejadorBtnPrimario - Función a ejecutar al hacer clic en el botón primario.
 * @param {Function} manejadorBtnSecundario - Función a ejecutar al hacer clic en el botón secundario.
 * @param {Boolean} mostrarBtnSecundario - Indica si se debe mostrar el botón secundario.
 * @param {String} txtBtnSimple - Texto del botón primario.
 * @param {String} txtBtnSecundario - Texto del botón secundario.
 * @param {String} txtBtnSimpleAlt - Texto alternativo del botón primario si no se muestra el secundario.
 * @param {boolean} desactivarBtnPrimario - Indica si el botón primario debe estar desactivado.
 * @returns JSX.Element
 */
export default function ModalAccion({ abrir, mensaje, titulo, manejadorBtnPrimario, manejadorBtnSecundario, 
    mostrarBtnSecundario, txtBtnSimple, txtBtnSecundario, txtBtnSimpleAlt, children, desactivarBtnPrimario = false }) {
    return (
        <Dialog open={abrir}>
            <DialogTitle>{titulo}</DialogTitle>
            <DialogContent>
                {mensaje != "" ? <Typography>{mensaje}</Typography> : (children)}
            </DialogContent>
            <DialogActions>
                {mostrarBtnSecundario ? (
                    <Button
                        type="submit"
                        variant="contained"
                        onClick={manejadorBtnSecundario}
                        sx={{ textTransform: "none" }}>
                        <b>{txtBtnSecundario}</b>
                    </Button>) : null}
                <Button
                    type="submit"
                    variant="contained"
                    disabled={desactivarBtnPrimario}
                    onClick={manejadorBtnPrimario}
                    sx={{ textTransform: "none" }}>
                    <b>{mostrarBtnSecundario ? txtBtnSimple : txtBtnSimpleAlt}</b>
                </Button>
            </DialogActions>
        </Dialog>
    );
}