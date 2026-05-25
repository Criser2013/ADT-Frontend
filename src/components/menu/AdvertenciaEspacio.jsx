import { Alert } from "@mui/material";
import { CANT_LIM_DIAGNOSTICOS } from "../../../constants";
import { useTranslation } from "react-i18next";

/**
 * Alerta de espacio de almacenamiento.
 * @param {boolean} administrador - Indica si el usuario es administrador.
 * @param {int} cantidadDiagnosticos - Cantidad de diagnósticos almacenados
 * @returns {JSX.Element}
 */
export default function AdvertenciaEspacio({ administrador, cantidadDiagnosticos }) {
    const { t } = useTranslation();
    return (
        (administrador && (cantidadDiagnosticos >= CANT_LIM_DIAGNOSTICOS)) ? (
            <Alert severity="warning">
                {t("txtEspacio")}
            </Alert>
        ) : null
    );
};