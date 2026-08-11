import { Chip } from "@mui/material";
import { useMemo } from "react";
import { useTema } from "../../hooks";
import { useTranslation } from "react-i18next";


/**
 * Chip para mostrar el rol del usuario.
 * @param {String} valor Rol del usuario.
 * @returns {JSX.Element}
 */
export function ChipRol({ valor }) {
    const { t } = useTranslation();
    return (
        <Chips
            etiqueta={valor ? t("txtAdministrador") : t("txtUsuario")}
            valor={valor}
            fnColor={(valor) => (valor ? "error" : "success")} />
    );
};

/**
 * Chip para mostrar el sexo del paciente.
 * @param {Number} valor Sexo del paciente. 
 * @returns {JSX.Element}
 */
export function ChipSexo({ valor }) {
    const { t } = useTranslation();
    return (
        <Chips
            etiqueta={valor == 0 ? t("txtMasculino") : t("txtFemenino")}
            valor={valor}
            fnColor={(valor) => (valor == 0 ? "info" : "secondary")} />
    );
};

/**
 * Chip para mostrar el diagnóstico del paciente.
 * @param {Boolean} valor Diagnóstico del paciente según el modelo.
 * @returns {JSX.Element}
 */
export function ChipDiagnostico({ valor }) {
    const { t } = useTranslation();
    return (
        <Chips
            etiqueta={valor ? t("txtPositivo") : t("txtNegativo")}
            valor={valor}
            fnColor={(valor) => (valor ? "warning" : "success")} />
    );
};

/**
 * Chip para mostrar el estado de validación del diagnóstico.
 * @param {Boolean} valor Estado de validación del diagnóstico.
 * @returns {JSX.Element}
 */
export function ChipValidado({ valor }) {
    const { t } = useTranslation();
    const fnColor = (valor) => {
        let color = "error";
        if (valor == false) {
            color = "success";
        } else if (valor) {
            color = "warning";
        }
        return color;
    };
    let etiqueta = t("txtNoValidado");

    if (valor) {
        etiqueta = t("txtPositivo");
    } else if (valor == false) {
        etiqueta = t("txtNegativo");
    }
    return (
        <Chips etiqueta={etiqueta} valor={valor} fnColor={fnColor} />
    );
};

/**
 * Chip para mostrar el estado de un usuario.
 * @param {String} valor Estado del usuario.
 * @returns {JSX.Element}
 */
export function ChipEstado({ valor }) {
    const { t } = useTranslation();
    return (<Chips
        etiqueta={valor ? t("txtActivo") : t("txtInactivo")}
        valor={valor}
        fnColor={(valor) => (valor ? "success" : "error")} />
    );
};

/**
 * Componente para mostrar un dato dentro de un chip. Se recomienda usarlo en las tablas.
 * @param {String} etiqueta Etiqueta a mostrar en el chip.
 * @param {String|Number} valor Valor del campo.
 * @param {Function} fnColor Función que determina el color del chip dependiendo del valor del dato.
 * @returns {JSX.Element}
 */
export default function Chips({ etiqueta, valor, fnColor = () => "primary" }) {
    const { tema } = useTema();
    const variante = useMemo(() => {
        return (tema == "light") ? "filled" : "outlined";
    }, [tema]);

    return (
        <Chip
            clickable={false}
            variant={variante}
            size="small"
            label={etiqueta}
            color={fnColor(valor)} />
    );
};