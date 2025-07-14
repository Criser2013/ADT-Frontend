const fecha = new Date().toDateString().replaceAll(":", "-");

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const ENTORNO = import.meta.env.VITE_ENTORNO || "0"; // 0: local, 1: production
export const DRIVE_API_URL = import.meta.env.VITE_DRIVE_API_URL || "https://www.googleapis.com/drive/v3";
export const DRIVE_UPLOAD_API_URL = import.meta.env.VITE_DRIVE_UPLOAD_API_URL || "https://www.googleapis.com/upload/drive/v3";
export const DRIVE_FILENAME = import.meta.env.VITE_DRIVE_FILENAME || "HADT - Pacientes.xlsx";
export const COMORBILIDADES = ["Enfermedad vascular", "Trombofilia", "Enfermedad renal", "Enfermedad pulmonar",
    "Diabetes", "Hipertensión arterial", "Hepatopatía crónica", "Enfermedad hematológica", "VIH", "Enfermedad cardíaca",
    "Enfermedad coronaria", "Enfermedad endocrina", "Enfermedad gastrointestinal", "Enfermedad urológica", "Enfermedad neurológica",
];
export const EXPORT_FILENAME = `HADT Diagnósticos — ${fecha}.xlsx`;
export const DRIVE_FOLDER_NAME = import.meta.env.VITE_DRIVE_FOLDER_NAME || "HADT: Herramienta para apoyar el diagnóstico de TEP";