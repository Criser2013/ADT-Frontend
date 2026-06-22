import { useDrive } from "../../contexts/DriveContext";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";
import FormPaciente from "../../components/forms/FormPaciente";
import MenuLayout from "../../components/layout/MenuLayout";
import { useNavigate, useSearchParams } from "react-router";
import { validarId } from "../../utils/Validadores";
import { useTranslation } from "react-i18next";
import { useNavegacion } from "../../hooks/Navegacion";
import { AES, enc } from "crypto-js";
import { AES_KEY } from "../../../constants";

/**
 * Página para editar los datos de un paciente.
 * @returns {JSX.Element}
 */
export default function EditarPacientePage() {
    const { autenticado, usuario } = useAuth();
    const drive = useDrive();
    const { t } = useTranslation();
    const { idioma } = useNavegacion();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const listadoPestanas = [
        { texto: t("titListaPacientes"), url: "/pacientes" },
        { texto: t("titEditarPaciente"), url: `/pacientes/editar${location.search}` }
    ];
    const id = params.get("id");

    /**
     * Carga el token de sesión y comienza a descargar el archivo de pacientes.
     */
    useEffect(() => {
        const token = sessionStorage.getItem("session-tokens");
        if (autenticado && token) {
            const tokens = JSON.parse(AES.decrypt(token, AES_KEY).toString(enc.Utf8));
            drive.setToken(tokens.accessToken);
        } else if (usuario?.tokenDrive) {
            drive.setToken(usuario.tokenDrive);
        }
    }, [usuario?.tokenDrive]);
    
    /**
     * Coloca el título de la página.
     */
    useEffect(() => {
        const res = (id != null && id != undefined) ? validarId(id) : false;

        if (!res) {
            navigate("/pacientes", { replace: true });
        }
    }, []);

    useEffect(() => {
        document.title = t("titEditarPaciente");
    }, [idioma]);

    return (
        <MenuLayout>
            <FormPaciente
                listadoPestanas={listadoPestanas}
                esAnadir={false}
                titPestana={t("titEditarPaciente")}
                id={id} />
        </MenuLayout>
    );
};