import { Fab, Tooltip } from "@mui/material";


/**
 * Botón flotante con texto de ayuda e icono
 * @param {String} txtBtn Texto del botón.
 * @param {String} txtAyudaBtn Texto de ayuda del botón.
 * @param {Function} manejadorBtn Manejador del botón.
 * @param {JSX.Element} icono Icono del botón.
 * @returns {JSX.Element}
 */
export default function BtnFlotante({ txtBtn, txtAyudaBtn, manejadorBtn, icono}) {
    return (
        <Tooltip title={txtAyudaBtn}>
            <Fab onClick={manejadorBtn}
                color="primary"
                variant="extended"
                sx={{
                    textTransform: "none",
                    display: "flex",
                    position: "fixed",
                    bottom: 20,
                    right: 20,
                    zIndex: 1000
                }} >
                {icono}
                <b>{txtBtn}</b>
            </Fab>
        </Tooltip>
    );
};