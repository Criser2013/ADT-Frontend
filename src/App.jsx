
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import Router from "./router";
import UpdateIcon from '@mui/icons-material/Update';
import { IconoPermisos } from "./components/icons/IconosModal";
import { ModalSimple, ModalDoble } from "./components/modals";
import { useAuth } from "./contexts/AuthContext";
import { useCredenciales } from "./contexts/CredencialesContext";
import { useEffect, useState } from "react";
import { useNavegacion } from "./hooks/Navegacion";
import { useTranslation } from "react-i18next";


/**
 * Componente principal que provee las credenciales de autenticación y muestra los 
 * errores relacionados con el servicio de autenticación.
 * @returns {JSX.Element}
 */
export default function App() {
    const { error, requiereRefresco, setAuth, setScopes, iniciarSesion, usuario } = useAuth();
    const { t } = useTranslation();
    const { callbackError, paginaAnterior } = useNavegacion();
    const { firebaseAuth, scopesDrive } = useCredenciales();
    const [modalSimple, setModalSimple] = useState({
        mostrar: false, mensaje: ""
    });
    const [modalDoble, setModalDoble] = useState({
        mostrar: false, mensaje: "", titulo: "", txtBtn: "", icono: null
    });

    useEffect(() => {
        import("dayjs/locale/es").then(() => {
            const idioma = localStorage.getItem("i18nextLng");
            dayjs.locale(idioma ? idioma : "es");
        });
    }, []);

    useEffect(() => { 
        setAuth(firebaseAuth);
        setScopes(scopesDrive);
    }, [firebaseAuth, scopesDrive, setAuth, setScopes]);

    useEffect(() => {
        if (requiereRefresco) {
            setModalDoble({
                mostrar: true, titulo: t("titModalSesionCaducada"), mensaje: t("txtModalSesionCaducada"),
                txtBtn: t("txtBtnExtenderSesion"), icono: <UpdateIcon />
            });
        }
    }, [requiereRefresco, setModalDoble, t]);

    useEffect(() => {
        if (error && error !== "errPermisos") {
            setModalSimple({ mostrar: true, mensaje: t(error, { usuario: usuario.nombre, correo: usuario.correo }) });
        } else if (error === "errPermisos") {
            setModalDoble({
                mostrar: true, mensaje: t("txtModalPermisos"), titulo: t("titModalPermisos"),
                txtBtn: t("txtBtnPermisos"), icono: <IconoPermisos />
            });
        }
    }, [error, usuario, t]);

    function manejadorBtnCerrar() {
        setModalSimple((x) => ({ ...x, mostrar: false }));
        if ((typeof callbackError) === "function") {
            callbackError();
        }
        callbackError.current = null;
    };

    async function manejadorBtnAutenticar() {
        setModalDoble((x) => ({ ...x, mostrar: false }));
        await iniciarSesion(usuario);
    };

    function manejadorBtnCerrarSesion() {
        setModalDoble((x) => ({ ...x, mostrar: false }));
        paginaAnterior.current = location.pathname;
        location.replace("/cerrar-sesion");
    };

    return (
        <span style={{ height: "100vh", width: "100vw" }}>
            <Router />
            <ModalDoble
                mostrar={modalDoble.mostrar}
                titulo={modalDoble.titulo}
                mensaje={modalDoble.mensaje}
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
                mensaje={modalSimple.mensaje}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtn={manejadorBtnCerrar}
                iconoBtn={<CloseIcon />}
            />
        </span>
    );
};