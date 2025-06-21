import { SvgIcon } from "@mui/material";

/* NOTA: No es posible importar importar los iconos como archivos SVG
   nisiquiera con el plugin "vite-plugin-svgr". No se puede personalizar
*/

/**
 * Icono para el diagnóstico de pacientes.
 * @param {JSON} props - Props predeterminadas de MUI SvgIcon
 * @returns JSX.Element
 */
export function DiagnosticoIcono(props) {
    return (
        <SvgIcon {...props}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                <path d="M540-80q-108 0-184-76t-76-184v-23q-86-14-143-80.5T80-600v-240h120v-40h80v160h-80v-40h-40v160q0 66 47 113t113 47q66 0 113-47t47-113v-160h-40v40h-80v-160h80v40h120v240q0 90-57 156.5T360-363v23q0 75 52.5 127.5T540-160q75 0 127.5-52.5T720-340v-67q-35-12-57.5-43T640-520q0-50 35-85t85-35q50 0 85 35t35 85q0 39-22.5 70T800-407v67q0 108-76 184T540-80Zm220-400q17 0 28.5-11.5T800-520q0-17-11.5-28.5T760-560q-17 0-28.5 11.5T720-520q0 17 11.5 28.5T760-480Zm0-40Z" />
            </svg>, Diagnóstico
        </SvgIcon>
    );
};

/**
 * Icono para el diagnóstico ánonimo.
 * @param {JSON} props - Props predeterminadas de MUI SvgIcon
 * @returns JSX.Element
 */
export function DiagAnonimoIcono(props) {
    return (
        <SvgIcon {...props}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                <path d="M312-240q-51 0-97.5-18T131-311q-48-45-69.5-106.5T40-545q0-78 38-126.5T189-720q14 0 26.5 2.5T241-710l239 89 239-89q13-5 25.5-7.5T771-720q73 0 111 48.5T920-545q0 66-21.5 127.5T829-311q-37 35-83.5 53T648-240q-66 0-112-30l-46-30h-20l-46 30q-46 30-112 30Zm0-80q37 0 69-17.5t59-42.5h80q27 25 59 42.5t69 17.5q36 0 69.5-12.5T777-371q34-34 48.5-80t14.5-94q0-41-17-68.5T769-640q-3 0-22 4L480-536 213-636q-5-2-10.5-3t-11.5-1q-37 0-54 27t-17 68q0 49 14.5 95t49.5 80q26 25 59 37.5t69 12.5Zm49-60q37 0 58-16.5t21-45.5q0-49-64.5-93.5T239-580q-37 0-58 16.5T160-518q0 49 64.5 93.5T361-380Zm-6-60q-38 0-82.5-25T220-516q5-2 11.5-3.5T245-521q38 0 82.5 25.5T380-444q-5 2-11.5 3t-13.5 1Zm244 61q72 0 136.5-45t64.5-94q0-29-20.5-46T721-581q-72 0-136.5 45T520-442q0 29 21 46t58 17Zm6-61q-7 0-13-1t-11-3q8-26 52.5-51t82.5-25q7 0 13 1t11 3q-8 26-52.5 51T605-440Zm-125-40Z" />
            </svg>, Diagnóstico ánonimo
        </SvgIcon>
    );
};

/**
 * Icono para el historial de pacientes.
 * @param {JSON} props - Props predeterminadas de MUI SvgIcon
 * @returns JSX.Element
 */
export function HistDiagnosticoIcono(props) {
    return (
        <SvgIcon {...props}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                <path d="M320-200h320v-80H320v80Zm0-120h320v-80H320v80Zm160-148q66-60 113-106.5t47-97.5q0-36-26-62t-62-26q-21 0-40.5 8.5T480-728q-12-15-31.5-23.5T408-760q-36 0-62 26t-26 62q0 51 45.5 96T480-468ZM720-80H240q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0 33-23.5 56.5T720-80Zm-480-80h480v-640H240v640Zm0 0v-640 640Z" />
            </svg>, Historial de diagnósticos
        </SvgIcon>
    );
};

/**
 * Icono para la lista de pacientes.
 * @param {JSON} props - Props predeterminadas de MUI SvgIcon
 * @returns JSX.Element
 */
export function ListPacienteIcono(props) {
    return (
        <SvgIcon {...props}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                <path d="M640-400q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM400-160v-76q0-21 10-40t28-30q45-27 95.5-40.5T640-360q56 0 106.5 13.5T842-306q18 11 28 30t10 40v76H400Zm86-80h308q-35-20-74-30t-80-10q-41 0-80 10t-74 30Zm154-240q17 0 28.5-11.5T680-520q0-17-11.5-28.5T640-560q-17 0-28.5 11.5T600-520q0 17 11.5 28.5T640-480Zm0-40Zm0 280ZM120-400v-80h320v80H120Zm0-320v-80h480v80H120Zm324 160H120v-80h360q-14 17-22.5 37T444-560Z" />
            </svg>, Lista de pacientes
        </SvgIcon>
    );

};