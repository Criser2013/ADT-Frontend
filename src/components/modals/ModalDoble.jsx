import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, Divider } from "@mui/material";

/**
 * Cuadro de diálogo de 2 botones para acciones, mostrar información o colocar formularios.
 * @param {Boolean} mostrar Indica si el modal debe mostrarse.
 * @param {String} titulo Título del modal.
 * @param {String} texto Texto a mostrar en el modal. Sino se proporciona, se mostrará el contenido de los children.
 * @param {JSX.Element} children Contenido adicional a mostrar en el modal, si no se proporciona texto.
 * @param {String} txtBtnPrincipal Texto del botón principal.
 * @param {String} txtBtnSecundario Texto del botón secundario.
 * @param {Function} manejadorBtnPrincipal Función a ejecutar al hacer clic en el botón principal (derecho).
 * @param {Function} manejadorBtnSecundario Función a ejecutar al hacer clic en el botón secundario (izquierdo).
 * @param {JSX.Element} iconoBtnPrincipal Icono que se muestra en el botón principal (opcional).
 * @param {JSX.Element} iconoBtnSecundario Icono que se muestra en el botón secundario (opcional).
 * @returns {JSX.Element}
 */
export default function ModalDoble({ mostrar, titulo, texto = null, txtBtnPrincipal, txtBtnSecundario,
    manejadorBtnPrincipal, manejadorBtnSecundario, iconoBtnPrincipal = null, iconoBtnSecundario = null,
    children = null
}) {
    const contenidoBtns = [
        { clave: "secundario", texto: txtBtnSecundario, manejador: manejadorBtnSecundario, icono: iconoBtnSecundario },
        { clave: "principal", texto: txtBtnPrincipal, manejador: manejadorBtnPrincipal, icono: iconoBtnPrincipal }
    ];
    return (
        <Dialog open={mostrar}>
            <DialogTitle><b>{titulo}</b></DialogTitle>
            <Divider />
            <DialogContent>
                {texto ? <Typography>{texto}</Typography> : (children)}
            </DialogContent>
            <Divider />
            <DialogActions>
                {contenidoBtns.map((btn) => (
                    <Button
                    key={btn.clave}
                    type="button"
                    variant="contained"
                    onClick={btn.manejador}
                    startIcon={btn.icono}
                    sx={{ textTransform: "none" }}>
                    <b>{btn.texto}</b>
                </Button>
                ))}
            </DialogActions>
        </Dialog>
    );
};