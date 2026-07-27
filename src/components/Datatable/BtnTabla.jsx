import { Button, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";


/**
 * Botón para utilizar en datatable que permite validar un diagnóstico.
 * @param {Object} instancia Instancia de la fila en la tabla.
 * @param {function} manejadorBtn Función que se ejecutará al hacer click en el botón.
 * @param {String} txtAyuda Texto de ayuda que se mostrará al pasar el mouse sobre el botón.
 * @param {String} color Color del botón. Por defecto es "primary".
 * @param {JSX.Element|null} icono Icono que se mostrará en el botón. Por defecto es null.
 * @returns {JSX.Element}
 */
export default function BtnValidacion({ instancia, manejadorBtn, txtAyuda, color = "primary", icono = null }) {
    const { t } = useTranslation();
    return (
        <Tooltip title={t(txtAyuda)}>
            <Button onClick={() => manejadorBtn(instancia)} color={color} variant="outlined">
                {icono}
            </Button>
        </Tooltip>
    );
};