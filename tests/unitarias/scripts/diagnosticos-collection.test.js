import { jest, describe, test, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule("firebase/firestore", () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    setDoc: jest.fn(),
    where: jest.fn(),
    query: jest.fn(),
    deleteDoc: jest.fn(),
}));

const firestore = await import("firebase/firestore");
const { cambiarDiagnostico, verDiagnostico, verDiagnosticos, verDiagnosticosPorMedico, eliminarDiagnostico } = await import('../../../src/firestore/diagnosticos-collection.js');

describe("Validar la función 'cambiarDiagnostico'", () => {
    // ----------------- Parámetros -----------------
    const params1 = {
        id: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjj",
        uid: "jlasdo1212kl1jlasdo1212kl11",
        json: { id: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjj", tep: 0, paciente: "1fff-3ggg-4hhh-5iii-6jjjjjjjjjjk" },
        db: { dbname: "testDB", authentication: "testAuth" },
    };

    // ----------------- Resultado esperado -----------------
    const res1 = { success: true, data: params1.json };
    const res2 = { success: false, data: new Error("Error al cambiar el diagnóstico.") };

    // ----------------- Mocks -----------------
    const mock1 = () => params1.json;
    const mock2 = () => { throw new Error("Error al cambiar el diagnóstico."); };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each([
        ["87", mock1, params1, res1],
        ["88", mock2, params1, res2]
    ])("CP - %s", (idPrueba, mock, params, resEsperad) => {
        const { id, uid, json, db } = params;

        firestore.doc.mockReturnValue({ id: id });
        firestore.setDoc.mockImplementation(mock);

        const res = cambiarDiagnostico(id, uid, json, db);
        expect(res).resolves.toEqual(resEsperad);

        expect(firestore.doc).toHaveBeenCalledWith(db, `usuarios/${uid}/diagnosticos/${id}`);
        expect(firestore.doc).toHaveBeenCalledTimes(1);
        expect(firestore.setDoc).toHaveBeenCalledWith({ id: id }, json);
        expect(firestore.setDoc).toHaveBeenCalledTimes(1);
    })
});