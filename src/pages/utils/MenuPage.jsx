import { MenuLayout } from "../../components/layout";
import { /*useAuth,*/ useIdioma } from "../../hooks";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
/*import MenuUsuario from "../../components/menu/MenuUsuario";
import MenuAdministrador from "../../components/menu/MenuAdministrador";*/

/**
 * Página del menú principal de la aplicación.
 * @returns {JSX.Element}
 */
export default function MenuPage() {
    const { idioma } = useIdioma();
    //const { usuario } = useAuth();
    const { t } = useTranslation();

    useEffect(() => {
        document.title = t("titMenu");
    }, [idioma, t]);

    return (
        <MenuLayout>
            prueba pro
            {/*{!usuario?.rolVisible ? (
                <MenuUsuario />
            ) : (
                <MenuAdministrador />
            )}*/}
        </MenuLayout>
    );
}