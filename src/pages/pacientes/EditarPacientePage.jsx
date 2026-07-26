
import { FormPaciente } from "../../components/forms";
import { MenuLayout } from "../../components/layout";
import { Paciente } from "../../models";;
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePaciente } from "../../hooks";
import { useTranslation } from "react-i18next";


/**
 * Página para editar los datos de un paciente.
 * @returns {JSX.Element}
 */
export default function EditarPacientePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { error, paciente } = usePaciente(id);
    const { t } = useTranslation();
    const listadoPestanas = [
        { texto: t("titListaPacientes"), url: "/pacientes" },
        { texto: `${t("txtPaciente")} — ${paciente?.nombre}`, url: `/pacientes/${id}` },
        { texto: t("titEditarPaciente"), url: `/pacientes/${id}/editar` }
    ];

    useEffect(() => {
        if (error) {
            navigate("/pacientes");
        }
    }, [error, navigate]);

    useEffect(() => {
        document.title = paciente ? `${t("titEditarPaciente")} — ${paciente?.nombre}`
            : t("titEditarPaciente");
    }, [t, paciente]);

    return (
        <MenuLayout>
            <FormPaciente
                url={`/pacientes/${id}`}
                titulo={t("titEditarPaciente")}
                pestanas={listadoPestanas}
                tooltip={t("txtVolverAtras")}
                paciente={paciente}
                esModificar />
        </MenuLayout>
    );
};