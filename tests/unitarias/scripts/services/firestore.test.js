import { jest, describe, test, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule("firebase/firestore", () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    setDoc: jest.fn(),
    where: jest.fn(),
    query: jest.fn(),
    deleteDoc: jest.fn()
}));

const firestore = await import("firebase/firestore");
const { cambiarDiagnostico, verDiagnostico, verDiagnosticos, verDiagnosticosPorMedico, eliminarDiagnostico } = await import('../../../../src/services/Firestore');

describe("Validar la función 'cambiarDiagnostico'", () => {
    // ----------------- Parámetros -----------------
    const params1 = {
        id: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjj",
        uid: "jlasdo1212kl1jlasdo1212kl11",
        json: { id: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjj", tep: 0, paciente: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjk" },
        db: { dbname: "testDB", authentication: "testAuth" },
    };

    // ----------------- Resultado esperado -----------------
    const res1 = { success: true, data: params1.json  };
    const res2 = { success: false, error: new Error("Error al cambiar el diagnóstico.") };

    // ----------------- Mocks -----------------
    const mock1 = () => params1.json;
    const mock2 = () => { throw new Error("Error al cambiar el diagnóstico."); };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each([
        ["87", mock1, params1, res1],
        ["88", mock2, params1, res2]
    ])("CP - %s", async (idPrueba, mock, params, resEsperad) => {
        const { id, uid, json, db } = params;

        firestore.doc.mockReturnValue({ id: id });
        firestore.setDoc.mockImplementation(mock);

        const res = await cambiarDiagnostico(id, uid, json, db);
        expect(res).toEqual(resEsperad);

        expect(firestore.doc).toHaveBeenCalledWith(db, `usuarios/${uid}/diagnosticos/${id}`);
        expect(firestore.doc).toHaveBeenCalledTimes(1);
        expect(firestore.setDoc).toHaveBeenCalledWith({ id: id }, json);
        expect(firestore.setDoc).toHaveBeenCalledTimes(1);
    })
});

describe("Validar la función 'verDiagnostico'", () => {
    // ----------------- Parámetros -----------------
    const params1 = {
        id: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjj",
        uid: "jlasdo1212kl1jlasdo1212kl11",
        db: { dbname: "testDB", authentication: "testAuth" }
    };

    // ----------------- Resultado esperado -----------------
    const res1 = {
        success: true,
        data: { id: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjj", usuario: "jlasdo1212kl1jlasdo1212kl11", tep: 0, paciente: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjk" },
        
    };
    const res2 = { success: false, error: "El diagnóstico no existe." };
    const res3 = { success: false, error: new Error("Error al obtener el diagnóstico.") };

    // ----------------- Mocks -----------------
    const mock1 = () => ({ exists: () => true, data: () => res1.data, id: params1.id });
    const mock2 = () => ({ exists: () => false });
    const mock3 = () => { throw new Error("Error al obtener el diagnóstico."); };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each([
        ["92", mock1, params1, res1],
        ["93", mock2, params1, res2],
        ["94", mock3, params1, res3]
    ])("CP %s", async (idPrueba, mock, params, resEsperado) => {
        const { id, uid, db } = params;

        firestore.doc.mockImplementation((x, y) => y);
        firestore.getDoc.mockImplementation(mock);

        const res = await verDiagnostico(id, uid, db);
        expect(res).toEqual(resEsperado);

        expect(firestore.doc).toHaveBeenCalledWith(db, `usuarios/${uid}/diagnosticos/${id}`);
        expect(firestore.doc).toHaveBeenCalledTimes(1);
        expect(firestore.getDoc).toHaveBeenCalledWith(`usuarios/${uid}/diagnosticos/${id}`);
        expect(firestore.getDoc).toHaveBeenCalledTimes(1);
    });
});

