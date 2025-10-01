import { Alert } from "@mui/material";
import { CODIGO_ADMIN, CANT_LIM_DIAGNOSTICOS } from "../../../constants";
import { useTranslation } from "react-i18next";

/**
 * Alerta de espacio de almacenamiento.
 * @param {Int} rol - Código del rol del usuario.
 * @param {Int} cantidadDiagnosticos - Cantidad de diagnósticos almacenados
 * @returns {JSX.Element}
 */
export default function AdvertenciaEspacio({ rol, cantidadDiagnosticos }) {
    const { t } = useTranslation();
    return (
        ((rol == CODIGO_ADMIN) && (cantidadDiagnosticos >= CANT_LIM_DIAGNOSTICOS)) ? (
            <Alert severity="warning">
                {t("txtEspacio")}
            </Alert>
        ) : null
    );
};