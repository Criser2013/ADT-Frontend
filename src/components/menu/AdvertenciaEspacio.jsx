import { Alert } from "@mui/material";
import { CODIGO_ADMIN, CANT_LIM_DIAGNOSTICOS } from "../../../constants";

/**
 * Alerta de espacio de almacenamiento.
 * @param {Int} rol - Código del rol del usuario.
 * @param {Int} cantidadDiagnosticos - Cantidad de diagnósticos almacenados
 * @returns {JSX.Element}
 */
export default function AdvertenciaEspacio({ rol, cantidadDiagnosticos }) {
    return (
        ((rol == CODIGO_ADMIN) && (cantidadDiagnosticos >= CANT_LIM_DIAGNOSTICOS)) ? (
            <Alert severity="warning">
                Tu almacenamiento está por agotarse. Para evitar pérdidas, se recomienda respaldar o exportar la información y eliminar diagnósticos antiguos.
            </Alert>
        ) : null
    );
};