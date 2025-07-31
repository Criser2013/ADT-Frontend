export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const ENTORNO = import.meta.env.VITE_ENTORNO || "0"; // 0: local, 1: production
export const DRIVE_API_URL = import.meta.env.VITE_DRIVE_API_URL || "https://www.googleapis.com/drive/v3";
export const DRIVE_UPLOAD_API_URL = import.meta.env.VITE_DRIVE_UPLOAD_API_URL || "https://www.googleapis.com/upload/drive/v3";
export const DRIVE_FILENAME = import.meta.env.VITE_DRIVE_FILENAME || "HADT - Pacientes.xlsx";
export const COMORBILIDADES = ["Enfermedad vascular", "Trombofilia", "Enfermedad renal", "Enfermedad pulmonar",
    "Diabetes", "Hipertensión arterial", "Hepatopatía crónica", "Enfermedad hematológica", "VIH", "Enfermedad cardíaca",
    "Enfermedad coronaria", "Enfermedad endocrina", "Enfermedad gastrointestinal", "Enfermedad urológica", "Enfermedad neurológica",
];
export const EXPORT_FILENAME = `HADT Diagnósticos — `;
export const DRIVE_FOLDER_NAME = import.meta.env.VITE_DRIVE_FOLDER_NAME || "HADT: Herramienta para apoyar el diagnóstico de TEP";
export const SEXOS = [
    { texto: "Seleccione el sexo", val: 2 },
    { texto: "Masculino", val: 0 },
    { texto: "Femenino", val: 1 }
];
export const CODIGO_ADMIN = 1001;
export const SINTOMAS = [
    { texto: "Fumador", nombre: "fumador" },
    { texto: "Bebedor", nombre: "bebedor" },
    { texto: "Tos", nombre: "tos" },
    { texto: "Fiebre", nombre: "fiebre" },
    { texto: "Edema de miembros inferiores", nombre: "edema" },
    { texto: "Inmovilidad de miembros inferiores", nombre: "inmovilidad" },
    { texto: "Procedimiento quirúrgico reciente", nombre: "cirugiaReciente" },
    { texto: "Síntomas disautonómicos", nombre: "disautonomicos" },
    { texto: "Viaje prolongado", nombre: "viajeProlongado" },
    { texto: "Disnea", nombre: "disnea" },
    { texto: "Sibilancias", nombre: "sibilancias" },
    { texto: "Crepitaciones", nombre: "crepitaciones" },
    { texto: "Derrame", nombre: "derrame" },
    { texto: "Malignidad", nombre: "malignidad" },
    { texto: "Hemoptisis", nombre: "hemoptisis" },
    { texto: "Dolor torácico", nombre: "dolorToracico" },
    { texto: "TEP - TVP previo", nombre: "tepPrevio" },
    { texto: "Soplos", nombre: "soplos" }
];
export const DIAGNOSTICOS = [
    { valor: 2, texto: "Seleccione el diagnóstico" },
    { valor: 0, texto: "Negativo" },
    { valor: 1, texto: "Positivo" }
];