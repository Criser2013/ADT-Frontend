
import { useAuth } from "./contexts/AuthContext";
import { useCredenciales } from "./contexts/CredencialesContext";
import { useEffect, useState } from "react";
import { useNavegacion } from "./hooks/Navegacion";
import { useTranslation } from "react-i18next";
import Router from "./router";
import ModalSimple from "./components/modals/ModalSimple";
import ModalDoble from "./components/modals/ModalDoble";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import UpdateIcon from '@mui/icons-material/Update';
import dayjs from "dayjs";
import { IconoPermisos } from "./components/icons/IconosModal";


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
    const [modalCompuesto, setModalCompuesto] = useState({
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
            setModalCompuesto({
                mostrar: true, titulo: t("titModalSesionCaducada"), mensaje: t("txtModalSesionCaducada"),
                txtBtn: t("txtBtnExtenderSesion"), icono: <UpdateIcon />
            });
        }
    }, [requiereRefresco, setModalCompuesto, t]);

    useEffect(() => {
        if (error && error !== "errPermisos") {
            setModalSimple({ mostrar: true, mensaje: t(error, { usuario: usuario.nombre, correo: usuario.correo }) });
        } else if (error === "errPermisos") {
            setModalCompuesto({
                mostrar: true, mensaje: t("txtModalPermisos"), titulo: t("titModalPermisos"),
                txtBtn: t("txtBtnPermisos"), icono: <IconoPermisos />
            });
        }
    }, [error, usuario, t]);

    const manejadorBtnCerrar = () => {
        setModalSimple((x) => ({ ...x, mostrar: false }));
        if ((typeof callbackError) === "function") {
            callbackError();
        }
        callbackError.current = null;
    };

    const manejadorBtnAutenticar = async () => {
        setModalCompuesto((x) => ({ ...x, mostrar: false }));
        await iniciarSesion(usuario);
    };

    const manejadorBtnCerrarSesion = () => {
        setModalCompuesto((x) => ({ ...x, mostrar: false }));
        paginaAnterior.current = location.pathname;
        location.replace("/cerrar-sesion");
    };

    return (
        <span style={{ height: "100vh", width: "100vw" }}>
            <Router />
            <ModalDoble
                abrir={modalCompuesto.mostrar}
                mensaje={modalCompuesto.mensaje}
                titulo={modalCompuesto.titulo}
                manejadorBtnPrimario={manejadorBtnAutenticar}
                manejadorBtnSecundario={manejadorBtnCerrarSesion}
                mostrarBtnSecundario={true}
                txtBtnSimple={modalCompuesto.txtBtn}
                txtBtnSecundario={t("txtBtnCerrarSesion")}
                iconoBtnSecundario={<LogoutIcon />}
                iconoBtnPrincipal={modalCompuesto.icono}
                txtBtnSimpleAlt={modalCompuesto.txtBtn}
            />
            <ModalSimple
                abrir={modalSimple.mostrar}
                titulo={t("tituloErr")}
                mensaje={modalSimple.mensaje}
                manejadorBtnModal={manejadorBtnCerrar}
                txtBtn={t("txtBtnCerrar")}
                iconoBtn={<CloseIcon />}
            />
        </span>
    );
};