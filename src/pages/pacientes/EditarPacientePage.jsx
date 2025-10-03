import { useDrive } from "../../contexts/DriveContext";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";
import FormPaciente from "../../components/forms/FormPaciente";
import MenuLayout from "../../components/layout/MenuLayout";
import { useNavigate, useSearchParams } from "react-router";
import { validarId } from "../../utils/Validadores";
import { useTranslation } from "react-i18next";
import { useNavegacion } from "../../contexts/NavegacionContext";
import { AES, enc } from "crypto-js";
import { AES_KEY } from "../../../constants";

/**
 * Página para editar los datos de un paciente.
 * @returns {JSX.Element}
 */
export default function EditarPacientePage() {
    const auth = useAuth();
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
        if (token != null) {
            const tokens = JSON.parse(AES.decrypt(token, AES_KEY).toString(enc.Utf8));
            drive.setToken(tokens.accessToken);
        } else if (auth.tokenDrive != null) {
            drive.setToken(auth.tokenDrive);
        }
    }, [auth.tokenDrive]);
    
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