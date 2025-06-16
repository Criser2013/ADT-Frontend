import { signOut } from "firebase/auth";
import { createContext, useState, useContext, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { verUsuario } from "../firestore/usuarios-collection";
import { cambiarUsuario, verSiEstaRegistrado } from "../firestore/usuarios-collection";
import { ConstructionOutlined } from "@mui/icons-material";
//import { OAuth2Client } from "@google-auth-library";
//import { authenticate } from '@google-cloud/local-auth';
//import { google } from "@googleapis";


export const authContext = createContext();

export const useAuth = () => {
    const context = useContext(authContext);

    if (!context) {
        console.log("Error creando el contexto.");
    }

    return context;
};

export function AuthProvider({ children }) {

    const [auth, setAuth] = useState(null);
    const [db, setDb] = useState(null);
    const [drive, setDrive] = useState(null);
    const [authInfo, setAuthInfo] = useState({
        user: null, correo: null, rol: null
    });

    /**
     * Recupera la sesión si el usuario no la cerrado.
     */
    useEffect(() => {
        if (auth != null) {
            const suscribed = onAuthStateChanged(auth, (currentUser) => {
                console.log(currentUser)
                currentUser.getIdToken().then((x) => {
                    console.log(GoogleAuthProvider.credential(x, currentUser.accessToken))
                })
                
                !currentUser ?
                    setAuthInfo({ user: null, correo: null, rol: null }) :
                    setAuthInfo({ user: currentUser, correo: currentUser.email, rol: null });
            });
            return () => suscribed();
        }
    }, [auth]);

    /**
     * Si el usuario ya está autenticado, obtiene sus datos.
     */
    useEffect(() => {
        if (auth != null && authInfo.user != null) {
            verDatosUsuario(authInfo.user.email);
        }
    }, [authInfo.user]);

    /**
     * Retorna la información de autenticación (instancia de Firebase, correo, rol, nivel).
     * @returns JSON
     */
    const verAuthInfo = () => {
        return authInfo;
    };

    /**
     * Inicia sesión con Google dentro de Firebase.
     * @returns JSON
     */
    const iniciarSesionGoogle = async (scopes) => {
        try {
            const provider = new GoogleAuthProvider();

            for (const i of scopes) {
                provider.addScope(i);
            }

            const res = await signInWithPopup(auth, provider);
            const reg = await verRegistrado(res.user.email);

            setDrive(GoogleAuthProvider.credentialFromResult(res).accessToken); // .accessToken para usarlo en Drive

            console.log(res.user)
            console.log(GoogleAuthProvider.credentialFromResult(res).accessToken)
            
            console.log(res)

            if (!reg.success) {
                cerrarSesion();

                return { success: false, error: "No se pudo verificar si el usuario está registrado." };
            } else {
                setAuthInfo({ ...authInfo, user: res.user });
            }

            return { success: true, user: res.user };
        } catch (error) {
            console.log(error)
            return { success: false, error: error };
        }
    };

    /**
     * Registra un nuevo usuario en la base de datos.
     * @param {String} correo - Correo del usuario a registrar.
     * @returns JSON
     */
    const registrarUsuario = async (correo) => {
        // Rol = 0 - Usuario normal
        const res = await cambiarUsuario({ correo: correo, rol: 0 }, db);

        return { success: res.success };
    };

    /**
     * Verifica si un usuario está registrado en la base de datos.
     * @param {String} correo - Correo del usuario a verificar.
     * @returns JSON
     */
    const verRegistrado = async (correo) => {
        const res = await verSiEstaRegistrado(correo, db);

        if (res.success && !res.data) {
            console.log("asd")
            return await registrarUsuario(correo);
        } else if (res.success && res.data) {
            return { success: true, data: 1 };
        } else if (!res.success) {
            return { success: false, data: 0 };
        }
    };

    /**
     * Cierra la sesión del usuario.
     * @returns JSON
     */
    const cerrarSesion = async () => {
        try {
            await signOut(auth);
            setAuthInfo({ user: null, email: null, rol: null });

            return { success: true };
        } catch (error) {
            return { success: false, error };
        }
    };

    /**
     * Actualiza la información del usuario dentro del contexto.
     * @param {String} correo 
     */
    const verDatosUsuario = async (correo) => {
        const data = await verUsuario(correo, db);

        if ((data.success == 1) && (data.data != undefined)) {
            setAuthInfo({
                user: authInfo.user, email: data.data.email, rol: data.data.rol
            });
        }

        return data;
    };

    const verTokenDrive = async () => {
        return drive;
    };

    return (
        <authContext.Provider value={{ useAuth, verAuthInfo, cerrarSesion, iniciarSesionGoogle, verDatosUsuario, setAuth, setDb, verTokenDrive, setDrive }}>
            {children}
        </authContext.Provider>
    );
}