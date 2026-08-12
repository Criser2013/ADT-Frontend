import {
    IconButton, Popover, Typography, Box,
    MenuItem, Divider, Stack
} from "@mui/material";


/**
 * Componente popover que se muestra al hacer click en el avatar del usuario.
 * Contiene funciones como cerrar sesión y cambiar el modo de usuario.
 * @param {JSX.Element} id Componente del que se desplegará el popover.
 * @param {Boolean} mostrar Indicador para mostrar el popover.
 * @param {JSX.Element} anchorEl Componente al que se anclará el popover.
 * @param {Object} anchorOrigin Objeto que indica la posición del popover respecto al componente anclado.
 * @param {Object} transformOrigin Objeto que indica la posición del popover respecto a su propio contenido.
 * @param {Object} paperProps Objeto con propiedades para el componente Paper del popover. Opcional.
 * @param {import("react").SetStateAction} setPopOver Función para cerrar el popover.
 * @param {JSX.Element} children Contenido del popover.
 * @returns {JSX.Element} 
 */
export default function PopOver({
    id, mostrar, anchorEl, anchorOrigin = { vertical: "bottom", horizontal: "right" },
    transformOrigin = { vertical: "top", horizontal: "right" }, paperProps = {},
    setPopOver, children
}) {
    return (
        <Popover
            id={id}
            open={mostrar}
            anchorEl={anchorEl}
            onClose={() => setPopOver(null)}
            anchorOrigin={anchorOrigin}
            transformOrigin={transformOrigin}
            PaperProps={paperProps}>
                {children}
        </Popover>
    );
};