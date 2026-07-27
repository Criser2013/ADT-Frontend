import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Button, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";


/**
 * Botón para utilizar en datatable que permite validar un diagnóstico.
 * @param {Diagnostico} diagnostico Instancia de diagnóstico a validar.
 * @param {function} manejadorBtnValidar Función que se ejecutará al hacer click en el botón.
 * @returns {JSX.Element}
 */
export default function BtnValidacion({ diagnostico, manejadorBtnValidar }) {
    const { t } = useTranslation();
    return (
        <Tooltip title={t("txtAyudaValidar")}>
            <Button onClick={() => manejadorBtnValidar(diagnostico)} color="primary" variant="outlined">
                <CheckCircleOutlineIcon />
            </Button>
        </Tooltip>
    );
};