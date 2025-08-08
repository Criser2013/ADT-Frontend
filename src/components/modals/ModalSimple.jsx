import { Dialog, DialogTitle, DialogContent, Button, Typography, DialogActions, Divider } from "@mui/material";

/**
 * Modal simple para mostrar mensajes o información al usuario.
 * @param {Boolean} abrir - Controla si el modal está abierto o cerrado
 * @param {String} titulo - Título del modal
 * @param {String} mensaje - Mensaje a mostrar en el modal
 * @param {String} txtBtn - Texto del botón del modal
 * @param {Function} manejadorBtnModal - Función que se ejecuta al hacer clic en el botón del modal.
 * @param {JSX.Element} iconoBtn - Icono que se muestra en el botón del modal (opcional).
 * @returns {JSX.Element}
 */
export default function ModalSimple({ abrir, titulo, mensaje, txtBtn, manejadorBtnModal, children, iconoBtn = null }) {
    return (
        <Dialog open={abrir}>
            <DialogTitle><b>{titulo}</b></DialogTitle>
            <Divider />
            <DialogContent>
                {(mensaje != null && mensaje != "") ? (
                    <Typography>{mensaje}</Typography>) : (
                    children
                )}
            </DialogContent>
            <Divider />
            <DialogActions>
                <Button
                    type="submit"
                    variant="contained"
                    startIcon={iconoBtn}
                    onClick={manejadorBtnModal}
                    sx={{ textTransform: "none" }}>
                    <b>{txtBtn}</b>
                </Button>
            </DialogActions>
        </Dialog>
    );
};