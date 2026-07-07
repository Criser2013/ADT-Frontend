import { Chip } from "@mui/material";
import { useMemo } from "react";
import { useTema } from "../../hooks";
import { useTranslation } from "react-i18next";

/**
 * Chip para mostrar el rol del usuario.
 * @param {string} rol - Rol del usuario.
 * @returns {JSX.Element}
 */
export function ChipRol({ rol }) {
    const { t } = useTranslation();
    return <Chips valor={rol} fnColor={(valor) => (valor === t("txtAdministrador") ? "error" : "success")} />;
}

/**
 * Chip para mostrar el sexo del paciente.
 * @param {string} sexo - Sexo del paciente. 
 * @returns {JSX.Element}
 */
export function ChipSexo({ sexo }) {
    const { t } = useTranslation();
    return (
        <Chips
            etiqueta={sexo == 0 ? t("txtMasculino") : t("txtFemenino")}
            valor={sexo}
            fnColor={(valor) => (valor == 0 ? "info" : "secondary")} />
    );
}

/**
 * Chip para mostrar el diagnóstico del paciente.
 * @param {string} diagnostico - Diagnóstico del paciente.
 * @returns {JSX.Element}
 */
export function ChipDiagnostico({ diagnostico }) {
    const { t } = useTranslation();
    return <Chips valor={diagnostico} fnColor={(valor) => (valor === t("txtPositivo") ? "warning" : "success")} />;
}

/**
 * Chip para mostrar el estado de validación del diagnóstico.
 * @param {string} validado - Estado de validación del diagnóstico.
 * @returns {JSX.Element}
 */
export function ChipValidado({ validado }) {
    const { t } = useTranslation();
    let color = "error";
    if (validado === t("txtNegativo")) {
        color = "success";
    } else if (validado === t("txtPositivo")) {
        color = "warning";
    }
    return <Chips valor={validado} fnColor={() => color} />;
}

/**
 * Chip para mostrar el estado de un usuario.
 * @param {string} estado - Estado del usuario.
 * @returns {JSX.Element}
 */
export function ChipEstado({ estado }) {
    const { t } = useTranslation();
    return <Chips valor={estado} fnColor={(valor) => (valor === t("txtActivo") ? "success" : "error")} />;
}

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