import CloseIcon from "@mui/icons-material/Close";
import ReCAPTCHA from "react-google-recaptcha";
import { ModalSimple } from "../../components/modals";
import { peticionApi } from "../../services/Api";
import { useCredenciales, useNavegacion } from "../../hooks";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Casilla de verificación de captcha para validar que el usuario no es un robot. Valida 
 * la respuesta del captcha con el backend y establece el estado de aceptación del captcha.
 * @param {import("react").SetStateAction<Boolean>} setCarga Función para establecer el estado de carga dependiente. 
 * @param {import("react").SetStateAction<Boolean>} setCaptchaAceptado Función para establecer el estado de aceptación del captcha. 
 * @returns {JSX.Element}
 */
export default function Captcha({ setCarga, setCaptchaAceptado }) {
    const { idioma, tema } = useNavegacion();
    const { reCAPTCHA } = useCredenciales();
    const captcha = useRef(null);
    const { t } = useTranslation();
    const [modal, setModal] = useState({
        mostrar: false, mensaje: ""
    });

    function mostrarError(mensaje) {
        captcha.current.reset();
        setCaptchaAceptado(false);
        setModal({ mostrar: true, titulo: t("tituloErr"), mensaje: mensaje });
    };

    async function validarToken(token) {
        let txtError = t("errCaptcha");
        setCarga(true);
        const { success, data, error } = await peticionApi(
            "recaptcha", "POST", {}, { token: token }, null, idioma, t("errCaptchaApi")
        );
        if (!success && error) {
            mostrarError(txtError);
        } else if (success && !data.success) {
            // Cuando la petición es hecha correctamente pero el API de Recaptcha devuelve un error siempre lo hace como array
            txtError = error.reduce((acum, i) => acum + `${i} `, "");
            mostrarError(txtError);
        }
        setCaptchaAceptado(success && data.success);
        setCarga(false);
    };

    async function manejadorCambiosCaptcha(token) {
        if (token) {
            await validarToken(token);
        } else {
            setCaptchaAceptado(false);
        }
    };

    function manejadorBtnModal() {
        setModal((x) => ({ ...x, mostrar: false }));
    };

    return (
        <>
            <ReCAPTCHA
                key={`${tema}-${idioma}`}
                theme={tema}
                onChange={manejadorCambiosCaptcha}
                sitekey={reCAPTCHA}
                hl={idioma}
                ref={captcha}
            />
            <ModalSimple
                mostrar={modal.mostrar}
                titulo={t("tituloErr")}
                texto={modal.mensaje}
                txtBtn={t("txtBtnCerrar")}
                manejadorBtn={manejadorBtnModal}
                iconoBtn={<CloseIcon />}
            />
        </>
    );
};