describe("Validar la función 'verDiagnosticos'", () => {
    // ----------------- Parámetros -----------------
    const params1 = {
        usuarios: ["jlasdo1212kl11", "jlasdo1212kl12"],
        db: { dbname: "testDB", authentication: "testAuth" }
    };

    // ----------------- Resultado esperado -----------------
    const res1 = {
        success: true,
        data: [
            { id: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjj-jlasdo1212kl11", usuario: "jlasdo1212kl11", tep: 0, paciente: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjk" },
            { id: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjj-jlasdo1212kl11", usuario: "jlasdo1212kl11", tep: 0, paciente: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjk" },
        ]
    };
    const res2 = { success: false, error: new Error("Error al obtener los diagnósticos.") };

    // ----------------- Mocks -----------------
    const mock1 = () => ({
        forEach: (callback) => {
            callback({ id: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjj-jlasdo1212kl11", data: () => res1.data[0] });
        }
    });
    const mock2 = () => { throw new Error("Error al obtener los diagnósticos."); };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each([
        ["95", mock1, params1, res1],
        ["96", mock2, params1, res2]
    ])("CP - %s", async (idPrueba, mock, params, resEsperado) => {
        const { usuarios, db } = params;

        firestore.collection.mockImplementation((x, y) => y);
        firestore.getDocs.mockImplementation(mock);

        const res = await verDiagnosticos(usuarios, db);
        expect(res).toEqual(resEsperado);
        expect(firestore.collection).toHaveBeenCalledWith(db, `usuarios/${usuarios[0]}/diagnosticos`);
        expect(firestore.collection).toHaveBeenCalledTimes(res.success ? 2 : 1);
        expect(firestore.getDocs).toHaveBeenCalledWith(`usuarios/${usuarios[0]}/diagnosticos`);
        expect(firestore.getDocs).toHaveBeenCalledTimes(res.success ? 2 : 1);

        if (res.success) {
            expect(firestore.getDocs).toHaveBeenCalledWith(`usuarios/${usuarios[1]}/diagnosticos`);
            expect(firestore.collection).toHaveBeenCalledWith(db, `usuarios/${usuarios[1]}/diagnosticos`);
        }
    });
});

describe("Validar la función 'verDiagnosticosPorMedico'", () => {
    // ----------------- Parámetros -----------------
    const params1 = {
        uid: "jlasdo1212kl11",
        db: { dbname: "testDB", authentication: "testAuth" },
        fecha: null
    };
    const params2 = {
        uid: "jlasdo1212kl11",
        db: { dbname: "testDB", authentication: "testAuth" },
        fecha: new Date("2024-01-01")
    };

    // ----------------- Resultado esperado -----------------
    const res1 = {
        success: true, data: [
            { id: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjj-jlasdo1212kl11", usuario: "jlasdo1212kl11", tep: 0, paciente: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjk" },
            { id: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjja-jlasdo1212kl11", usuario: "jlasdo1212kl11", tep: 0, paciente: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjl" }
        ]
    };
    const res2 = { success: false, error: new Error("Error al obtener los diagnósticos del médico.") };
    const res3 = {
        success: true, data: [
            { id: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjj-jlasdo1212kl11", usuario: "jlasdo1212kl11", tep: 0, paciente: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjk" }
        ]
    };

    // ----------------- Mocks -----------------
    const mock1 = () => ({
        forEach: (callback) => {
            callback({ id: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjj-jlasdo1212kl11", data: () => res1.data[0] });
            callback({ id: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjja-jlasdo1212kl11", data: () => res1.data[1] });
        }
    });
    const mock2 = () => { throw new Error("Error al obtener los diagnósticos del médico."); };
    const mock3 = () => ({
        forEach: (callback) => {
            callback({ id: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjj-jlasdo1212kl11", data: () => res1.data[0] });
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each([
        ["97", mock1, params1, res1],
        ["98", mock2, params1, res2],
        ["99", mock3, params2, res3]
    ])("CP - %s", async (idPrueba, mock, params, resEsperado) => {
        const { uid, db, fecha } = params;

        firestore.collection.mockImplementation((x, y) => y);
        firestore.query.mockImplementation((x, y) => `${x}-${y}`);
        firestore.where.mockImplementation((x, y, z) => `${x}-${y}-${z.toString()}`);
        firestore.getDocs.mockImplementation(mock);

        const res = await verDiagnosticosPorMedico(uid, db, fecha);
        expect(res).toEqual(resEsperado);
        expect(firestore.collection).toHaveBeenCalledWith(db, `usuarios/${uid}/diagnosticos`);
        expect(firestore.collection).toHaveBeenCalledTimes(1);
        expect(firestore.getDocs).toHaveBeenCalledWith(fecha ? `usuarios/${uid}/diagnosticos-fecha->=-${fecha.toString()}` : `usuarios/${uid}/diagnosticos`);
        expect(firestore.getDocs).toHaveBeenCalledTimes(1);

        if (fecha) {
            expect(firestore.query).toHaveBeenCalledWith(`usuarios/${uid}/diagnosticos`, `fecha->=-${fecha.toString()}`);
            expect(firestore.query).toHaveBeenCalledTimes(1);
            expect(firestore.where).toHaveBeenCalledWith("fecha", ">=", fecha);
            expect(firestore.where).toHaveBeenCalledTimes(1);
        }
    });
});

describe("Validar la función 'eliminarDiagnostico'", () => {
    // ----------------- Parámetros -----------------
    const params1 = {
        id: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjj",
        uid: "jlasdo1212kl1jlasdo1212kl11",
        db: { dbname: "testDB", authentication: "testAuth" }
    };

    // ----------------- Resultado esperado -----------------
    const res1 = { success: true };
    const res2 = { success: false, error: new Error("Error al eliminar el diagnóstico.") };

    // ----------------- Mocks -----------------
    const mock1 = () => Promise.resolve(true);
    const mock2 = () => { throw new Error("Error al eliminar el diagnóstico."); };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each([
        ["100", mock1, params1, res1],
        ["101", mock2, params1, res2]
    ])("CP - %s", async (idPrueba, mock, params, resEsperado) => {
        const { id, uid, db } = params;

        firestore.doc.mockReturnValue({ id: id });
        firestore.deleteDoc.mockImplementation(mock);

        const res = await eliminarDiagnostico(id, uid, db);
        expect(res).toEqual(resEsperado);
        expect(firestore.doc).toHaveBeenCalledWith(db, `usuarios/${uid}/diagnosticos/${id}`);
        expect(firestore.doc).toHaveBeenCalledTimes(1);
        expect(firestore.deleteDoc).toHaveBeenCalledWith({ id: id });
        expect(firestore.deleteDoc).toHaveBeenCalledTimes(1);
    });
});