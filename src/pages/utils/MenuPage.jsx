import { useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import MenuLayout from "../../components/layout/MenuLayout";
import MenuUsuario from "../../components/menu/MenuUsuario";
import MenuAdministrador from "../../components/menu/MenuAdministrador";
import { useTranslation } from "react-i18next";
import { useNavegacion } from "../../hooks/Navegacion";

/**
 * Página del menú principal de la aplicación.
 * @returns {JSX.Element}
 */
export default function MenuPage() {
    const { usuario } = useAuth();
    const { t } = useTranslation();
    const { idioma } = useNavegacion();
    const admin = useMemo(() => usuario?.rolVisible, [usuario?.rolVisible]);

    useEffect(() => {
        document.title = t("titMenu");
    }, [idioma]);

    return (
        <MenuLayout>
            {!admin ? (
                <MenuUsuario />
            ) : (
                <MenuAdministrador />
            )}
        </MenuLayout>
    );
}