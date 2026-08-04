export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const DRIVE_API_URL = import.meta.env.VITE_DRIVE_API_URL || "https://www.googleapis.com/drive/v3";
export const DRIVE_UPLOAD_API_URL = import.meta.env.VITE_DRIVE_UPLOAD_API_URL || "https://www.googleapis.com/upload/drive/v3";
export const DRIVE_FILENAME = import.meta.env.VITE_DRIVE_FILENAME || "HADT - Pacientes.xlsx";
export const DRIVE_FOLDER_NAME = import.meta.env.VITE_DRIVE_FOLDER_NAME || "HADT: Herramienta para apoyar el diagnóstico de TEP";
export const URL_MANUAL_USUARIO = import.meta.env.VITE_URL_MANUAL_USUARIO || "https://www.youtube.com";
export const URL_MANUAL_ADMIN = import.meta.env.VITE_URL_MANUAL_ADMIN || "https://www.google.com";
export const CANT_LIM_DIAGNOSTICOS = parseInt(import.meta.env.VITE_CANT_LIM_DIAGNOSTICOS) || 1500;
export const SEXOS = [
    { texto: "txtSelecSexo", val: 2 },
    { texto: "txtMasculino", val: 0 },
    { texto: "txtFemenino", val: 1 }
];
export const URL_CONDICIONES = import.meta.env.VITE_URL_CONDICIONES || "https://google.com";
export const CAMPOS_BIN = [
    "fumador", "bebedor", "tos", "fiebre", "crepitaciones",
    "dolor_toracico", "malignidad", "hemoptisis", "disnea", "sibilancias",
    "derrame", "TEP_TVP_previo", "edema_de_m_inferiores", "sintomas_disautonomicos", "inmovilidad_de_m_inferiores",
    "viaje_prolongado", "proc_quirurgico_traumatismo", "soplos"
];
export const CAMPOS_DECIMALES = ["saturacion_de_la_sangre", "plt", "hb", "wbc"];
export const CAMPOS_ENTEROS = ["edad", "presion_sistolica", "presion_diastolica", "frecuencia_respiratoria",
    "frecuencia_cardiaca"
];
export const CAMPOS_NUM = [...CAMPOS_DECIMALES, ...CAMPOS_ENTEROS];
export const COMORBILIDADES = ["Enfermedad vascular", "Trombofilia", "Enfermedad renal", "Enfermedad pulmonar",
    "Diabetes Mellitus", "Hipertensión arterial", "Hepatopatía crónica", "Enfermedad hematológica", "VIH", "Enfermedad cardíaca",
    "Enfermedad coronaria", "Enfermedad endocrina", "Enfermedad gastrointestinal", "Enfermedad urológica", "Enfermedad neurológica",
];

export const INTERVALOS_PREPROCESAMIENTO = {
    edad: [[0, 20, 0], [20, 41, 1], [41, 61, 2], [61, 81, 3], [81, Infinity, 4]],
    frecuencia_cardiaca: [
        [50, 70, 1], [70, 90, 2], [90, 110, 3], [110, 130, 4], [130, 150, 5], [150, 170, 6],
        [170, 190, 7], [190, 210, 8], [-Infinity, 50, 9], [210, Infinity, 10]
    ],
    saturacion_de_la_sangre: [
        [50, 55, 1], [55, 60, 2], [60, 65, 3], [65, 70, 4], [70, 75, 5],
        [75, 80, 6], [80, 85, 7], [85, 90, 8], [90, 95, 9], [95, 100, 10],
        [-Infinity, 50, 11], [100, Infinity, 12]
    ],
    frecuencia_respiratoria: [
        [15, 20, 1], [20, 25, 2], [25, 30, 3], [30, 35, 4], [35, 40, 5],
        [40, 45, 6], [45, 50, 7], [50, 55, 8], [55, 60, 9], [-Infinity, 15, 10],
        [60, Infinity, 11]
    ],
    plt: [
        [10000, 50000, 1], [50000, 100000, 2], [100000, 150000, 3],
        [150000, 400000, 4], [400000, 500000, 5], [500000, 600000, 6],
        [600000, 700000, 7], [-Infinity, 10000, 9], [700000, Infinity, 10]
    ],
    hb: [
        [6, 8, 1], [8, 10, 2], [10, 12, 3], [12, 14, 4], [14, 16, 5],
        [16, 18, 6], [18, 20, 7], [20, 22, 8], [-Infinity, 6, 9], [22, Infinity, 10]
    ],
    wbc: [
        [2000, 4000, 1], [4000, 10000, 2], [10000, 15000, 3],
        [15000, 20000, 4], [20000, 30000, 5], [30000, 35000, 6],
        [-Infinity, 2000, 7], [35000, Infinity, 7]
    ],
    presion_diastolica: [
        [40, 50, 1], [50, 60, 2], [60, 70, 3], [70, 80, 4],
        [80, 90, 5], [90, 100, 6], [100, 110, 7], [110, 120, 8],
        [-Infinity, 40, 9], [120, Infinity, 10]
    ],
    presion_sistolica: [
        [50, 70, 1], [70, 90, 2], [90, 110, 3], [110, 130, 4],
        [130, 150, 5], [150, 170, 6], [170, 190, 7], [190, 210, 8],
        [-Infinity, 50, 9], [210, Infinity, 10]
    ]
};
const TXT_MESES = ["txtEnero", "txtFebrero", "txtMarzo", "txtAbril", "txtMayo", "txtJunio",
    "txtJulio", "txtAgosto", "txtSeptiembre", "txtOctubre", "txtNoviembre", "txtDiciembre"
];


export const AES_KEY = import.meta.env.VITE_CLAVE_AES || "1234567890123456"; // Clave de 16 caracteres para AES-128