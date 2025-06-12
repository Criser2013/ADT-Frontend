import { signOut } from "firebase/auth";
import { createContext, useState, useContext, useEffect } from "react";
import { auth } from "../../firebase.config";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getUser, setUser, isAnAccountRegistered } from "../firebase/user-collection";


export const authContext = createContext();

export const useAuth = () => {
    const context = useContext(authContext);
    if (!context) {
        console.log("Error creando el contexto.");
    }
    return context;
}

export function AuthProvider({ children }) {
    const [authInfo, setAuthInfo] = useState({
        user: null, correo: null, rol: null
    });

    /**
     * Recupera la sesión si el usuario no la cerrado.
     */
    useEffect(() => {
        const suscribed = onAuthStateChanged(auth, (currentUser) => {
            !currentUser ?
                setAuthInfo({ user: null, correo: null, rol: null }) :
                setAuthInfo({ user: currentUser, correo: currentUser.email, rol: null });
        });
        return () => suscribed();
    }, []);

    /**
     * Si el usuario ya está autenticado, obtiene sus datos.
     */
    useEffect(() => {
        if (authInfo.user != null) {
            getUserData(authInfo.user.email);
        }
    }, [authInfo.user]);

    /**
     * Retorna la información de autenticación (instancia de Firebase, correo, rol, nivel).
     * @returns JSON
     */
    const getAuthInfo = () => {
        return authInfo;
    };

    /**
     * Registra un usuario dentro de la aplicación.
     * @param {JSON} user
     * @returns JSON
     */
    const signUp = async (email, plan, cedula, nombre, fechaNacimiento, sexo, altura = 0, peso = 0, administrador = false, user = null) => {
        const exists = await isAnAccountRegistered(email);

        switch (exists) {
            case undefined:
                return { success: false, data: "1" };
            case true:
                logOut();
                return { success: false, data: "-1" };
            case false:
                const res = await setUser({
                    email: email,
                    administrador: administrador,
                    plan: plan,
                    cedula: cedula,
                    nombre: nombre,
                    altura: altura,
                    peso: peso,
                    fechaNacimiento: fechaNacimiento,
                    sexo: sexo
                });

                if (res.success) {
                    setAuthInfo({
                        user: user, email: email, administrador: administrador, plan: plan, cedula: cedula,
                        altura: altura, peso: peso, nacimiento: fechaNacimiento, nombre: nombre, sexo: sexo
                    });
                }

                return res
        }
    };

    /**
     * Inicia sesión con Google dentro de Firebase.
     * @returns JSON
     */
    const loginGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const res = await signInWithPopup(auth, provider)

            setAuthInfo({ ...authInfo, user: res.user });

            return { success: true, user: res.user };
        } catch (error) {
            return { success: false, error: error };
        }
    };

    /**
     * Cierra la sesión del usuario.
     * @returns JSON
     */
    const logOut = async () => {
        try {
            await signOut(auth);
            setAuthInfo({ user: null, email: null, administrador: null, plan: null, cedula: null,
                altura: null, peso: null, nacimiento: null, nombre: null, sexo: null });
            return { success: true };
        } catch (error) {
            return { success: false, error };
        }
    };

    /**
     * Determina si ya existe una cuenta registrada con el correo.
     * @param {String} email 
     * @returns boolean | undefined
     */
    const isRegistered = async (email) => {
        const exists = await isAnAccountRegistered(email);

        if ((exists != undefined) && !exists) {
            logOut();
        }

        return exists;
    };

    /**
     * Actualiza la información del usuario dentro del contexto.
     * @param {String} email 
     */
    const getUserData = async (email) => {
        const data = await getUser(email);

        if ((data.success == 1) && (data.data != undefined)) {
            setAuthInfo({
                user: authInfo.user, email: data.data.email, administrador: data.data.administrador, plan: data.data.plan, cedula: data.data.cedula,
                altura: data.data.altura, peso: data.data.peso, nacimiento: data.data.fechaNacimiento, nombre: data.data.nombre,
                sexo: data.data.sexo
            });
        }

        return data;
    };

    return (
        <authContext.Provider value={{ useAuth, getAuthInfo, logOut, loginGoogle, signUp, isRegistered, getUserData }}>
            {children}
        </authContext.Provider>
    );
}