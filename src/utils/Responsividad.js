/**
     * Determinar si el menú debe abrirse o no dependiendo del dispositivo y la orientación.
     * @param {Boolean} mostrarMenu - Estado del menú
     * @param {Boolean} dispositivoMovil - Si el usuario está en un dispositivo móvil
     * @param {String} orientacion - Orientación de la pantalla ("horizontal" o
     * @returns {Boolean}
     */
export function detAbrirMenu(mostrarMenu, dispositivoMovil, orientacion) {
    if (!mostrarMenu && (dispositivoMovil && orientacion == "vertical")) {
        return false;
    } else {
        return !mostrarMenu && (!dispositivoMovil || (dispositivoMovil && orientacion == "horizontal"));
    }
};

/**
 * Determina el tamaño del contenedor de carga dependiendo del dispositivo y la orientación.
 * @param {Boolean} dispositivoMovil - Si el usuario está en un dispositivo móvil
 * @param {String} orientacion - Orientación de la pantalla ("horizontal" o "vertical")
 * @param {Boolean} mostrarMenu - Si el menú lateral está visible
 * @returns {Number}
 */
export function detTamCarga(dispositivoMovil, orientacion, mostrarMenu, ancho) {
    if (dispositivoMovil && orientacion == "vertical") {
        return ancho * 0.92;
    } else if ((!dispositivoMovil || (dispositivoMovil && orientacion == "horizontal")) && !mostrarMenu) {
        return ancho * 0.92;
    } else {
        return ancho * 0.95 - 240;
    }
};