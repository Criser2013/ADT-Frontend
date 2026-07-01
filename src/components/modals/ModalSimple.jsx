import { Dialog, DialogTitle, DialogContent, Button, Typography, DialogActions, Divider } from "@mui/material";

/**
 * Cuadro de diálogo de un solo botón para mostrar mensajes o información al usuario.
 * @param {Boolean} mostrar Controla si el modal está abierto o cerrado.
 * @param {String} titulo Título del modal.
 * @param {String} mensaje Mensaje a mostrar en el modal, sino se proporciona, se mostrará el contenido de los children.
 * @param {String} txtBtn Texto del botón del modal.
 * @param {Function} manejadorBtn Función que se ejecuta al hacer clic en el botón del modal.
 * @param {JSX.Element} iconoBtn Icono que se muestra en el botón del modal (opcional).
 * @param {JSX.Element} children Contenido adicional a mostrar en el modal, si no se proporciona mensaje.
 * @returns {JSX.Element}
 */
export default function ModalSimple({ mostrar, titulo, mensaje = null, txtBtn, manejadorBtn, children, iconoBtn = null }) {
    return (
        <Dialog open={mostrar}>
            <DialogTitle><b>{titulo}</b></DialogTitle>
            <Divider />
            <DialogContent>
                {mensaje ? (<Typography>{mensaje}</Typography>) : (children)}
            </DialogContent>
            <Divider />
            <DialogActions>
                <Button
                    type="submit"
                    variant="contained"
                    startIcon={iconoBtn}
                    onClick={manejadorBtn}
                    sx={{ textTransform: "none" }}>
                    <b>{txtBtn}</b>
                </Button>
            </DialogActions>
        </Dialog>
    );
};