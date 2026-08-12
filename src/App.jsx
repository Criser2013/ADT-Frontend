import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import i18next from "i18next";
import LogoutIcon from "@mui/icons-material/Logout";
import Router from "./router";
import UpdateIcon from '@mui/icons-material/Update';
import { IconoPermisos } from "./components/icons/IconosModal";
import { ModalSimple, ModalDoble } from "./components/modals";
import { useAuth } from "./hooks";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";


/**
 * Componente principal que provee las credenciales de autenticación y muestra los 
 * errores y novedades relacionados con el servicio de autenticación.
 * @returns {JSX.Element}
 */
export default function App() {
    const { cerrarSesion, error, iniciarSesion, requiereRefresco, usuario } = useAuth();
    const { t } = useTranslation();
    const [modalSimple, setModalSimple] = useState({ mostrar: false, texto: "" });
    const [modalDoble, setModalDoble] = useState({
        mostrar: false, texto: "", titulo: "", txtBtn: "", icono: null
    });

    useEffect(() => {
        import("dayjs/locale/es").then(() => {
            const idioma = i18next.language.split("-")[0];
            dayjs.locale(idioma ? idioma : "es");
        });
    }, []);

    useEffect(() => {
        if (requiereRefresco) {
            setModalDoble({
                mostrar: true, titulo: t("titModalSesionCaducada"), texto: t("txtModalSesionCaducada"),
                txtBtn: t("txtBtnExtenderSesion"), icono: <UpdateIcon />
            });
        }
    }, [requiereRefresco, setModalDoble, t]);

    useEffect(() => {
        if (error && error != "errPermisos") {
            const params = usuario ? { usuario: usuario.nombre, correo: usuario.correo } : {};
            setModalSimple({ mostrar: true, texto: t(error, params) });
        } else if (error == "errPermisos") {
            setModalDoble({ 
                mostrar: true, texto: t("txtModalPermisos"), titulo: t("titModalPermisos"),
                txtBtn: t("txtBtnPermisos"), icono: <IconoPermisos />
            });
        }
    }, [error, usuario, t]);

    async function manejadorBtnAutenticar() {
        setModalDoble((x) => ({ ...x, mostrar: false }));
        const res = await iniciarSesion(usuario);
        if (res && (location.pathname == "/")) {
            location.replace("/menu");
        }
    };

    async function manejadorBtnCerrarSesion() {
        setModalDoble((x) => ({ ...x, mostrar: false }));
        const res = await cerrarSesion();
        if (res) {
            location.replace("/");
        }
    };

    return (
        <span style={{ height: "100vh", width: "100vw" }}>
            <Router />
            <ModalDoble
                mostrar={modalDoble.mostrar}
                titulo={modalDoble.titulo}
                texto={modalDoble.texto}
                txtBtnPrincipal={modalDoble.txtBtn}
                txtBtnSecundario={t("txtBtnCerrarSesion")}
                manejadorBtnPrincipal={manejadorBtnAutenticar}
                manejadorBtnSecundario={manejadorBtnCerrarSesion}
                iconoBtnSecundario={<LogoutIcon />}
                iconoBtnPrincipal={modalDoble.icono}
                txtBtnSimpleAlt={modalDoble.txtBtn}
            />
            <ModalSimple
                mostrar={modalSimple.mostrar}
                titulo={t("tituloErr")}
                texto={modalSimple.texto}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtn={() => setModalSimple((x) => ({ ...x, mostrar: false }))}
                iconoBtn={<CloseIcon />}
            />
        </span>
    );
};