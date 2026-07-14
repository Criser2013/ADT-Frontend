import { Alert } from "@mui/material";
import { CANT_LIM_DIAGNOSTICOS } from "../../constants";
import { useAuth } from "../../hooks";
import { useTranslation } from "react-i18next";


/**
 * Componente de alerta de espacio cuando se está llegando  al límite 
 * de almacenamiento previsto.
 * @param {Number} numDiagnosticos Cantidad de diagnósticos almacenados
 * @returns {JSX.Element}
 */
export default function AdvertenciaEspacio({ numDiagnosticos }) {
    const { t } = useTranslation();
    const { usuario } = useAuth();
    return (
        ((usuario.rol) && (numDiagnosticos >= CANT_LIM_DIAGNOSTICOS)) ? (
            <Alert severity="warning">
                {t("txtEspacio")}
            </Alert>
        ) : null
    );
};