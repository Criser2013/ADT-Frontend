import { Chip } from "@mui/material";
import { useMemo } from "react";
import { useNavegacion } from "../../contexts/NavegacionContext";

/**
 * Chip para mostrar el rol del usuario.
 * @param {string} rol - Rol del usuario.
 * @returns {JSX.Element}
 */
export function ChipRol ({ rol }) {
    return <Chips valor={rol} fnColor={(valor) => (valor === "Administrador" ? "error" : "success")} />;
}

/**
 * Chip para mostrar el sexo del paciente.
 * @param {string} sexo - Sexo del paciente. 
 * @returns {JSX.Element}
 */
export function ChipSexo({ sexo }) {
    return <Chips valor={sexo} fnColor={(valor) => (valor === "Masculino" ? "info" : "secondary")} />;
}

/**
 * Chip para mostrar el diagnóstico del paciente.
 * @param {string} diagnostico - Diagnóstico del paciente.
 * @returns {JSX.Element}
 */
export function ChipDiagnostico({ diagnostico }) {
    return <Chips valor={diagnostico} fnColor={(valor) => (valor === "Positivo" ? "warning" : "success")} />;
}

/**
 * Chip para mostrar el estado de validación del diagnóstico.
 * @param {string} validado - Estado de validación del diagnóstico.
 * @returns {JSX.Element}
 */
export function ChipValidado({ validado }) {
    let color = "error";
    if (validado === "Negativo") {
        color = "success";
    } else if (validado === "Positivo") {
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
    return <Chips valor={estado} fnColor={(valor) => (valor === "Activo" ? "success" : "error")} />;
}

/**
 * Componente para mostrar un dato dentro de un chip. Se recomienda usarlo en las tablas.
 * @param {string} valor - Valor del campo.
 * @param {function} fnColor - Función que determina el color del chip dependiendo del dato.
 * @returns {JSX.Element}
 */
export default function Chips({ valor, fnColor = () => "primary" }) {
    const { tema } = useNavegacion();
    const variante = useMemo(() => {
        return (tema == "light") ? "filled" : "outlined";
    }, [tema]);

    return <Chip variant={variante} size="small" label={valor} color={fnColor(valor)} />;
};